import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartApi } from '../api/cartApi'
import { ordersApi } from '../api/ordersApi'
import { useAuth } from '../auth/useAuth'
import { ArrowRightIcon, ChevronLeftIcon } from '../components/icons'
import { toApiError } from '../lib/api'
import type {
  ApiError,
  Cart,
  CartItem,
  CheckoutResult,
  PaymentOption,
  User,
} from '../types/api'

type CheckoutStep = 'information' | 'payment'

type CheckoutFormValues = {
  shippingName: string
  phone: string
  address: string
  city: string
  note: string
}

type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues, string>>

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const redirectTimeoutRef = useRef<number | null>(null)
  const [activeStep, setActiveStep] = useState<CheckoutStep>('information')
  const [cart, setCart] = useState<Cart | null>(null)
  const [cartError, setCartError] = useState<ApiError | null>(null)
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(
    null,
  )
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('COD')
  const [values, setValues] = useState<CheckoutFormValues>(() =>
    getInitialCheckoutValues(user),
  )
  const [errors, setErrors] = useState<CheckoutFormErrors>({})

  useEffect(() => {
    let isMounted = true

    async function loadCart() {
      try {
        const cartData = await cartApi.getCart()

        if (isMounted) {
          setCart(cartData)
          setCartError(null)
        }
      } catch (caughtError) {
        if (isMounted) {
          setCartError(normalizeApiError(caughtError))
        }
      } finally {
        if (isMounted) {
          setIsCartLoading(false)
        }
      }
    }

    void loadCart()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(
    () => () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current)
      }
    },
    [],
  )

  function updateField(field: keyof CheckoutFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }

    if (apiError) {
      setApiError(null)
    }
  }

  function handleInformationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedValues = trimCheckoutValues(values)
    const nextErrors = validateCheckoutInformation(trimmedValues)

    setValues(trimmedValues)
    setErrors(nextErrors)
    setApiError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setActiveStep('payment')
  }

  async function handlePaymentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!cart || cart.items.length === 0) {
      setApiError({ message: 'Your cart is empty.' })
      return
    }

    const trimmedValues = trimCheckoutValues(values)
    const nextErrors = validateCheckoutInformation(trimmedValues)

    setValues(trimmedValues)
    setErrors(nextErrors)
    setApiError(null)

    if (Object.keys(nextErrors).length > 0) {
      setActiveStep('information')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await ordersApi.checkout({
        address: trimmedValues.address,
        city: trimmedValues.city,
        note: trimmedValues.note || undefined,
        paymentOption,
        phone: trimmedValues.phone,
        shippingName: trimmedValues.shippingName,
      })
      setCheckoutResult(result)
      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate('/', { replace: true })
      }, 1800)
    } catch (caughtError) {
      setApiError(normalizeApiError(caughtError))
      setIsSubmitting(false)
    }
  }

  const items = cart?.items ?? []
  const total = cart?.total ?? 0
  const canCheckout = items.length > 0 && !checkoutResult

  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-16 pt-4 text-[#111111] sm:px-10 lg:px-16 lg:pb-24">
      <button
        type="button"
        className="mb-7 flex h-10 items-center gap-3 text-sm font-bold uppercase tracking-[0.16em]"
        onClick={() => navigate(-1)}
      >
        <ChevronLeftIcon className="size-5" />
        Back
      </button>

      <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_410px] lg:gap-16 xl:gap-24">
        <div className="min-w-0">
          <h1 className="text-[3.1rem] font-black uppercase leading-none tracking-normal sm:text-[4.5rem]">
            Checkout
          </h1>

          <CheckoutTabs activeStep={activeStep} onStepSelect={setActiveStep} />

          {cartError ? (
            <div
              className="mt-8 border border-[#111111] bg-[#111111]/5 px-4 py-3 text-sm font-semibold leading-6 text-[#111111]"
              role="alert"
            >
              {cartError.message}
            </div>
          ) : null}

          {apiError ? (
            <div
              className="mt-8 border border-[#111111] bg-[#111111]/5 px-4 py-3 text-sm font-semibold leading-6 text-[#111111]"
              role="alert"
            >
              {apiError.message}
            </div>
          ) : null}

          {checkoutResult ? (
            <CheckoutComplete result={checkoutResult} />
          ) : activeStep === 'information' ? (
            <InformationForm
              errors={errors}
              isDisabled={!canCheckout}
              values={values}
              onChange={updateField}
              onSubmit={handleInformationSubmit}
            />
          ) : (
            <PaymentForm
              isDisabled={!canCheckout || isSubmitting}
              isSubmitting={isSubmitting}
              paymentOption={paymentOption}
              total={total}
              onPaymentChange={setPaymentOption}
              onSubmit={handlePaymentSubmit}
            />
          )}
        </div>

        <CheckoutSummary
          isLoading={isCartLoading}
          items={items}
          total={total}
        />
      </div>
    </section>
  )
}

function CheckoutTabs({
  activeStep,
  onStepSelect,
}: {
  activeStep: CheckoutStep
  onStepSelect: (step: CheckoutStep) => void
}) {
  return (
    <div className="mt-6 flex gap-8 border-b border-[#d3d3d3]">
      {(['information', 'payment'] as CheckoutStep[]).map((step) => {
        const isActive = step === activeStep

        return (
          <button
            key={step}
            type="button"
            className={[
              'border-b-2 py-4 text-sm font-black uppercase tracking-[0.12em] transition',
              isActive
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-[#888888] hover:text-[#111111]',
            ].join(' ')}
            aria-current={isActive ? 'step' : undefined}
            onClick={() => onStepSelect(step)}
          >
            {step === 'information' ? 'Information' : 'Payment'}
          </button>
        )
      })}
    </div>
  )
}

function InformationForm({
  errors,
  isDisabled,
  onChange,
  onSubmit,
  values,
}: {
  errors: CheckoutFormErrors
  isDisabled: boolean
  onChange: (field: keyof CheckoutFormValues, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  values: CheckoutFormValues
}) {
  return (
    <form className="mt-8 max-w-2xl" noValidate onSubmit={onSubmit}>
      <fieldset disabled={isDisabled} className="space-y-5 disabled:opacity-60">
        <FormField
          autoComplete="name"
          error={errors.shippingName}
          label="Shipping Name"
          name="shippingName"
          value={values.shippingName}
          onChange={(value) => onChange('shippingName', value)}
        />
        <FormField
          autoComplete="tel"
          error={errors.phone}
          inputMode="tel"
          label="Phone"
          name="phone"
          value={values.phone}
          onChange={(value) => onChange('phone', value)}
        />
        <FormField
          autoComplete="street-address"
          error={errors.address}
          label="Address"
          name="address"
          value={values.address}
          onChange={(value) => onChange('address', value)}
        />
        <FormField
          autoComplete="address-level2"
          error={errors.city}
          label="City"
          name="city"
          value={values.city}
          onChange={(value) => onChange('city', value)}
        />
        <FormField
          autoComplete="off"
          label="Note"
          name="note"
          value={values.note}
          onChange={(value) => onChange('note', value)}
        />
      </fieldset>

      <button
        type="submit"
        className="mt-7 flex h-12 w-full max-w-sm items-center justify-between bg-[#d8d8d8] px-5 text-sm font-bold uppercase tracking-[0.14em] text-[#111111] transition hover:bg-[#cfcfcf] disabled:cursor-not-allowed disabled:bg-[#e5e5e2] disabled:text-[#888888] sm:h-14"
        disabled={isDisabled}
      >
        <span>Payment</span>
        <ArrowRightIcon className="h-5 w-10" />
      </button>
    </form>
  )
}

function PaymentForm({
  isDisabled,
  isSubmitting,
  onPaymentChange,
  onSubmit,
  paymentOption,
  total,
}: {
  isDisabled: boolean
  isSubmitting: boolean
  onPaymentChange: (paymentOption: PaymentOption) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  paymentOption: PaymentOption
  total: number
}) {
  return (
    <form className="mt-8 max-w-2xl" onSubmit={onSubmit}>
      <fieldset disabled={isDisabled} className="space-y-4 disabled:opacity-60">
        <legend className="text-sm font-black uppercase tracking-[0.16em]">
          Select Payment
        </legend>
        <PaymentOptionCard
          checked={paymentOption === 'COD'}
          description="Mock cash-on-delivery payment. The backend records the order immediately."
          label="COD"
          value="COD"
          onChange={onPaymentChange}
        />
        <PaymentOptionCard
          checked={paymentOption === 'VNPAY'}
          description="Mock VNPay payment. This uses the same backend checkout flow for the MVP."
          label="VNPAY"
          value="VNPAY"
          onChange={onPaymentChange}
        />
      </fieldset>

      <button
        type="submit"
        className="mt-7 flex h-12 w-full max-w-sm items-center justify-between bg-[#111111] px-5 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:bg-[#8a8a8a] sm:h-14"
        disabled={isDisabled}
      >
        <span>{isSubmitting ? 'Placing Order' : 'Complete Order'}</span>
        <span>{formatProductPrice(total)}</span>
      </button>
    </form>
  )
}

function PaymentOptionCard({
  checked,
  description,
  label,
  onChange,
  value,
}: {
  checked: boolean
  description: string
  label: string
  onChange: (paymentOption: PaymentOption) => void
  value: PaymentOption
}) {
  return (
    <label
      className={[
        'grid cursor-pointer grid-cols-[20px_minmax(0,1fr)] gap-4 border px-4 py-4 transition',
        checked
          ? 'border-[#111111] bg-[#111111]/5'
          : 'border-[#d3d3d3] hover:border-[#111111]',
      ].join(' ')}
    >
      <input
        type="radio"
        name="paymentOption"
        value={value}
        checked={checked}
        className="mt-1 size-4 accent-[#111111]"
        onChange={() => onChange(value)}
      />
      <span>
        <span className="block text-sm font-black uppercase tracking-[0.16em]">
          {label}
        </span>
        <span className="mt-2 block text-sm font-semibold leading-6 tracking-[0.04em] text-[#555555]">
          {description}
        </span>
      </span>
    </label>
  )
}

function FormField({
  autoComplete,
  error,
  inputMode,
  label,
  name,
  onChange,
  value,
}: {
  autoComplete?: string
  error?: string
  inputMode?: 'tel'
  label: string
  name: keyof CheckoutFormValues
  onChange: (value: string) => void
  value: string
}) {
  const errorId = `${name}-error`

  return (
    <div>
      <label
        htmlFor={name}
        className="text-xs font-bold uppercase tracking-[0.16em] text-[#555555]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        className="mt-2 h-12 w-full min-w-0 border border-[#cfcfcf] bg-transparent px-4 text-base font-medium text-[#111111] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#111111] sm:h-14"
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p
          id={errorId}
          className="mt-2 text-xs font-semibold leading-5 text-[#7a2e2e]"
        >
          {error}
        </p>
      ) : null}
    </div>
  )
}

function CheckoutSummary({
  isLoading,
  items,
  total,
}: {
  isLoading: boolean
  items: CartItem[]
  total: number
}) {
  if (isLoading) {
    return (
      <aside className="h-96 animate-pulse border border-[#d3d3d3] bg-[#111111]/10 lg:mt-28" />
    )
  }

  return (
    <aside className="border border-[#d3d3d3] bg-[#f4f4f1]/75 px-5 py-6 lg:sticky lg:top-8 lg:mt-28 lg:self-start lg:px-7 lg:py-8">
      <div className="flex items-center justify-between gap-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#777777]">
          Your Order
        </p>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#555555]">
          ({items.length})
        </span>
      </div>

      {items.length ? (
        <>
          <div className="mt-6 space-y-4 border-b border-[#d3d3d3] pb-5">
            {items.map((item) => (
              <OrderSummaryItem key={item.id} item={item} />
            ))}
          </div>
          <dl className="mt-5 space-y-4">
            <SummaryRow label="Subtotal" value={formatProductPrice(total)} />
            <SummaryRow label="Shipping" value="Included" />
            <SummaryRow
              label="Total"
              value={formatProductPrice(total)}
              className="pt-4 text-lg"
            />
          </dl>
        </>
      ) : (
        <div className="mt-7 border-y border-[#d3d3d3] py-8">
          <p className="text-sm font-semibold leading-6 tracking-[0.04em] text-[#555555]">
            Your cart is empty.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-flex h-11 items-center justify-center border border-[#111111] px-5 text-xs font-bold uppercase tracking-[0.16em] text-[#111111] transition hover:bg-[#111111] hover:text-white"
          >
            Shop Collections
          </Link>
        </div>
      )}
    </aside>
  )
}

function OrderSummaryItem({ item }: { item: CartItem }) {
  return (
    <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-4">
      <Link
        to={`/products/${item.productId}`}
        className="grid aspect-square place-items-center border border-[#d3d3d3] bg-[#ededeb]"
        aria-label={`View ${item.productName}`}
      >
        <img
          src="/logo/KNG_Logo-removebg.png"
          alt=""
          className="size-10 object-contain opacity-70"
        />
      </Link>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase tracking-normal">
              {item.productName}
            </p>
            <p className="mt-1 text-sm font-medium leading-6 tracking-[0.04em] text-[#555555]">
              {item.color}/{item.size} x {item.quantity}
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold">
            {formatProductPrice(item.subtotal)}
          </p>
        </div>
      </div>
    </div>
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

function CheckoutComplete({ result }: { result: CheckoutResult }) {
  return (
    <div
      className="mt-8 max-w-2xl border border-[#111111] bg-[#111111]/5 px-5 py-6"
      role="status"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#777777]">
        Order Complete
      </p>
      <h2 className="mt-3 text-2xl font-black uppercase tracking-normal">
        Thank you
      </h2>
      <p className="mt-3 text-sm font-semibold leading-6 tracking-[0.04em] text-[#555555]">
        Order {formatOrderId(result.orderId)} was placed with{' '}
        {result.paymentOption}. Returning to home.
      </p>
    </div>
  )
}

function getInitialCheckoutValues(user: User | null): CheckoutFormValues {
  return {
    address: '',
    city: '',
    note: '',
    phone: user?.phoneNumber ?? '',
    shippingName: user?.fullName ?? '',
  }
}

function trimCheckoutValues(values: CheckoutFormValues): CheckoutFormValues {
  return {
    address: values.address.trim(),
    city: values.city.trim(),
    note: values.note.trim(),
    phone: values.phone.trim(),
    shippingName: values.shippingName.trim(),
  }
}

function validateCheckoutInformation(values: CheckoutFormValues) {
  const nextErrors: CheckoutFormErrors = {}

  if (!values.shippingName) {
    nextErrors.shippingName = 'Shipping name is required.'
  }

  if (!values.phone) {
    nextErrors.phone = 'Phone is required.'
  }

  if (!values.address) {
    nextErrors.address = 'Address is required.'
  }

  if (!values.city) {
    nextErrors.city = 'City is required.'
  }

  return nextErrors
}

function formatProductPrice(price: number) {
  return vndFormatter.format(price).replace(/\s/g, ' ')
}

function formatOrderId(orderId: string) {
  return `#${orderId.slice(0, 8).toUpperCase()}`
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
