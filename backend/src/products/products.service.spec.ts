import { ConflictException } from '@nestjs/common';
import { ProductType, Size } from '../../generated/prisma/client';
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

function createProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'product-1',
    name: 'Essential Shirt',
    description: 'Daily cotton shirt',
    type: ProductType.SHIRT,
    material: 'Cotton',
    price: 250000,
    imageUrl: 'https://example.com/placeholder.jpg',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
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
      create: jest.Mock;
      update: jest.Mock;
    };
    productVariant: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
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
        create: jest.fn(),
        update: jest.fn(),
      },
      productVariant: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    service = new ProductsService(prisma as never);
  });

  it('filters customer list by product type', async () => {
    prisma.product.findMany.mockReturnValue('findMany');
    prisma.product.count.mockReturnValue('count');
    prisma.$transaction.mockResolvedValue([[createProduct()], 1]);

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
    prisma.$transaction.mockResolvedValue([[createProduct()], 1]);

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
    prisma.$transaction.mockResolvedValue([[createProduct()], 1]);

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
    prisma.$transaction.mockResolvedValue([[], 0]);

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

  it('returns product detail with variants', async () => {
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
      }),
    );
  });

  it('hides inactive and deleted variants from customer detail', async () => {
    prisma.product.findFirst.mockResolvedValue(createProduct());

    await service.getProductDetail('product-1');

    expect(prisma.product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: {
          variants: expect.objectContaining({
            where: {
              isActive: true,
              deletedAt: null,
            },
          }),
        },
      }),
    );
  });

  it('returns fixed product options', () => {
    expect(service.getOptions()).toEqual({
      types: [ProductType.SHIRT, ProductType.PANT, ProductType.JACKET],
      sizes: [Size.S, Size.M, Size.L, Size.XL],
    });
  });

  it('creates products as active by default', async () => {
    const product = createProduct();
    prisma.product.create.mockResolvedValue(product);

    await service.createProduct({
      name: product.name,
      description: product.description,
      type: product.type,
      material: product.material,
      price: product.price,
      imageUrl: product.imageUrl,
    });

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: product.name,
        description: product.description,
        type: product.type,
        material: product.material,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      include: { variants: true },
    });
  });

  it('updates an existing product', async () => {
    prisma.product.findUnique.mockResolvedValue(createProduct());
    prisma.product.update.mockResolvedValue(
      createProduct({ name: 'Updated Essential Shirt' }),
    );

    await service.updateProduct('product-1', {
      name: 'Updated Essential Shirt',
    });

    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 'product-1' },
      data: { name: 'Updated Essential Shirt' },
      include: { variants: true },
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
      include: { variants: true },
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

  it('updates variant stock', async () => {
    prisma.productVariant.findUnique.mockResolvedValue(createVariant());
    prisma.productVariant.update.mockResolvedValue(createVariant({ stock: 12 }));

    await service.updateProductVariant('variant-1', { stock: 12 });

    expect(prisma.productVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-1' },
      data: { stock: 12 },
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
    });
  });
});
