import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, UserStatus } from '../generated/prisma/client';

const SALT_ROUNDS = 12;

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is required to seed the database.');
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULL_NAME ?? 'KNG Admin';
  const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER ?? '0900000000';

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed admin.');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: adminFullName,
      phoneNumber: adminPhoneNumber,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      deletedAt: null,
    },
    create: {
      email: adminEmail,
      fullName: adminFullName,
      phoneNumber: adminPhoneNumber,
      passwordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
