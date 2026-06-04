import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductType, Size } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListAdminProductsQueryDto } from './dto/list-admin-products-query.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductImageInputDto } from './dto/product-image-input.dto';
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
    const search = query.search?.trim();
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(search
        ? { name: { contains: search, mode: 'insensitive' as const } }
        : {}),
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
        include: this.getProductInclude(),
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
      include: this.getProductInclude(),
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
        include: this.getAdminProductInclude(query.includeDeleted),
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  async createProduct(dto: CreateProductDto) {
    if (dto.images.length === 0) {
      throw new BadRequestException('Product requires at least one image.');
    }

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name,
          description: dto.description,
          type: dto.type,
          material: dto.material,
          price: dto.price,
        },
      });

      await this.createProductImages(tx, product.id, null, dto.images);

      return tx.product.findUniqueOrThrow({
        where: { id: product.id },
        include: this.getAdminProductInclude(true),
      });
    });
  }

  async getAdminProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: this.getAdminProductInclude(true),
    });

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.ensureProductExists(id);
    const { images, ...productData } = dto;

    if (images && images.length === 0) {
      throw new BadRequestException('Product requires at least one image.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: productData,
      });

      if (images) {
        await this.replaceProductImages(tx, id, null, images);
      }

      return tx.product.findUniqueOrThrow({
        where: { id },
        include: this.getAdminProductInclude(true),
      });
    });
  }

  async softDeleteProduct(id: string) {
    await this.ensureProductExists(id);

    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.getAdminProductInclude(true),
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
      include: this.getVariantInclude(),
    });
  }

  async createProductVariant(productId: string, dto: CreateProductVariantDto) {
    await this.ensureProductExists(productId);
    await this.ensureVariantCombinationIsAvailable(
      productId,
      dto.size,
      dto.color,
    );

    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
        data: {
          productId,
          size: dto.size,
          color: dto.color,
          stock: dto.stock,
        },
      });

      if (dto.images) {
        await this.createProductImages(tx, productId, variant.id, dto.images);
      }

      return tx.productVariant.findUniqueOrThrow({
        where: { id: variant.id },
        include: this.getVariantInclude(),
      });
    });
  }

  async updateProductVariant(id: string, dto: UpdateProductVariantDto) {
    const variant = await this.ensureVariantExists(id);
    const { images, ...variantData } = dto;
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

    return this.prisma.$transaction(async (tx) => {
      await tx.productVariant.update({
        where: { id },
        data: variantData,
      });

      if (images) {
        await this.replaceProductImages(tx, variant.productId, id, images);
      }

      return tx.productVariant.findUniqueOrThrow({
        where: { id },
        include: this.getVariantInclude(),
      });
    });
  }

  async softDeleteProductVariant(id: string) {
    await this.ensureVariantExists(id);

    return this.prisma.productVariant.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: this.getVariantInclude(),
    });
  }

  private getProductInclude() {
    return {
      images: this.getProductImagesArgs(),
      variants: {
        where: {
          isActive: true,
          deletedAt: null,
        },
        orderBy: [{ size: 'asc' }, { color: 'asc' }],
        include: this.getVariantInclude(),
      },
    } satisfies Prisma.ProductInclude;
  }

  private getAdminProductInclude(includeDeletedVariants = false) {
    return {
      images: this.getProductImagesArgs(),
      variants: {
        where: includeDeletedVariants ? {} : { deletedAt: null },
        orderBy: [{ size: 'asc' }, { color: 'asc' }],
        include: this.getVariantInclude(),
      },
    } satisfies Prisma.ProductInclude;
  }

  private getVariantInclude() {
    return {
      images: {
        where: {
          deletedAt: null,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      },
    } satisfies Prisma.ProductVariantInclude;
  }

  private getProductImagesArgs() {
    return {
      where: {
        variantId: null,
        deletedAt: null,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    } satisfies Prisma.Product$imagesArgs;
  }

  private async replaceProductImages(
    tx: Prisma.TransactionClient,
    productId: string,
    variantId: string | null,
    images: ProductImageInputDto[],
  ) {
    await tx.productImage.updateMany({
      where: {
        productId,
        variantId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.createProductImages(tx, productId, variantId, images);
  }

  private async createProductImages(
    tx: Prisma.TransactionClient,
    productId: string,
    variantId: string | null,
    images: ProductImageInputDto[],
  ) {
    if (images.length === 0) {
      return;
    }

    await tx.productImage.createMany({
      data: images.map((image, index) => ({
        productId,
        variantId,
        url: image.url,
        altText: image.altText,
        sortOrder: image.sortOrder ?? index,
        isPrimary: image.isPrimary ?? index === 0,
      })),
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
