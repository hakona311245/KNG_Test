import { BadRequestException, ConflictException } from '@nestjs/common';
import { ProductType, Size } from '../../generated/prisma/client';
import {
  toProductDetail,
  toProductListItem,
  toProductVariant,
} from './product.presenter';
import { ProductsService } from './products.service';

jest.mock('../../generated/prisma/client', () => ({
  PrismaClient: class {},
  ProductType: {
    SHIRT: 'SHIRT',
    PANT: 'PANT',
    JACKET: 'JACKET',
  },
  Size: {
    S: 'S',
    M: 'M',
    L: 'L',
    XL: 'XL',
  },
}));

const now = new Date('2026-06-03T00:00:00.000Z');

function createImage(overrides: Record<string, unknown> = {}) {
  return {
    id: 'image-1',
    productId: 'product-1',
    variantId: null,
    url: 'https://example.com/product-front.jpg',
    altText: 'Front view',
    sortOrder: 0,
    isPrimary: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

function createProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-1',
    name: 'Essential Shirt',
    description: 'Daily cotton shirt',
    type: ProductType.SHIRT,
    material: 'Cotton',
    price: 250000,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    images: [createImage()],
    variants: [],
    ...overrides,
  };
}

function createVariant(overrides: Record<string, unknown> = {}) {
  return {
    id: 'variant-1',
    productId: 'product-1',
    size: Size.M,
    color: 'Black',
    stock: 10,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    images: [
      createImage({
        id: 'variant-image-1',
        variantId: 'variant-1',
        url: 'https://example.com/product-black-m.jpg',
      }),
    ],
    ...overrides,
  };
}

describe('ProductsService', () => {
  let prisma: {
    product: {
      findMany: jest.Mock;
      count: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findUniqueOrThrow: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    productVariant: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findUniqueOrThrow: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    productImage: {
      createMany: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let service: ProductsService;

  beforeEach(() => {
    prisma = {
      product: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      productVariant: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      productImage: {
        createMany: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(async (input: unknown) => {
        if (Array.isArray(input)) {
          return input;
        }

        return (input as (tx: typeof prisma) => Promise<unknown>)(prisma);
      }),
    };
    service = new ProductsService(prisma as never);
  });

  it('filters customer list by product type', async () => {
    prisma.product.findMany.mockReturnValue('findMany');
    prisma.product.count.mockReturnValue('count');

    await service.listProducts({ type: ProductType.SHIRT });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: ProductType.SHIRT,
          isActive: true,
          deletedAt: null,
        }),
      }),
    );
  });

  it('filters customer list by variant size', async () => {
    prisma.product.findMany.mockReturnValue('findMany');
    prisma.product.count.mockReturnValue('count');

    await service.listProducts({ size: Size.M });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          variants: {
            some: expect.objectContaining({
              size: Size.M,
              isActive: true,
              deletedAt: null,
            }),
          },
        }),
      }),
    );
  });

  it('filters customer list by variant color', async () => {
    prisma.product.findMany.mockReturnValue('findMany');
    prisma.product.count.mockReturnValue('count');

    await service.listProducts({ color: 'Black' });

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          variants: {
            some: expect.objectContaining({
              color: 'Black',
              isActive: true,
              deletedAt: null,
            }),
          },
        }),
      }),
    );
  });

  it('hides inactive and deleted products from customer list', async () => {
    prisma.product.findMany.mockReturnValue('findMany');
    prisma.product.count.mockReturnValue('count');

    await service.listProducts({});

    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isActive: true,
          deletedAt: null,
        }),
      }),
    );
  });

  it('returns product detail with variants and images', async () => {
    const product = createProduct({ variants: [createVariant()] });
    prisma.product.findFirst.mockResolvedValue(product);

    const result = await service.getProductDetail('product-1');

    expect(result).toEqual(product);
    expect(prisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'product-1',
          isActive: true,
          deletedAt: null,
        },
        include: expect.objectContaining({
          images: expect.objectContaining({
            where: {
              variantId: null,
              deletedAt: null,
            },
          }),
          variants: expect.objectContaining({
            include: expect.objectContaining({
              images: expect.objectContaining({
                where: {
                  deletedAt: null,
                },
              }),
            }),
          }),
        }),
      }),
    );
  });

  it('hides inactive and deleted variants from customer detail', async () => {
    prisma.product.findFirst.mockResolvedValue(createProduct());

    await service.getProductDetail('product-1');

    expect(prisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          variants: expect.objectContaining({
            where: {
              isActive: true,
              deletedAt: null,
            },
          }),
        }),
      }),
    );
  });

  it('returns fixed product options', () => {
    expect(service.getOptions()).toEqual({
      types: [ProductType.SHIRT, ProductType.PANT, ProductType.JACKET],
      sizes: [Size.S, Size.M, Size.L, Size.XL],
    });
  });

  it('rejects product creation without images', async () => {
    await expect(
      service.createProduct({
        name: 'Essential Shirt',
        description: 'Daily cotton shirt',
        type: ProductType.SHIRT,
        material: 'Cotton',
        price: 250000,
        images: [],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates product images during product creation', async () => {
    const product = createProduct();
    prisma.product.create.mockResolvedValue(product);
    prisma.product.findUniqueOrThrow.mockResolvedValue(product);

    await service.createProduct({
      name: product.name,
      description: product.description,
      type: product.type,
      material: product.material,
      price: product.price,
      images: [
        {
          url: 'https://example.com/product-front.jpg',
          altText: 'Front view',
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    });

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: product.name,
        description: product.description,
        type: product.type,
        material: product.material,
        price: product.price,
      },
    });
    expect(prisma.productImage.createMany).toHaveBeenCalledWith({
      data: [
        {
          productId: product.id,
          variantId: null,
          url: 'https://example.com/product-front.jpg',
          altText: 'Front view',
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    });
  });

  it('updates an existing product', async () => {
    prisma.product.findUnique.mockResolvedValue(createProduct());
    prisma.product.findUniqueOrThrow.mockResolvedValue(
      createProduct({ name: 'Updated Essential Shirt' }),
    );

    await service.updateProduct('product-1', {
      name: 'Updated Essential Shirt',
    });

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { name: 'Updated Essential Shirt' },
    });
  });

  it('replaces product images during product update', async () => {
    prisma.product.findUnique.mockResolvedValue(createProduct());
    prisma.product.findUniqueOrThrow.mockResolvedValue(createProduct());

    await service.updateProduct('product-1', {
      images: [
        {
          url: 'https://example.com/product-side.jpg',
          altText: 'Side view',
          sortOrder: 1,
          isPrimary: false,
        },
      ],
    });

    expect(prisma.productImage.updateMany).toHaveBeenCalledWith({
      where: {
        productId: 'product-1',
        variantId: null,
        deletedAt: null,
      },
      data: { deletedAt: expect.any(Date) },
    });
    expect(prisma.productImage.createMany).toHaveBeenCalledWith({
      data: [
        {
          productId: 'product-1',
          variantId: null,
          url: 'https://example.com/product-side.jpg',
          altText: 'Side view',
          sortOrder: 1,
          isPrimary: false,
        },
      ],
    });
  });

  it('soft deletes products', async () => {
    prisma.product.findUnique.mockResolvedValue(createProduct());
    prisma.product.update.mockResolvedValue(
      createProduct({ deletedAt: new Date() }),
    );

    await service.softDeleteProduct('product-1');

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { deletedAt: expect.any(Date) },
      include: expect.any(Object),
    });
  });

  it('rejects duplicate product variants', async () => {
    prisma.product.findUnique.mockResolvedValue(createProduct());
    prisma.productVariant.findFirst.mockResolvedValue(createVariant());

    await expect(
      service.createProductVariant('product-1', {
        size: Size.M,
        color: 'Black',
        stock: 10,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(prisma.productVariant.create).not.toHaveBeenCalled();
  });

  it('creates optional variant images', async () => {
    const variant = createVariant();
    prisma.product.findUnique.mockResolvedValue(createProduct());
    prisma.productVariant.findFirst.mockResolvedValue(null);
    prisma.productVariant.create.mockResolvedValue(variant);
    prisma.productVariant.findUniqueOrThrow.mockResolvedValue(variant);

    await service.createProductVariant('product-1', {
      size: Size.M,
      color: 'Black',
      stock: 10,
      images: [{ url: 'https://example.com/product-black-m.jpg' }],
    });

    expect(prisma.productImage.createMany).toHaveBeenCalledWith({
      data: [
        {
          productId: 'product-1',
          variantId: 'variant-1',
          url: 'https://example.com/product-black-m.jpg',
          altText: undefined,
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    });
  });

  it('updates variant stock', async () => {
    prisma.productVariant.findUnique.mockResolvedValue(createVariant());
    prisma.productVariant.findUniqueOrThrow.mockResolvedValue(
      createVariant({ stock: 12 }),
    );

    await service.updateProductVariant('variant-1', { stock: 12 });

    expect(prisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-1' },
      data: { stock: 12 },
    });
  });

  it('replaces variant images during variant update', async () => {
    prisma.productVariant.findUnique.mockResolvedValue(createVariant());
    prisma.productVariant.findUniqueOrThrow.mockResolvedValue(createVariant());

    await service.updateProductVariant('variant-1', {
      images: [{ url: 'https://example.com/product-black-l.jpg' }],
    });

    expect(prisma.productImage.updateMany).toHaveBeenCalledWith({
      where: {
        productId: 'product-1',
        variantId: 'variant-1',
        deletedAt: null,
      },
      data: { deletedAt: expect.any(Date) },
    });
    expect(prisma.productImage.createMany).toHaveBeenCalledWith({
      data: [
        {
          productId: 'product-1',
          variantId: 'variant-1',
          url: 'https://example.com/product-black-l.jpg',
          altText: undefined,
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    });
  });

  it('soft deletes variants', async () => {
    prisma.productVariant.findUnique.mockResolvedValue(createVariant());
    prisma.productVariant.update.mockResolvedValue(
      createVariant({ deletedAt: new Date() }),
    );

    await service.softDeleteProductVariant('variant-1');

    expect(prisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-1' },
      data: { deletedAt: expect.any(Date) },
      include: expect.any(Object),
    });
  });

  it('presents product list thumbnail from primary image', () => {
    expect(toProductListItem(createProduct())).toEqual(
      expect.objectContaining({
        thumbnailUrl: 'https://example.com/product-front.jpg',
      }),
    );
  });

  it('presents product and variant images in detail', () => {
    const product = createProduct({ variants: [createVariant()] });

    expect(toProductDetail(product)).toEqual(
      expect.objectContaining({
        thumbnailUrl: 'https://example.com/product-front.jpg',
        images: [
          {
            id: 'image-1',
            url: 'https://example.com/product-front.jpg',
            altText: 'Front view',
            sortOrder: 0,
            isPrimary: true,
          },
        ],
        variants: [
          expect.objectContaining({
            images: [
              expect.objectContaining({
                url: 'https://example.com/product-black-m.jpg',
              }),
            ],
          }),
        ],
      }),
    );
  });

  it('presents variant images', () => {
    expect(toProductVariant(createVariant())).toEqual(
      expect.objectContaining({
        images: [
          expect.objectContaining({
            id: 'variant-image-1',
          }),
        ],
      }),
    );
  });
});
