import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cartApi } from '../api/cartApi'
import { ArrowRightIcon } from '../components/icons'
import { toApiError } from '../lib/api'
import type { ApiError, Cart, CartItem } from '../types/api'

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCart() {
      try {
        const cartData = await cartApi.getCart()

        if (isMounted) {
          setCart(cartData)
          setError(null)
        }
      } catch (caughtError) {
        if (isMounted) {
          setError(normalizeApiError(caughtError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadCart()

    return () => {
      isMounted = false
    }
  }, [])

  async function updateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) {
      return
    }

    setPendingItemId(item.id)
    setError(null)

    try {
      const updatedCart = await cartApi.updateCartItem(item.id, { quantity })
      setCart(updatedCart)
    } catch (caughtError) {
      setError(normalizeApiError(caughtError))
    } finally {
      setPendingItemId(null)
    }
  }

  async function removeItem(itemId: string) {
    setPendingItemId(itemId)
    setError(null)

    try {
      const updatedCart = await cartApi.removeCartItem(itemId)
      setCart(updatedCart)
    } catch (caughtError) {
      setError(normalizeApiError(caughtError))
    } finally {
      setPendingItemId(null)
    }
  }

  if (isLoading) {
    return <CartSkeleton />
  }

  if (error && !cart) {
    return <CartErrorState error={error} />
  }

  const items = cart?.items ?? []
  const total = cart?.total ?? 0

  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-16 pt-4 text-[#111111] sm:px-10 lg:px-16 lg:pb-24">
      <div className="flex flex-col gap-4 border-b border-[#d3d3d3] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#777777]">
            Shopping Bag
          </p>
          <h1 className="mt-4 text-[3.1rem] font-black uppercase leading-none tracking-normal sm:text-[4.5rem] lg:text-[5.2rem]">
            Cart
          </h1>
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#555555]">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </p>
      </div>

      {error ? (
        <div
          className="mt-6 border border-[#111111] bg-[#111111]/5 px-4 py-3 text-sm font-semibold leading-6 text-[#111111]"
          role="alert"
        >
          {error.message}
        </div>
      ) : null}

      {items.length ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                isPending={pendingItemId === item.id}
                onRemove={() => removeItem(item.id)}
                onUpdateQuantity={(quantity) => updateQuantity(item, quantity)}
              />
            ))}
          </div>

          <CartSummary itemCount={items.length} total={total} />
        </div>
      ) : (
        <CartEmptyState />
      )}
    </section>
  )
}

function CartItemRow({
  isPending,
  item,
  onRemove,
  onUpdateQuantity,
}: {
  isPending: boolean
  item: CartItem
  onRemove: () => void
  onUpdateQuantity: (quantity: number) => void
}) {
  return (
    <article className="grid gap-4 border border-[#d3d3d3] bg-[#f4f4f1]/65 p-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:p-5">
      <Link
        to={`/products/${item.productId}`}
        className="grid aspect-square min-h-[132px] place-items-center overflow-hidden border border-[#d3d3d3] bg-[#ededeb]"
        aria-label={`View ${item.productName}`}
      >
        <img
          src="/logo/KNG_Logo-removebg.png"
          alt=""
          className="size-20 object-contain opacity-70"
        />
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#777777]">
              {item.color} / {item.size}
            </p>
            <Link
              to={`/products/${item.productId}`}
              className="mt-2 block text-xl font-black uppercase leading-tight tracking-normal hover:underline"
            >
              {item.productName}
            </Link>
          </div>

          <button
            type="button"
            className="grid size-8 shrink-0 place-items-center border border-[#111111] text-lg leading-none transition hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#bdbdbd] disabled:text-[#777777]"
            disabled={isPending}
            aria-label={`Remove ${item.productName}`}
            onClick={onRemove}
          >
            x
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#777777]">
              Quantity
            </p>
            <div className="mt-2 inline-grid h-10 grid-cols-[40px_44px_40px] border border-[#cfcfcf]">
              <button
                type="button"
                className="grid place-items-center border-r border-[#cfcfcf] text-lg font-medium transition hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:bg-[#ececea] disabled:text-[#999999]"
                disabled={isPending || item.quantity <= 1}
                aria-label={`Decrease ${item.productName} quantity`}
                onClick={() => onUpdateQuantity(item.quantity - 1)}
              >
                -
              </button>
              <span className="grid place-items-center text-sm font-bold">
                {item.quantity}
              </span>
              <button
                type="button"
                className="grid place-items-center border-l border-[#cfcfcf] text-lg font-medium transition hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:bg-[#ececea] disabled:text-[#999999]"
                disabled={isPending}
                aria-label={`Increase ${item.productName} quantity`}
                onClick={() => onUpdateQuantity(item.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#777777]">
              Unit {formatProductPrice(item.price)}
            </p>
            <p className="mt-2 text-xl font-black tracking-normal">
              {formatProductPrice(item.subtotal)}
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

function CartSummary({
  itemCount,
  total,
}: {
  itemCount: number
  total: number
}) {
  return (
    <aside className="border border-[#d3d3d3] bg-[#f4f4f1]/75 px-5 py-6 lg:sticky lg:top-8 lg:self-start lg:px-7 lg:py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#777777]">
        Order Summary
      </p>
      <dl className="mt-6 space-y-4 border-b border-[#d3d3d3] pb-5">
        <SummaryRow label="Items" value={`${itemCount}`} />
        <SummaryRow label="Subtotal" value={formatProductPrice(total)} />
      </dl>
      <SummaryRow
        label="Total"
        value={formatProductPrice(total)}
        className="mt-5 text-lg"
      />
      <Link
        to="/checkout"
        className="mt-7 flex h-12 w-full items-center justify-between bg-[#111111] px-5 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#2a2a2a] sm:h-14"
      >
        <span>Continue</span>
        <ArrowRightIcon className="h-5 w-10" />
      </Link>
      <Link
        to="/products"
        className="mt-3 flex h-12 w-full items-center justify-center border border-[#111111] px-5 text-sm font-bold uppercase tracking-[0.16em] text-[#111111] transition hover:bg-[#111111] hover:text-white"
      >
        Keep Shopping
      </Link>
    </aside>
  )
}

function SummaryRow({
  className = '',
  label,
  value,
}: {
  className?: string
  label: string
  value: string
}) {
  return (
    <div
      className={`flex items-center justify-between gap-5 text-sm font-bold uppercase tracking-[0.12em] ${className}`}
    >
      <span>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  )
}

function CartEmptyState() {
  return (
    <div className="mt-8 border border-[#d3d3d3] bg-[#f4f4f1]/75 px-5 py-10 text-center sm:px-8">
      <h2 className="text-2xl font-black uppercase tracking-normal">
        Your cart is empty
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-6 tracking-[0.04em] text-[#555555]">
        Add a size and color from a product detail page before checkout.
      </p>
      <Link
        to="/products"
        className="mx-auto mt-7 inline-flex h-12 items-center justify-center border border-[#111111] px-6 text-sm font-bold uppercase tracking-[0.16em] text-[#111111] transition hover:bg-[#111111] hover:text-white"
      >
        Shop Collections
      </Link>
    </div>
  )
}

function CartSkeleton() {
  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-16 pt-4 sm:px-10 lg:px-16 lg:pb-24">
      <div className="h-16 w-56 animate-pulse bg-[#111111]/10" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse border border-[#d3d3d3] bg-[#111111]/10"
            />
          ))}
        </div>
        <div className="h-72 animate-pulse border border-[#d3d3d3] bg-[#111111]/10" />
      </div>
    </section>
  )
}

function CartErrorState({ error }: { error: ApiError }) {
  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-16 pt-4 sm:px-10 lg:px-16 lg:pb-24">
      <div className="mx-auto max-w-xl border border-[#d3d3d3] bg-[#f4f4f1]/75 px-6 py-10 text-center">
        <h1 className="text-2xl font-black uppercase tracking-normal">
          Cart unavailable
        </h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-[#555555]">
          {error.message}
        </p>
      </div>
    </section>
  )
}

function formatProductPrice(price: number) {
  return vndFormatter.format(price).replace(/\s/g, ' ')
}

function normalizeApiError(error: unknown): ApiError {
  if (isPlainApiError(error)) {
    return error
  }

  return toApiError(error)
}

function isPlainApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    !(error instanceof Error) &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  )
}
