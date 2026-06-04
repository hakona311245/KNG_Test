import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsApi } from '../api/productsApi'
import { ProductCard } from '../components/ProductCard'
import { ProductFilterPanel } from '../components/ProductFilterPanel'
import { SearchBar } from '../components/SearchBar'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons'
import type {
  ApiError,
  PaginatedResponse,
  ProductListItem,
  ProductOptions,
  ProductType,
  Size,
} from '../types/api'

export { PageFrame } from '../components/PageFrame'

const pageLimit = 12
const validTypes: ProductType[] = ['SHIRT', 'PANT', 'JACKET']
const validSizes: Size[] = ['S', 'M', 'L', 'XL']

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] =
    useState<PaginatedResponse<ProductListItem> | null>(null)
  const [options, setOptions] = useState<ProductOptions | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const activeType = parseProductType(searchParams.get('type'))
  const activeSize = parseSize(searchParams.get('size'))
  const activeSearch = searchParams.get('search')?.trim() ?? ''
  const currentPage = parsePage(searchParams.get('page'))

  const query = useMemo(
    () => ({
      limit: pageLimit,
      page: currentPage,
      size: activeSize,
      type: activeType,
    }),
    [activeSize, activeType, currentPage],
  )

  useEffect(() => {
    let isCurrent = true

    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const [productData, optionData] = await Promise.all([
          productsApi.listProducts(query),
          productsApi.getProductOptions(),
        ])

        if (!isCurrent) {
          return
        }

        setProducts(productData)
        setOptions(optionData)
      } catch (caughtError) {
        if (!isCurrent) {
          return
        }

        setError(caughtError as ApiError)
        setProducts(null)
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    void loadProducts()

    return () => {
      isCurrent = false
    }
  }, [query])

  const totalPages = products ? Math.ceil(products.total / products.limit) : 0

  function updateSearchParam(key: string, value?: string) {
    const nextParams = new URLSearchParams(searchParams)

    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }

    if (key !== 'page') {
      nextParams.delete('page')
    }

    setSearchParams(nextParams)
  }

  function handleTypeChange(type?: ProductType) {
    updateSearchParam('type', type)
  }

  function handleSizeChange(size?: Size) {
    updateSearchParam('size', size)
  }

  function handleSearchChange(search?: string) {
    updateSearchParam('search', search?.trim() || undefined)
  }

  function handlePageChange(page: number) {
    updateSearchParam('page', String(page))
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }

  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-14 pt-2 text-[#111111] sm:px-10 lg:px-16 lg:pb-20">
      <div className="grid gap-8 lg:grid-cols-[255px_minmax(0,1fr)] lg:gap-12">
        <ProductFilterPanel
          activeSize={activeSize}
          activeType={activeType}
          className="hidden pt-24 lg:block"
          onSizeChange={handleSizeChange}
          onTypeChange={handleTypeChange}
          sizes={options?.sizes}
        />

        <main className="min-w-0">
          <div className="max-w-[980px]">
            <p className="text-sm font-medium tracking-[0.06em] text-[#777777]">
              <Link to="/" className="hover:text-[#111111]">
                Home
              </Link>{' '}
              / <span className="font-bold text-[#111111]">Products</span>
            </p>
            <h1 className="mt-3 text-2xl font-black uppercase leading-none tracking-normal md:text-3xl">
              PRODUCTS
            </h1>

            <div className="mt-4 max-w-[430px]">
              <SearchBar
                key={activeSearch}
                initialValue={activeSearch}
                onSearch={handleSearchChange}
              />
            </div>
          </div>

          <button
            type="button"
            className="mt-6 flex items-center gap-3 text-xl font-bold tracking-[0.08em] text-[#111111] lg:hidden"
            aria-expanded={isFilterOpen}
            aria-controls="mobile-product-filters"
            onClick={() => setIsFilterOpen(true)}
          >
            Filters
            <ChevronRightIcon className="size-5" />
          </button>

          <ActiveFilterSummary
            activeSize={activeSize}
            activeSearch={activeSearch}
            activeType={activeType}
            onSearchChange={handleSearchChange}
            onSizeChange={handleSizeChange}
            onTypeChange={handleTypeChange}
          />

          <ProductContent
            error={error}
            isLoading={isLoading}
            products={products?.items ?? []}
            search={activeSearch}
          />

          {products && totalPages > 1 ? (
            <PaginationControls
              currentPage={products.page}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          ) : null}
        </main>
      </div>

      {isFilterOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/20"
            aria-label="Close filters"
            onClick={() => setIsFilterOpen(false)}
          />
          <ProductFilterPanel
            activeSize={activeSize}
            activeType={activeType}
            className="relative h-full w-[58vw] min-w-[214px] max-w-[250px] overflow-y-auto bg-[#f4f4f1] bg-[url('/noisy_background.png')] px-6 py-10 shadow-2xl"
            onClose={() => setIsFilterOpen(false)}
            onSizeChange={(size) => {
              handleSizeChange(size)
              setIsFilterOpen(false)
            }}
            onTypeChange={(type) => {
              handleTypeChange(type)
              setIsFilterOpen(false)
            }}
            sizes={options?.sizes}
          />
        </div>
      ) : null}
    </section>
  )
}

function ProductContent({
  error,
  isLoading,
  products,
  search,
}: {
  error: ApiError | null
  isLoading: boolean
  products: ProductListItem[]
  search: string
}) {
  if (isLoading) {
    return (
      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:mt-10 lg:gap-x-10 lg:gap-y-11">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[0.86] border border-[#d3d3d3] bg-[#e5e5e2]" />
            <div className="mt-3 h-3 w-24 bg-[#dededb]" />
            <div className="mt-2 h-4 w-4/5 bg-[#dededb]" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-10 border border-[#cfcfcf] bg-[#f4f4f1]/70 px-5 py-6">
        <h2 className="text-lg font-bold tracking-[0.08em]">
          Could not load products
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#555555]">{error.message}</p>
      </div>
    )
  }

  const visibleProducts = filterProductsBySearch(products, search)

  if (!visibleProducts.length) {
    return (
      <div className="mt-10 border border-[#cfcfcf] bg-[#f4f4f1]/70 px-5 py-10 text-center">
        <h2 className="text-lg font-bold tracking-[0.08em]">
          No products found
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#555555]">
          Try changing the selected category, size, or search.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:mt-10 lg:gap-x-10 lg:gap-y-11">
      {visibleProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ActiveFilterSummary({
  activeSize,
  activeSearch,
  activeType,
  onSearchChange,
  onSizeChange,
  onTypeChange,
}: {
  activeSize?: Size
  activeSearch: string
  activeType?: ProductType
  onSearchChange: (search?: string) => void
  onSizeChange: (size?: Size) => void
  onTypeChange: (type?: ProductType) => void
}) {
  if (!activeSize && !activeSearch && !activeType) {
    return null
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {activeType ? (
        <button
          type="button"
          className="border border-[#bdbdbd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
          onClick={() => onTypeChange(undefined)}
        >
          {formatProductType(activeType)} x
        </button>
      ) : null}
      {activeSize ? (
        <button
          type="button"
          className="border border-[#bdbdbd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
          onClick={() => onSizeChange(undefined)}
        >
          Size {activeSize} x
        </button>
      ) : null}
      {activeSearch ? (
        <button
          type="button"
          className="border border-[#bdbdbd] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
          onClick={() => onSearchChange(undefined)}
        >
          Search {activeSearch} x
        </button>
      ) : null}
    </div>
  )
}

function PaginationControls({
  currentPage,
  onPageChange,
  totalPages,
}: {
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
}) {
  return (
    <div className="mt-12 flex items-center justify-end gap-3">
      <button
        type="button"
        className="grid size-11 place-items-center border border-[#cfcfcf] text-[#111111] disabled:text-[#9a9a9a]"
        disabled={currentPage <= 1}
        aria-label="Previous products page"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <span className="text-sm font-semibold tracking-[0.12em]">
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        className="grid size-11 place-items-center border border-[#cfcfcf] text-[#111111] disabled:text-[#9a9a9a]"
        disabled={currentPage >= totalPages}
        aria-label="Next products page"
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRightIcon className="size-5" />
      </button>
    </div>
  )
}

function parseProductType(value: string | null): ProductType | undefined {
  return validTypes.includes(value as ProductType)
    ? (value as ProductType)
    : undefined
}

function parseSize(value: string | null): Size | undefined {
  return validSizes.includes(value as Size) ? (value as Size) : undefined
}

function parsePage(value: string | null) {
  const page = Number(value)

  return Number.isInteger(page) && page > 0 ? page : 1
}

function formatProductType(type: ProductType) {
  return type === 'PANT' ? 'PANTS' : `${type}S`
}

function filterProductsBySearch(products: ProductListItem[], search: string) {
  if (!search) {
    return products
  }

  const normalizedSearch = search.toLowerCase()

  return products.filter((product) =>
    [product.name, product.material, product.type]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch),
  )
}
