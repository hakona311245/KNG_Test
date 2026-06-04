import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ordersApi } from '../api/ordersApi'
import { useAuth } from '../auth/useAuth'
import { toApiError } from '../lib/api'
import type { ApiError, OrderListItem, OrderStatus } from '../types/api'

const orderPreviewLimit = 5

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  style: 'currency',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function ProfilePage() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [ordersError, setOrdersError] = useState<ApiError | null>(null)
  const [isOrdersLoading, setIsOrdersLoading] = useState(
    user?.role === 'CUSTOMER',
  )
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      if (user?.role !== 'CUSTOMER') {
        return
      }

      try {
        const response = await ordersApi.listOrders({
          limit: orderPreviewLimit,
          page: 1,
        })

        if (isMounted) {
          setOrders(response.items)
          setOrdersTotal(response.total)
          setOrdersError(null)
        }
      } catch (error) {
        if (isMounted) {
          setOrdersError(normalizeApiError(error))
        }
      } finally {
        if (isMounted) {
          setIsOrdersLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [user?.role])

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await logout()
    } finally {
      navigate('/', { replace: true })
    }
  }

  if (!user) {
    return null
  }

  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-16 pt-4 text-[#111111] sm:px-10 lg:px-16 lg:pb-24">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#777777]">
          Account
        </p>
        <h1 className="mt-4 text-[3.1rem] font-black uppercase leading-none tracking-normal sm:text-[4.5rem] lg:text-[5.2rem]">
          Profile
        </h1>
        <p className="mt-5 max-w-xl text-base font-medium leading-7 tracking-[0.04em] text-[#555555]">
          Review your account details, recent orders, and sign out when you are
          finished.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-8">
        <section className="border border-[#d3d3d3] bg-[#f4f4f1]/75 px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#777777]">
                User Profile
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-normal">
                {user.fullName}
              </h2>
            </div>
            <span className="border border-[#111111] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]">
              {user.role}
            </span>
          </div>

          <dl className="mt-8 divide-y divide-[#d3d3d3] border-y border-[#d3d3d3]">
            <ProfileRow label="Email" value={user.email} />
            <ProfileRow label="Phone" value={user.phoneNumber} />
            <ProfileRow label="Status" value={user.status} />
          </dl>

          {user.role === 'ADMIN' ? (
            <Link
              to="/admin"
              className="mt-8 flex h-12 w-full items-center justify-center border border-[#111111] px-6 text-sm font-bold uppercase tracking-[0.18em] text-[#111111] transition hover:bg-[#111111] hover:text-white sm:h-14"
            >
              Admin Dashboard
            </Link>
          ) : null}

          <button
            type="button"
            className="mt-4 flex h-12 w-full items-center justify-center bg-[#111111] px-6 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:bg-[#8a8a8a] sm:h-14"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            {isLoggingOut ? 'Logging Out' : 'Log Out'}
          </button>
        </section>

        <section className="border border-[#d3d3d3] bg-[#f4f4f1]/75 px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#777777]">
                Orders
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase tracking-normal">
                Recent Orders
              </h2>
            </div>
            {user.role === 'CUSTOMER' ? (
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#555555]">
                {ordersTotal} Total
              </span>
            ) : null}
          </div>

          <div className="mt-7">
            {user.role !== 'CUSTOMER' ? (
              <EmptyOrdersState
                message="Order history is available for customer accounts."
                showShopLink={false}
              />
            ) : isOrdersLoading ? (
              <OrdersLoadingState />
            ) : ordersError ? (
              <div
                className="border border-[#111111] bg-[#111111]/5 px-4 py-3 text-sm font-semibold leading-6 text-[#111111]"
                role="alert"
              >
                {ordersError.message}
              </div>
            ) : orders.length === 0 ? (
              <EmptyOrdersState message="You have not placed an order yet." />
            ) : (
              <div className="border-y border-[#d3d3d3]">
                {orders.map((order) => (
                  <OrderPreview key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-xs font-bold uppercase tracking-[0.16em] text-[#777777]">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-sm font-semibold leading-6 tracking-[0.04em] text-[#111111]">
        {value}
      </dd>
    </div>
  )
}

function OrderPreview({ order }: { order: OrderListItem }) {
  return (
    <article className="border-b border-[#d3d3d3] py-5 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.14em]">
            Order {formatOrderId(order.id)}
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 tracking-[0.04em] text-[#555555]">
            {formatOrderDate(order.createdAt)} / {order.paymentOption} /{' '}
            {order.paymentStatus}
          </p>
        </div>
        <span className="border border-[#111111] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">
          {formatOrderStatus(order.status)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-black tracking-normal">
          {formatProductPrice(order.total)}
        </p>
        {order.cancellationRequest ? (
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7a2e2e]">
            Cancellation Requested
          </p>
        ) : null}
      </div>
    </article>
  )
}

function OrdersLoadingState() {
  return (
    <div className="space-y-3 border-y border-[#d3d3d3] py-5" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse bg-[#111111]/10"
        />
      ))}
    </div>
  )
}

function EmptyOrdersState({
  message,
  showShopLink = true,
}: {
  message: string
  showShopLink?: boolean
}) {
  return (
    <div className="border-y border-[#d3d3d3] py-8">
      <p className="text-sm font-semibold leading-6 tracking-[0.04em] text-[#555555]">
        {message}
      </p>
      {showShopLink ? (
        <Link
          to="/products"
          className="mt-5 inline-flex h-11 items-center justify-center border border-[#111111] px-5 text-xs font-bold uppercase tracking-[0.16em] text-[#111111] transition hover:bg-[#111111] hover:text-white"
        >
          Shop Collections
        </Link>
      ) : null}
    </div>
  )
}

function formatProductPrice(price: number) {
  return vndFormatter.format(price).replace(/\s/g, ' ')
}

function formatOrderDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown Date'
  }

  return dateFormatter.format(date)
}

function formatOrderId(orderId: string) {
  return `#${orderId.slice(0, 8).toUpperCase()}`
}

function formatOrderStatus(status: OrderStatus) {
  return status
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
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
