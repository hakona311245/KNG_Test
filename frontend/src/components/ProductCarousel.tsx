import { Link } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'
import { ProductCard } from './ProductCard'
import type { ApiError, ProductListItem } from '../types/api'

const desktopCardCount = 4

export function ProductCarousel({
  error,
  isLoading,
  products,
  title = 'New This Week',
}: {
  error: ApiError | null
  isLoading: boolean
  products: ProductListItem[]
  title?: string
}) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const visibleProducts = useMemo(
    () => getVisibleProducts(products, activeIndex, desktopCardCount),
    [activeIndex, products],
  )
  const canMove = products.length > desktopCardCount

  useEffect(() => {
    if (window.location.hash !== '#new-this-week') {
      return
    }

    const scrollTimer = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ block: 'start' })
    }, 100)

    return () => {
      window.clearTimeout(scrollTimer)
    }
  }, [])

  function handlePrevious() {
    if (!canMove) {
      return
    }

    setActiveIndex((current) =>
      current === 0 ? products.length - 1 : current - 1,
    )
  }

  function handleNext() {
    if (!canMove) {
      return
    }

    setActiveIndex((current) => (current + 1) % products.length)
  }

  return (
    <section
      id="new-this-week"
      ref={sectionRef}
      className="mx-auto max-w-[1480px] px-6 pb-16 pt-2 text-[#111111] sm:px-10 lg:px-16 lg:pb-24 lg:pt-4"
    >
      <div className="flex items-end justify-between gap-6 border-t border-[#d4d4d0] pt-10 lg:pt-14">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#777777]">
            KNG Selection
          </p>
          <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-normal md:text-5xl lg:text-6xl">
            {title}
          </h2>
        </div>

        <div className="hidden shrink-0 items-center gap-5 md:flex">
          <Link
            to="/products"
            className="text-sm font-bold uppercase tracking-[0.16em] text-[#111111] transition hover:text-[#777777]"
          >
            See All
          </Link>
          <CarouselButtons
            canMove={canMove}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        </div>
      </div>

      <ProductCarouselContent
        error={error}
        isLoading={isLoading}
        products={products}
        visibleProducts={visibleProducts}
      />

      <div className="mt-8 md:hidden">
        <Link
          to="/products"
          className="text-sm font-bold uppercase tracking-[0.16em] text-[#111111]"
        >
          See All
        </Link>
      </div>
    </section>
  )
}

function ProductCarouselContent({
  error,
  isLoading,
  products,
  visibleProducts,
}: {
  error: ApiError | null
  isLoading: boolean
  products: ProductListItem[]
  visibleProducts: ProductListItem[]
}) {
  if (isLoading) {
    return (
      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4 lg:mt-10 lg:gap-x-10">
        {Array.from({ length: desktopCardCount }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (error) {
    return <CarouselMessage message="Could not load this week's products." />
  }

  if (!products.length) {
    return <CarouselMessage message="No products are available yet." />
  }

  return (
    <>
      <div className="-mx-6 mt-8 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10 md:hidden">
        <div className="flex gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[58vw] min-w-[190px] max-w-[240px] shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 hidden grid-cols-4 gap-10 md:grid">
        {visibleProducts.map((product) => (
          <ProductCard key={`${product.id}-${product.name}`} product={product} />
        ))}
      </div>
    </>
  )
}

function CarouselButtons({
  canMove,
  onNext,
  onPrevious,
}: {
  canMove: boolean
  onNext: () => void
  onPrevious: () => void
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="grid size-11 place-items-center border border-[#cfcfcf] text-[#8a8a8a] transition hover:border-[#111111] hover:text-[#111111] disabled:cursor-not-allowed disabled:text-[#c0c0c0]"
        aria-label="Previous products"
        disabled={!canMove}
        onClick={onPrevious}
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        type="button"
        className="grid size-11 place-items-center border border-[#cfcfcf] text-[#111111] transition hover:bg-[#dedede]/60 disabled:cursor-not-allowed disabled:text-[#c0c0c0]"
        aria-label="Next products"
        disabled={!canMove}
        onClick={onNext}
      >
        <ChevronRightIcon className="size-5" />
      </button>
    </div>
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

function CarouselMessage({ message }: { message: string }) {
  return (
    <div className="mt-8 grid min-h-52 place-items-center border border-[#d3d3d3] bg-[#f4f4f1]/70 px-8 text-center">
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
