import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productsApi } from '../api/productsApi'
import { ProductCard } from '../components/ProductCard'
import { ProductCarousel } from '../components/ProductCarousel'
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from '../components/icons'
import type { ApiError, ProductListItem } from '../types/api'

export function HomePage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadFeaturedProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const productData = await productsApi.listProducts({
          limit: 10,
          page: 1,
        })

        if (isCurrent) {
          setProducts(productData.items)
          setCarouselIndex(0)
        }
      } catch (caughtError) {
        if (isCurrent) {
          setError(caughtError as ApiError)
          setProducts([])
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadFeaturedProducts()

    return () => {
      isCurrent = false
    }
  }, [])

  const visibleDesktopProducts = useMemo(
    () => getVisibleProducts(products, carouselIndex, 2),
    [carouselIndex, products],
  )

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedSearch = searchValue.trim()
    navigate(
      trimmedSearch
        ? `/products?search=${encodeURIComponent(trimmedSearch)}`
        : '/products',
    )
  }

  function handlePreviousProduct() {
    if (products.length <= 1) {
      return
    }

    setCarouselIndex((current) =>
      current === 0 ? products.length - 1 : current - 1,
    )
  }

  function handleNextProduct() {
    if (products.length <= 1) {
      return
    }

    setCarouselIndex((current) => (current + 1) % products.length)
  }

  return (
    <>
      <section className="mx-auto min-h-[calc(100vh-6rem)] max-w-[1480px] px-6 pb-10 pt-6 sm:px-10 lg:min-h-[calc(100vh-9rem)] lg:px-16 lg:pb-16 lg:pt-0">
        <div className="grid gap-10 lg:grid-cols-[560px_minmax(0,1fr)] lg:gap-20 xl:grid-cols-[600px_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col lg:min-h-[calc(100vh-9rem)]">
            <form
              className="mt-6 flex h-11 w-full max-w-[448px] items-center bg-[#dedede]/85 px-6 text-[#111111] transition focus-within:bg-[#d4d4d4] md:h-14 lg:mt-16"
              role="search"
              onSubmit={handleSearchSubmit}
            >
              <SearchIcon className="size-7" />
              <input
                type="search"
                value={searchValue}
                className="min-w-0 flex-1 bg-transparent text-right text-base tracking-[0.18em] text-[#595959] outline-none placeholder:text-[#595959]"
                placeholder="Search"
                aria-label="Search products"
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </form>

            <div className="mt-12 md:mt-16 lg:mt-auto">
              <h1 className="max-w-[560px] text-[3.25rem] font-black uppercase leading-[0.9] tracking-normal text-[#222222] md:text-[4.4rem] lg:text-[4.65rem] xl:text-[5.15rem]">
                NEW
                <br />
                COLLECTION
              </h1>
              <p className="mt-5 text-2xl font-medium leading-[1.45] tracking-[0.08em] text-[#222222]">
                Summer
                <br />
                2024
              </p>
            </div>

            <div className="hidden items-center gap-8 pt-20 lg:flex">
              <ShopCta />
              <CarouselControls
                canMove={products.length > 1}
                onNext={handleNextProduct}
                onPrevious={handlePreviousProduct}
              />
            </div>
          </div>

          <div className="min-w-0 lg:flex lg:items-end">
            <div className="hidden w-full grid-cols-2 gap-10 lg:grid">
              <FeaturedProductContent
                error={error}
                isLoading={isLoading}
                products={visibleDesktopProducts}
              />
            </div>

            <div className="-mx-6 mt-2 lg:hidden">
              <div className="flex gap-3 overflow-x-auto px-6 pb-2">
                <MobileFeaturedProducts
                  error={error}
                  isLoading={isLoading}
                  products={products}
                />
              </div>
              <div className="mt-5 px-6">
                <ShopCta />
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductCarousel
        error={error}
        isLoading={isLoading}
        products={products}
        title="New This Week"
      />
    </>
  )
}

function FeaturedProductContent({
  error,
  isLoading,
  products,
}: {
  error: ApiError | null
  isLoading: boolean
  products: ProductListItem[]
}) {
  if (isLoading) {
    return (
      <>
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </>
    )
  }

  if (error) {
    return <HeroProductMessage message="Could not load collection products." />
  }

  if (!products.length) {
    return <HeroProductMessage message="No collection products available yet." />
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  )
}

function MobileFeaturedProducts({
  error,
  isLoading,
  products,
}: {
  error: ApiError | null
  isLoading: boolean
  products: ProductListItem[]
}) {
  if (isLoading) {
    return (
      <>
        <div className="w-[42vw] min-w-[160px] max-w-[190px] shrink-0">
          <ProductCardSkeleton />
        </div>
        <div className="w-[42vw] min-w-[160px] max-w-[190px] shrink-0">
          <ProductCardSkeleton />
        </div>
      </>
    )
  }

  if (error || !products.length) {
    return (
      <div className="w-[72vw] shrink-0 border border-[#d3d3d3] bg-[#f4f4f1]/70 px-5 py-8 text-sm font-semibold text-[#555555]">
        {error
          ? 'Could not load collection products.'
          : 'No collection products available yet.'}
      </div>
    )
  }

  return (
    <>
      {products.map((product) => (
        <div
          key={product.id}
          className="w-[42vw] min-w-[160px] max-w-[190px] shrink-0"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[0.86] border border-[#d3d3d3] bg-[#e5e5e2]" />
      <div className="mt-3 h-3 w-24 bg-[#dededb]" />
      <div className="mt-2 h-4 w-4/5 bg-[#dededb]" />
    </div>
  )
}

function HeroProductMessage({ message }: { message: string }) {
  return (
    <div className="col-span-2 grid aspect-[2.18] place-items-center border border-[#d3d3d3] bg-[#f4f4f1]/70 px-8 text-center">
      <p className="max-w-sm text-sm font-semibold leading-6 tracking-[0.08em] text-[#555555]">
        {message}
      </p>
    </div>
  )
}

function getVisibleProducts(
  products: ProductListItem[],
  startIndex: number,
  count: number,
) {
  if (products.length <= count) {
    return products
  }

  return Array.from({ length: count }, (_, offset) => {
    const productIndex = (startIndex + offset) % products.length

    return products[productIndex]
  })
}

function ShopCta() {
  return (
    <Link
      to="/products"
      className="flex h-11 w-[170px] items-center justify-between bg-[#dedede]/90 px-5 text-base font-semibold text-[#111111] transition hover:bg-[#d4d4d4] md:h-16 md:w-80 md:px-8 md:text-xl"
    >
      <span>Go To Shop</span>
      <ArrowRightIcon className="h-5 w-11 md:h-6 md:w-16" />
    </Link>
  )
}

function CarouselControls({
  canMove,
  onNext,
  onPrevious,
}: {
  canMove: boolean
  onNext: () => void
  onPrevious: () => void
}) {
  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        className="grid size-14 place-items-center border border-[#cfcfcf] text-[#8a8a8a] transition hover:border-[#111111] hover:text-[#111111] disabled:cursor-not-allowed disabled:text-[#c0c0c0]"
        aria-label="Previous collection product"
        disabled={!canMove}
        onClick={onPrevious}
      >
        <ChevronLeftIcon className="size-6" />
      </button>
      <button
        type="button"
        className="grid size-14 place-items-center border border-[#cfcfcf] text-[#111111] transition hover:bg-[#dedede]/60 disabled:cursor-not-allowed disabled:text-[#c0c0c0]"
        aria-label="Next collection product"
        disabled={!canMove}
        onClick={onNext}
      >
        <ChevronRightIcon className="size-6" />
      </button>
    </div>
  )
}
