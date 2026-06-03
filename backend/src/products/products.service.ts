import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductType, Size } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  getOptions() {
    return {
      types: Object.values(ProductType),
      sizes: Object.values(Size),
    };
  }

  async listProducts(query: ListProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const where = {
      isActive: true,
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
      ...(query.size || query.color
        ? {
            variants: {
              some: {
                isActive: true,
                deletedAt: null,
                ...(query.size ? { size: query.size } : {}),
                ...(query.color ? { color: query.color } : {}),
              },
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          variants: {
            where: {
              isActive: true,
              deletedAt: null,
            },
            orderBy: [{ size: 'asc' }, { color: 'asc' }],
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  async getProductDetail(id: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: null,
      },
      include: {
        variants: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          orderBy: [{ size: 'asc' }, { color: 'asc' }],
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  async listAdminProducts(query: ListAdminProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.includeDeleted ? {} : { deletedAt: null }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          variants: {
            where: query.includeDeleted ? {} : { deletedAt: null },
            orderBy: [{ size: 'asc' }, { color: 'asc' }],
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  async createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        material: dto.material,
        price: dto.price,
        imageUrl: dto.imageUrl,
      },
      include: { variants: true },
    });
  }

  async getAdminProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: [{ size: 'asc' }, { color: 'asc' }],
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.ensureProductExists(id);

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { variants: true },
    });
  }

  async softDeleteProduct(id: string) {
    await this.ensureProductExists(id);

    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: { variants: true },
    });
  }

  async listProductVariants(productId: string) {
    await this.ensureProductExists(productId);

    return this.prisma.productVariant.findMany({
      where: {
        productId,
        deletedAt: null,
      },
      orderBy: [{ size: 'asc' }, { color: 'asc' }],
    });
  }

  async createProductVariant(productId: string, dto: CreateProductVariantDto) {
    await this.ensureProductExists(productId);
    await this.ensureVariantCombinationIsAvailable(
      productId,
      dto.size,
      dto.color,
    );

    return this.prisma.productVariant.create({
      data: {
        productId,
        size: dto.size,
        color: dto.color,
        stock: dto.stock,
      },
    });
  }

  async updateProductVariant(id: string, dto: UpdateProductVariantDto) {
    const variant = await this.ensureVariantExists(id);
    const nextSize = dto.size ?? variant.size;
    const nextColor = dto.color ?? variant.color;

    if (nextSize !== variant.size || nextColor !== variant.color) {
      await this.ensureVariantCombinationIsAvailable(
        variant.productId,
        nextSize,
        nextColor,
        id,
      );
    }

    return this.prisma.productVariant.update({
      where: { id },
      data: dto,
    });
  }

  async softDeleteProductVariant(id: string) {
    await this.ensureVariantExists(id);

    return this.prisma.productVariant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureProductExists(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  private async ensureVariantExists(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found.');
    }

    return variant;
  }

  private async ensureVariantCombinationIsAvailable(
    productId: string,
    size: Size,
    color: string,
    exceptVariantId?: string,
  ) {
    const existingVariant = await this.prisma.productVariant.findFirst({
      where: {
        productId,
        size,
        color,
        ...(exceptVariantId ? { id: { not: exceptVariantId } } : {}),
      },
    });

    if (existingVariant) {
      throw new ConflictException(
        'Product variant with this size and color already exists.',
      );
    }
  }
}
