import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  toProductDetail,
  toProductListItem,
  toProductVariant,
} from './product.presenter';
import { ProductsService } from './products.service';

@ApiTags('Admin Products')
@ApiCookieAuth('access_token')
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List admin products' })
  async listProducts(@Query() query: ListAdminProductsQueryDto) {
    const data = await this.productsService.listAdminProducts(query);

    return {
      data: {
        ...data,
        items: data.items.map((product) => toProductListItem(product)),
      },
      message: 'Products retrieved successfully',
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create product' })
  async createProduct(@Body() dto: CreateProductDto) {
    const product = await this.productsService.createProduct(dto);

    return {
      data: toProductDetail(product),
      message: 'Product created successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin product detail' })
  async getProduct(@Param('id') id: string) {
    const product = await this.productsService.getAdminProductById(id);

    return {
      data: toProductDetail(product),
      message: 'Product retrieved successfully',
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product' })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.updateProduct(id, dto);

    return {
      data: toProductDetail(product),
      message: 'Product updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete product' })
  async deleteProduct(@Param('id') id: string) {
    const product = await this.productsService.softDeleteProduct(id);

    return {
      data: toProductDetail(product),
      message: 'Product deleted successfully',
    };
  }

  @Get(':productId/variants')
  @ApiOperation({ summary: 'List product variants' })
  async listVariants(@Param('productId') productId: string) {
    const variants = await this.productsService.listProductVariants(productId);

    return {
      data: variants.map((variant) => toProductVariant(variant)),
      message: 'Product variants retrieved successfully',
    };
  }

  @Post(':productId/variants')
  @ApiOperation({ summary: 'Create product variant' })
  async createVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateProductVariantDto,
  ) {
    const variant = await this.productsService.createProductVariant(
      productId,
      dto,
    );

    return {
      data: toProductVariant(variant),
      message: 'Product variant created successfully',
    };
  }
}
