import { ProductType, Size } from '../../generated/prisma/client';

type MoneyValue = {
  toNumber?: () => number;
  toString: () => string;
};

type ProductVariantRecord = {
  id: string;
  size: Size;
  color: string;
  stock: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  images?: ProductImageRecord[];
};

type ProductImageRecord = {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

type ProductRecord = {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  material: string;
  price: number | string | MoneyValue;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  variants?: ProductVariantRecord[];
  images?: ProductImageRecord[];
};

function toNumber(value: number | string | MoneyValue) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return Number(value);
  }

  return value.toNumber ? value.toNumber() : Number(value.toString());
}

function toProductImage(image: ProductImageRecord) {
  return {
    id: image.id,
    url: image.url,
    altText: image.altText ?? null,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary,
  };
}

function getThumbnailUrl(images: ProductImageRecord[] = []) {
  const primaryImage = images.find((image) => image.isPrimary);
  return primaryImage?.url ?? images[0]?.url ?? null;
}

export function toProductListItem(product: ProductRecord) {
  const variants = product.variants ?? [];

  return {
    id: product.id,
    name: product.name,
    type: product.type,
    material: product.material,
    price: toNumber(product.price),
    thumbnailUrl: getThumbnailUrl(product.images),
    availableColors: [...new Set(variants.map((variant) => variant.color))],
    availableSizes: [...new Set(variants.map((variant) => variant.size))],
    isActive: product.isActive,
  };
}

export function toProductDetail(product: ProductRecord) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    type: product.type,
    material: product.material,
    price: toNumber(product.price),
    thumbnailUrl: getThumbnailUrl(product.images),
    images: (product.images ?? []).map(toProductImage),
    isActive: product.isActive,
    variants: (product.variants ?? []).map(toProductVariant),
  };
}

export function toProductVariant(variant: ProductVariantRecord) {
  return {
    id: variant.id,
    size: variant.size,
    color: variant.color,
    stock: variant.stock,
    isActive: variant.isActive,
    images: (variant.images ?? []).map(toProductImage),
  };
}
