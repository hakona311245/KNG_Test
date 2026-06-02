import { UserRole, UserStatus } from '../../../generated/prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};
