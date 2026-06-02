import { User } from '../../generated/prisma/client';

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
  };
}
