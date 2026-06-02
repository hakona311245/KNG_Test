import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../generated/prisma/client';
import { RolesGuard } from './roles.guard';

jest.mock('../../../generated/prisma/client', () => ({
  UserRole: {
    CUSTOMER: 'CUSTOMER',
    ADMIN: 'ADMIN',
  },
}));

function createContext(role: UserRole): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          id: 'user-1',
          email: 'user@example.com',
          role,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('rejects a customer from admin-only endpoints', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createContext(UserRole.CUSTOMER))).toThrow(
      ForbiddenException,
    );
  });

  it('allows an admin on admin-only endpoints', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(UserRole.ADMIN))).toBe(true);
  });
});
