import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { cartApi } from '../api/cartApi'
import { productsApi } from '../api/productsApi'
import { useAuth } from '../auth/useAuth'
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  HeartIcon,
} from '../components/icons'
import { toApiError } from '../lib/api'
import type {
  ApiError,
  ProductDetail,
  ProductImage,
  ProductType,
  ProductVariant,
  Size,
} from '../types/api'

const sizeOrder: Size[] = ['S', 'M', 'L', 'XL']
const fallbackImages: Record<ProductType, string> = {
  JACKET: '/product/blackshirt.png',
  PANT: '/product/whitepant.png',
  SHIRT: '/product/blackTshirt.png',
}

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  maximumFractionDigits: 0,
  style: 'currency',
})

type GalleryImage = {
  altText: string
  id: string
  url: string
}

export function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize, setSelectedSize] = useState<Size | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [error, setError] = useState<ApiError | null>(null)
  const [cartError, setCartError] = useState<ApiError | null>(null)
  const [cartMessage, setCartMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    let isCurrent = true

    async function loadProduct(productId: string) {
      setIsLoading(true)
      setError(null)
      setCartError(null)
      setCartMessage(null)

      try {
        const productData = await productsApi.getProduct(productId)

        if (!isCurrent) {
          return
        }

        const defaultVariant = getDefaultVariant(productData.variants)
        setProduct(productData)
        setSelectedColor(defaultVariant?.color ?? null)
        setSelectedSize(defaultVariant?.size ?? null)
        setActiveImageIndex(0)
      } catch (caughtError) {
        if (!isCurrent) {
          return
        }

        setProduct(null)
        setError(toApiError(caughtError))
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    if (!id) {
      return
    }

    void loadProduct(id)

    return () => {
      isCurrent = false
    }
  }, [id])

  const selectedVariant = useMemo(
    () =>
      product?.variants.find(
        (variant) =>
          variant.color === selectedColor && variant.size === selectedSize,
      ) ?? null,
    [product?.variants, selectedColor, selectedSize],
  )

  const galleryImages = useMemo(
    () => (product ? getGalleryImages(product, selectedVariant) : []),
    [product, selectedVariant],
  )

  async function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stock <= 0) {
      return
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }

    setIsAdding(true)
    setCartError(null)
    setCartMessage(null)

    try {
      await cartApi.addCartItem({
        quantity: 1,
        variantId: selectedVariant.id,
      })
      setCartMessage('Added to cart.')
    } catch (caughtError) {
      setCartError(toApiError(caughtError))
    } finally {
      setIsAdding(false)
    }
  }

  if (!id) {
    return <ProductDetailError error={{ message: 'Product not found.' }} />
  }

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return <ProductDetailError error={error} />
  }

  const canAddToCart = Boolean(selectedVariant && selectedVariant.stock > 0)
  const activeImage =
    galleryImages[Math.min(activeImageIndex, galleryImages.length - 1)]
  const colorOptions = getColorOptions(product.variants)
  const sizeOptions = getSizeOptions(product.variants)
  const fallbackImage = fallbackImages[product.type]

  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-28 pt-1 text-[#111111] sm:px-10 md:pb-16 lg:px-16 lg:pb-24">
      <div className="mb-7 flex items-center gap-4 lg:hidden">
        <button
          type="button"
          className="flex h-10 items-center gap-3 text-sm font-bold uppercase tracking-[0.16em]"
          onClick={() => navigate(-1)}
        >
          <ChevronLeftIcon className="size-5" />
          Back
        </button>
      </div>

      <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-16 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-20">
        <ProductGallery
          activeImage={activeImage}
          activeImageIndex={activeImageIndex}
          fallbackImage={fallbackImage}
          images={galleryImages}
          onImageSelect={setActiveImageIndex}
        />

        <ProductInfoPanel
          canAddToCart={canAddToCart}
          cartError={cartError}
          cartMessage={cartMessage}
          colorOptions={colorOptions}
          isAdding={isAdding}
          onAddToCart={handleAddToCart}
          onColorSelect={(color) => {
            const nextVariant = getDefaultVariantForColor(
              product.variants,
              color,
            )
            setSelectedColor(color)
            setSelectedSize(nextVariant?.size ?? null)
            setActiveImageIndex(0)
            setCartError(null)
            setCartMessage(null)
          }}
          onSizeSelect={(size) => {
            const nextVariant = findVariant(
              product.variants,
              selectedColor,
              size,
            )

            if (!nextVariant || nextVariant.stock <= 0) {
              return
            }

            setSelectedSize(size)
            setActiveImageIndex(0)
            setCartError(null)
            setCartMessage(null)
          }}
          product={product}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          selectedVariant={selectedVariant}
          sizeOptions={sizeOptions}
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#d0d0d0] bg-[#f4f4f1]/95 px-6 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center bg-[#d8d8d8] text-sm font-bold uppercase tracking-[0.12em] text-[#111111] transition hover:bg-[#cfcfcf] disabled:cursor-not-allowed disabled:bg-[#e5e5e2] disabled:text-[#888888]"
          disabled={!canAddToCart || isAdding}
          onClick={handleAddToCart}
        >
          {getAddButtonLabel(isAdding, selectedVariant)}
        </button>
      </div>
    </section>
  )
}

function ProductGallery({
  activeImage,
  activeImageIndex,
  fallbackImage,
  images,
  onImageSelect,
}: {
  activeImage?: GalleryImage
  activeImageIndex: number
  fallbackImage: string
  images: GalleryImage[]
  onImageSelect: (index: number) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_84px] md:items-start md:gap-5 lg:mt-14 xl:grid-cols-[minmax(0,520px)_92px] xl:justify-end">
      <div className="aspect-[0.9] min-h-0 overflow-hidden border border-[#d3d3d3] bg-[#ededeb] md:aspect-[0.84] lg:min-h-[500px] xl:min-h-[560px]">
        <SafeProductImage
          alt={activeImage?.altText ?? 'Product image'}
          fallbackImage={fallbackImage}
          src={activeImage?.url}
          className="size-full object-contain"
        />
      </div>

      <div className="-mx-6 overflow-x-auto px-6 pb-1 md:mx-0 md:overflow-visible md:px-0 md:pb-0">
        <div className="flex gap-3 md:flex-col md:gap-4">
          {images.map((image, index) => {
            const isActive = index === activeImageIndex

            return (
              <button
                key={`${image.id}-${index}`}
                type="button"
                className={[
                  'size-[70px] shrink-0 overflow-hidden border bg-[#ededeb] transition md:size-[84px] xl:size-[92px]',
                  isActive
                    ? 'border-[#111111] opacity-100'
                    : 'border-[#d3d3d3] opacity-55 hover:opacity-85',
                ].join(' ')}
                aria-label={`Show product image ${index + 1}`}
                onClick={() => onImageSelect(index)}
              >
                <SafeProductImage
                  alt={image.altText}
                  fallbackImage={fallbackImage}
                  src={image.url}
                  className="size-full object-contain"
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ProductInfoPanel({
  canAddToCart,
  cartError,
  cartMessage,
  colorOptions,
  isAdding,
  onAddToCart,
  onColorSelect,
  onSizeSelect,
  product,
  selectedColor,
  selectedSize,
  selectedVariant,
  sizeOptions,
}: {
  canAddToCart: boolean
  cartError: ApiError | null
  cartMessage: string | null
  colorOptions: string[]
  isAdding: boolean
  onAddToCart: () => void
  onColorSelect: (color: string) => void
  onSizeSelect: (size: Size) => void
  product: ProductDetail
  selectedColor: string | null
  selectedSize: Size | null
  selectedVariant: ProductVariant | null
  sizeOptions: Size[]
}) {
  return (
    <aside className="border border-[#d3d3d3] bg-[#f4f4f1]/55 px-6 py-7 backdrop-blur-sm md:px-8 lg:sticky lg:top-8 lg:mt-14 lg:px-9 lg:py-10">
      <div className="flex items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#777777]">
            {formatProductType(product.type)}
          </p>
          <h1 className="mt-3 text-xl font-black uppercase leading-tight tracking-normal md:text-2xl">
            {product.name}
          </h1>
          <p className="mt-3 text-base font-bold tracking-[0.04em]">
            {formatProductPrice(product.price)}
          </p>
        </div>
        <span
          className="grid size-9 shrink-0 place-items-center border border-[#e0e0e0] bg-[#f4f4f1]/80 text-[#555555]"
          aria-hidden="true"
        >
          <HeartIcon className="size-4" />
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold tracking-[0.08em] text-[#777777]">
        MRP incl. of all taxes
      </p>

      <p className="mt-10 text-sm font-semibold leading-6 tracking-[0.04em] text-[#111111]">
        {product.description}
      </p>

      <div className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium tracking-[0.12em] text-[#777777]">
            Color
          </h2>
          {selectedColor ? (
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#555555]">
              {selectedColor}
            </span>
          ) : null}
        </div>

        {colorOptions.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {colorOptions.map((color) => {
              const isActive = color === selectedColor

              return (
                <button
                  key={color}
                  type="button"
                  className={[
                    'size-10 border transition',
                    isActive
                      ? 'border-[#111111] outline outline-1 outline-offset-2 outline-[#111111]'
                      : 'border-[#cfcfcf] hover:border-[#111111]',
                  ].join(' ')}
                  style={{ backgroundColor: getSwatchColor(color) }}
                  aria-label={`Select ${color}`}
                  aria-pressed={isActive}
                  onClick={() => onColorSelect(color)}
                />
              )
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-[#777777]">
            No colors available.
          </p>
        )}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium tracking-[0.12em] text-[#777777]">
            Size
          </h2>
          {selectedVariant ? (
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#555555]">
              {selectedVariant.stock > 0
                ? `${selectedVariant.stock} in stock`
                : 'Out of stock'}
            </span>
          ) : null}
        </div>

        {sizeOptions.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const variant = findVariant(product.variants, selectedColor, size)
              const isDisabled = !variant || variant.stock <= 0
              const isActive = size === selectedSize

              return (
                <button
                  key={size}
                  type="button"
                  className={[
                    'grid size-11 place-items-center border text-xs font-semibold uppercase transition',
                    isActive
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#bdbdbd] bg-transparent text-[#111111] hover:border-[#111111]',
                    isDisabled
                      ? 'cursor-not-allowed border-[#dededb] bg-[#eeeeeb] text-[#999999] line-through hover:border-[#dededb]'
                      : '',
                  ].join(' ')}
                  disabled={isDisabled}
                  aria-pressed={isActive}
                  onClick={() => onSizeSelect(size)}
                >
                  {size}
                </button>
              )
            })}
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-[#777777]">
            No sizes available.
          </p>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#777777]">
        <span>Find your size</span>
        <span className="text-[#b0b0b0]">|</span>
        <span>Measurement guide</span>
      </div>

      <button
        type="button"
        className="mt-5 hidden h-12 w-full items-center justify-center bg-[#d8d8d8] px-6 text-sm font-bold uppercase tracking-[0.14em] text-[#111111] transition hover:bg-[#cfcfcf] disabled:cursor-not-allowed disabled:bg-[#e5e5e2] disabled:text-[#888888] md:flex"
        disabled={!canAddToCart || isAdding}
        onClick={onAddToCart}
      >
        {getAddButtonLabel(isAdding, selectedVariant)}
      </button>

      {cartMessage ? (
        <p className="mt-4 border border-[#111111] bg-[#111111]/5 px-4 py-3 text-sm font-semibold text-[#111111]">
          {cartMessage}
        </p>
      ) : null}

      {cartError ? (
        <p
          className="mt-4 border border-[#111111] bg-[#111111]/5 px-4 py-3 text-sm font-semibold leading-6 text-[#111111]"
          role="alert"
        >
          {cartError.message}
        </p>
      ) : null}

      {!product.variants.length ? (
        <p className="mt-4 text-sm font-semibold leading-6 text-[#777777]">
          This product has no purchasable variants yet.
        </p>
      ) : null}
    </aside>
  )
}

function ProductDetailSkeleton() {
  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-16 pt-1 sm:px-10 lg:px-16 lg:pb-24">
      <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-20">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_84px] md:gap-5 xl:grid-cols-[minmax(0,600px)_92px] xl:justify-end">
          <div className="aspect-[0.78] min-h-[360px] animate-pulse border border-[#d3d3d3] bg-[#e5e5e2] lg:min-h-[540px] xl:min-h-[620px]" />
          <div className="flex gap-3 md:flex-col md:gap-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="size-[70px] animate-pulse border border-[#d3d3d3] bg-[#e5e5e2] md:size-[84px] xl:size-[92px]"
              />
            ))}
          </div>
        </div>

        <div className="border border-[#d3d3d3] px-6 py-7 md:px-8 lg:mt-14 lg:px-9 lg:py-10">
          <div className="h-3 w-24 animate-pulse bg-[#dededb]" />
          <div className="mt-4 h-7 w-4/5 animate-pulse bg-[#dededb]" />
          <div className="mt-4 h-5 w-24 animate-pulse bg-[#dededb]" />
          <div className="mt-12 h-20 animate-pulse bg-[#dededb]" />
          <div className="mt-10 flex gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="size-10 animate-pulse border border-[#d3d3d3] bg-[#dededb]"
              />
            ))}
          </div>
          <div className="mt-8 flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="size-11 animate-pulse border border-[#d3d3d3] bg-[#dededb]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductDetailError({ error }: { error: ApiError | null }) {
  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-16 pt-1 sm:px-10 lg:px-16 lg:pb-24">
      <div className="mx-auto max-w-xl border border-[#d3d3d3] bg-[#f4f4f1]/70 px-6 py-10 text-center">
        <h1 className="text-2xl font-black uppercase tracking-normal">
          Product not found
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#555555]">
          {error?.message ?? 'The requested product is not available.'}
        </p>
        <Link
          to="/products"
          className="mx-auto mt-7 flex h-12 w-full max-w-xs items-center justify-between bg-[#d8d8d8] px-5 text-sm font-bold uppercase tracking-[0.14em] text-[#111111] transition hover:bg-[#cfcfcf]"
        >
          <span>Back to products</span>
          <ArrowRightIcon className="h-5 w-10" />
        </Link>
      </div>
    </section>
  )
}

function SafeProductImage({
  alt,
  className,
  fallbackImage,
  src,
}: {
  alt: string
  className?: string
  fallbackImage: string
  src?: string
}) {
  const displaySrc = getDisplayImageUrl(src, fallbackImage)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imageSrc = failedSrc === displaySrc ? fallbackImage : displaySrc

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={() => setFailedSrc(displaySrc)}
    />
  )
}

function getDefaultVariant(variants: ProductVariant[]) {
  return variants.find((variant) => variant.stock > 0) ?? variants[0] ?? null
}

function getDefaultVariantForColor(
  variants: ProductVariant[],
  color: string,
) {
  const colorVariants = variants.filter((variant) => variant.color === color)

  return getDefaultVariant(colorVariants)
}

function findVariant(
  variants: ProductVariant[],
  color: string | null,
  size: Size | null,
) {
  if (!color || !size) {
    return null
  }

  return (
    variants.find((variant) => variant.color === color && variant.size === size) ??
    null
  )
}

function getColorOptions(variants: ProductVariant[]) {
  return [...new Set(variants.map((variant) => variant.color))]
}

function getSizeOptions(variants: ProductVariant[]) {
  const availableSizes = new Set(variants.map((variant) => variant.size))

  return sizeOrder.filter((size) => availableSizes.has(size))
}

function getGalleryImages(
  product: ProductDetail,
  selectedVariant: ProductVariant | null,
) {
  const preferredImages =
    selectedVariant?.images.length ? selectedVariant.images : product.images

  if (preferredImages.length) {
    return preferredImages.map((image) => toGalleryImage(image, product.name))
  }

  return [
    {
      altText: product.name,
      id: `${product.id}-fallback`,
      url: product.thumbnailUrl ?? fallbackImages[product.type],
    },
  ]
}

function toGalleryImage(image: ProductImage, productName: string): GalleryImage {
  return {
    altText: image.altText ?? productName,
    id: image.id,
    url: image.url,
  }
}

function getDisplayImageUrl(src: string | undefined, fallbackImage: string) {
  if (!src || src.includes('example.com')) {
    return fallbackImage
  }

  return src
}

function getAddButtonLabel(
  isAdding: boolean,
  selectedVariant: ProductVariant | null,
) {
  if (isAdding) {
    return 'Adding'
  }

  if (!selectedVariant || selectedVariant.stock <= 0) {
    return 'Out of stock'
  }

  return 'Add'
}

function formatProductPrice(price: number) {
  return vndFormatter.format(price).replace(/\s/g, ' ')
}

function formatProductType(type: ProductType) {
  return type === 'PANT' ? 'PANTS' : `${type}S`
}

function getSwatchColor(color: string) {
  const normalized = color.trim().toLowerCase()
  const knownColors: Record<string, string> = {
    black: '#111111',
    blue: '#5d7895',
    brown: '#7a5a42',
    cream: '#eee5d4',
    gray: '#8a8a8a',
    green: '#5f6f55',
    grey: '#8a8a8a',
    navy: '#1f2d44',
    red: '#9f3b35',
    white: '#f7f7f7',
  }

  return knownColors[normalized] ?? '#d9d9d9'
}
