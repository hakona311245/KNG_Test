import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type {
  User,
} from '../../generated/prisma/client';
import {
  UserRole,
  UserStatus,
} from '../../generated/prisma/client';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from './auth.constants';
import { AuthService } from './auth.service';

jest.mock('../../generated/prisma/client', () => ({
  PrismaClient: class {},
  UserRole: {
    CUSTOMER: 'CUSTOMER',
    ADMIN: 'ADMIN',
  },
  UserStatus: {
    ACTIVE: 'ACTIVE',
    BLOCKED: 'BLOCKED',
    INACTIVE: 'INACTIVE',
  },
}));

const now = new Date('2026-06-03T00:00:00.000Z');

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'customer@example.com',
    fullName: 'Customer One',
    passwordHash: 'password-hash',
    phoneNumber: '0900000000',
    role: UserRole.CUSTOMER,
    status: UserStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

describe('AuthService', () => {
  let prisma: {
    refreshSession: {
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };
  let usersService: {
    createCustomer: jest.Mock;
    findByEmail: jest.Mock;
    findById: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let service: AuthService;
  let response: {
    cookie: jest.Mock;
    clearCookie: jest.Mock;
  };

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
    process.env.COOKIE_SECURE = 'false';
    process.env.COOKIE_SAME_SITE = 'lax';

    prisma = {
      refreshSession: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };
    usersService = {
      createCustomer: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn((payload: { email?: string; sessionId?: string }) =>
        Promise.resolve(payload.email ? 'access-token' : `refresh-token-${payload.sessionId}`),
      ),
      verifyAsync: jest.fn(),
    };
    response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    service = new AuthService(
      prisma as never,
      usersService as never,
      jwtService as never,
    );
  });

  it('registers a customer and does not return passwordHash', async () => {
    const user = createUser();
    usersService.createCustomer.mockResolvedValue(user);

    const result = await service.register({
      email: user.email,
      fullName: user.fullName,
      password: 'Password123',
      phoneNumber: user.phoneNumber,
    });

    expect(usersService.createCustomer).toHaveBeenCalledWith({
      email: user.email,
      fullName: user.fullName,
      passwordHash: expect.any(String),
      phoneNumber: user.phoneNumber,
    });
    await expect(
      bcrypt.compare(
        'Password123',
        usersService.createCustomer.mock.calls[0][0].passwordHash,
      ),
    ).resolves.toBe(true);
    expect(result).toEqual({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
    });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('logs in with valid credentials and sets HttpOnly auth cookies', async () => {
    const user = createUser({
      passwordHash: await bcrypt.hash('Password123', 4),
    });
    usersService.findByEmail.mockResolvedValue(user);
    prisma.refreshSession.create.mockResolvedValue({ id: 'session-1' });
    prisma.refreshSession.update.mockResolvedValue({});

    const result = await service.login(
      { email: user.email, password: 'Password123' },
      response as never,
    );

    expect(result.user).not.toHaveProperty('passwordHash');
    expect(prisma.refreshSession.create).toHaveBeenCalledWith({
      data: {
        userId: user.id,
        refreshTokenHash: '',
        expiresAt: expect.any(Date),
      },
    });
    expect(response.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      'access-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false,
      }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      'refresh-token-session-1',
      expect.objectContaining({
        httpOnly: true,
        path: '/api/auth',
      }),
    );
  });

  it('rejects login with a wrong password', async () => {
    usersService.findByEmail.mockResolvedValue(
      createUser({ passwordHash: await bcrypt.hash('Password123', 4) }),
    );

    await expect(
      service.login(
        { email: 'customer@example.com', password: 'WrongPassword123' },
        response as never,
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(response.cookie).not.toHaveBeenCalled();
  });

  it.each([UserStatus.BLOCKED, UserStatus.INACTIVE])(
    'rejects login for %s users',
    async (status) => {
      usersService.findByEmail.mockResolvedValue(
        createUser({
          status,
          passwordHash: await bcrypt.hash('Password123', 4),
        }),
      );

      await expect(
        service.login(
          { email: 'customer@example.com', password: 'Password123' },
          response as never,
        ),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(response.cookie).not.toHaveBeenCalled();
    },
  );

  it('rotates refresh sessions and issues new cookies', async () => {
    const user = createUser();
    const refreshToken = 'old-refresh-token';
    const oldSession = {
      id: 'session-old',
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(refreshToken, 4),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      createdAt: now,
      updatedAt: now,
      user,
    };
    jwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
      sessionId: oldSession.id,
      type: 'refresh',
    });
    prisma.refreshSession.findUnique.mockResolvedValue(oldSession);
    prisma.refreshSession.create.mockResolvedValue({ id: 'session-new' });
    prisma.refreshSession.update.mockResolvedValue({});

    await service.refresh(refreshToken, response as never);

    expect(prisma.refreshSession.update).toHaveBeenCalledWith({
      where: { id: oldSession.id },
      data: { revokedAt: expect.any(Date) },
    });
    expect(prisma.refreshSession.create).toHaveBeenCalledWith({
      data: {
        userId: user.id,
        refreshTokenHash: '',
        expiresAt: expect.any(Date),
      },
    });
    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      'refresh-token-session-new',
      expect.objectContaining({ path: '/api/auth', httpOnly: true }),
    );
  });

  it('clears cookies and revokes the refresh session on logout', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      sessionId: 'session-1',
      type: 'refresh',
    });

    await service.logout('refresh-token-session-1', response as never);

    expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'session-1',
        revokedAt: null,
      },
      data: { revokedAt: expect.any(Date) },
    });
    expect(response.clearCookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      expect.objectContaining({ path: '/' }),
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      expect.objectContaining({ path: '/api/auth' }),
    );
  });

  it('returns the current user without sensitive fields', async () => {
    const user = createUser();
    usersService.findById.mockResolvedValue(user);

    const result = await service.getCurrentUser(user.id);

    expect(result).toEqual({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      status: user.status,
    });
    expect(result).not.toHaveProperty('passwordHash');
  });
});
