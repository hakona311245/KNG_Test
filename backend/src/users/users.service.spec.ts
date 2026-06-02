import { ConflictException } from '@nestjs/common';
import type {
  User,
} from '../../generated/prisma/client';
import {
  UserRole,
  UserStatus,
} from '../../generated/prisma/client';
import { UsersService } from './users.service';

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

describe('UsersService', () => {
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new UsersService(prisma as never);
  });

  it('rejects duplicate customer email registration', async () => {
    prisma.user.findUnique.mockResolvedValue(createUser());

    await expect(
      service.createCustomer({
        email: 'customer@example.com',
        fullName: 'Customer One',
        passwordHash: 'hash',
        phoneNumber: '0900000000',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('creates customers as active customer accounts', async () => {
    const user = createUser();
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);

    await service.createCustomer({
      email: user.email,
      fullName: user.fullName,
      passwordHash: user.passwordHash,
      phoneNumber: user.phoneNumber,
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: user.email,
        fullName: user.fullName,
        passwordHash: user.passwordHash,
        phoneNumber: user.phoneNumber,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });
  });

  it('updates customer status without deleting the account', async () => {
    const user = createUser();
    prisma.user.findFirst.mockResolvedValue(user);
    prisma.user.update.mockResolvedValue(
      createUser({ status: UserStatus.BLOCKED }),
    );

    await service.updateCustomerStatus(user.id, UserStatus.BLOCKED);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { status: UserStatus.BLOCKED },
    });
  });
});
