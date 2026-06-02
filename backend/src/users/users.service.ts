import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole, UserStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type CreateCustomerInput = {
  email: string;
  fullName: string;
  passwordHash: string;
  phoneNumber: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(input: CreateCustomerInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    return this.prisma.user.create({
      data: {
        email: input.email,
        fullName: input.fullName,
        passwordHash: input.passwordHash,
        phoneNumber: input.phoneNumber,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async listCustomers(status?: UserStatus, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where = {
      role: UserRole.CUSTOMER,
      deletedAt: null,
      ...(status ? { status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  async getCustomerById(id: string) {
    const customer = await this.prisma.user.findFirst({
      where: {
        id,
        role: UserRole.CUSTOMER,
        deletedAt: null,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found.');
    }

    return customer;
  }

  async updateCustomerStatus(id: string, status: UserStatus) {
    await this.getCustomerById(id);

    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }
}
