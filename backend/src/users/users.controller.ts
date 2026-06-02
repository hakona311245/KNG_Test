import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateCustomerStatusDto } from './dto/update-customer-status.dto';
import { toPublicUser } from './user.presenter';
import { UsersService } from './users.service';

@ApiTags('Admin Customers')
@ApiCookieAuth('access_token')
@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers' })
  async listCustomers(
    @Query('status') status?: UserStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.usersService.listCustomers(
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
    return {
      data: {
        ...data,
        items: data.items.map((user) => toPublicUser(user)),
      },
      message: 'Customers retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer detail' })
  async getCustomer(@Param('id') id: string) {
    const user = await this.usersService.getCustomerById(id);
    return {
      data: toPublicUser(user),
      message: 'Customer retrieved successfully',
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update customer status' })
  async updateCustomerStatus(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerStatusDto,
  ) {
    const user = await this.usersService.updateCustomerStatus(id, dto.status);
    return {
      data: toPublicUser(user),
      message: 'Customer status updated successfully',
    };
  }
}
