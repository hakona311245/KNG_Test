import { Body, Controller, Delete, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { toProductVariant } from './product.presenter';
import { ProductsService } from './products.service';

@ApiTags('Admin Product Variants')
@ApiCookieAuth('access_token')
@Controller('admin/variants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminVariantsController {
  constructor(private readonly productsService: ProductsService) {}

  @Patch(':variantId')
  @ApiOperation({ summary: 'Update product variant' })
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    const variant = await this.productsService.updateProductVariant(
      variantId,
      dto,
    );

    return {
      data: toProductVariant(variant),
      message: 'Product variant updated successfully',
    };
  }

  @Delete(':variantId')
  @ApiOperation({ summary: 'Soft delete product variant' })
  async deleteVariant(@Param('variantId') variantId: string) {
    const variant = await this.productsService.softDeleteProductVariant(
      variantId,
    );

    return {
      data: toProductVariant(variant),
      message: 'Product variant deleted successfully',
    };
  }
}
