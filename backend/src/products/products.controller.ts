import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { toProductDetail, toProductListItem } from './product.presenter';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products' })
  async listProducts(@Query() query: ListProductsQueryDto) {
    const data = await this.productsService.listProducts(query);

    return {
      data: {
        ...data,
        items: data.items.map((product) => toProductListItem(product)),
      },
      message: 'Products retrieved successfully',
    };
  }

  @Get('options')
  @ApiOperation({ summary: 'Get product options' })
  getOptions() {
    return {
      data: this.productsService.getOptions(),
      message: 'Product options retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product detail' })
  async getProduct(@Param('id') id: string) {
    const product = await this.productsService.getProductDetail(id);

    return {
      data: toProductDetail(product),
      message: 'Product retrieved successfully',
    };
  }
}
