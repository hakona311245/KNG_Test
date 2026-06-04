import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { toApiError } from '../lib/api'
import type { ApiError, Role } from '../types/api'

type LoginFormValues = {
  email: string
  password: string
}

type LoginFormErrors = Partial<Record<keyof LoginFormValues, string>>

type RedirectLocation = {
  pathname?: string
  search?: string
  hash?: string
}

type LoginLocationState = {
  from?: RedirectLocation
}

const initialFormValues: LoginFormValues = {
  email: '',
  password: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, isBootstrapping, login, user } = useAuth()
  const locationState = location.state as LoginLocationState | null
  const redirectTarget = getPostLoginPath(locationState?.from, user?.role)
  const [values, setValues] = useState(initialFormValues)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedValues = {
      email: values.email.trim(),
      password: values.password,
    }
    const nextErrors = validateLoginForm(trimmedValues)

    setErrors(nextErrors)
    setApiError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const loggedInUser = await login(trimmedValues)
      navigate(getPostLoginPath(locationState?.from, loggedInUser.role), {
        replace: true,
      })
    } catch (error) {
      setApiError(normalizeLoginError(error))
      setIsSubmitting(false)
    }
  }

  function updateField(field: keyof LoginFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }

    if (apiError) {
      setApiError(null)
    }
  }

  if (isBootstrapping) {
    return <LoginLoadingState />
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTarget} replace />
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1480px] min-w-0 overflow-hidden px-6 pb-16 pt-4 text-[#111111] sm:px-10 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[minmax(0,1fr)_540px] lg:items-center lg:gap-20 lg:px-16 lg:pb-24">
      <div className="hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#777777]">
          Customer Access
        </p>
        <h1 className="mt-5 max-w-xl text-[4.35rem] font-black uppercase leading-[0.9] tracking-normal xl:text-[5.15rem]">
          Welcome
          <br />
          Back
        </h1>
        <p className="mt-7 max-w-md text-base font-medium leading-7 tracking-[0.04em] text-[#555555]">
          Sign in to continue your cart, checkout, and order history through
          your KNG Fashion profile.
        </p>
      </div>

      <div
        className="min-w-0 max-w-full justify-self-center border border-[#d3d3d3] bg-[#f4f4f1]/75 px-5 py-7 backdrop-blur-sm sm:px-8 sm:py-9 lg:px-10"
        style={{ width: 'min(100%, calc(100vw - 4rem))' }}
      >
        <div className="lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#777777]">
            Customer Access
          </p>
          <h1 className="mt-3 text-[2.9rem] font-black uppercase leading-none tracking-normal">
            Login
          </h1>
        </div>

        <div className="hidden lg:block">
          <h2 className="text-[2.2rem] font-black uppercase leading-none tracking-normal">
            Login
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 tracking-[0.04em] text-[#555555]">
            Use your email and password.
          </p>
        </div>

        <form
          className="mx-auto mt-8 max-w-full space-y-5"
          style={{ width: 'min(100%, calc(100vw - 6rem))' }}
          noValidate
          onSubmit={handleSubmit}
        >
          <FormField
            autoComplete="email"
            error={errors.email}
            inputMode="email"
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={(value) => updateField('email', value)}
          />
          <FormField
            autoComplete="current-password"
            error={errors.password}
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={(value) => updateField('password', value)}
          />

          {apiError ? (
            <div
              className="border border-[#111111] bg-[#111111]/5 px-4 py-3 text-sm font-semibold leading-6 text-[#111111]"
              role="alert"
            >
              {apiError.message}
            </div>
          ) : null}

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center bg-[#111111] px-6 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:bg-[#8a8a8a] sm:h-14"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging In' : 'Login'}
          </button>
        </form>

        <Link
          to="/register"
          className="mt-4 flex h-12 w-full items-center justify-center border border-[#111111] px-6 text-sm font-bold uppercase tracking-[0.18em] text-[#111111] transition hover:bg-[#111111] hover:text-white sm:h-14"
        >
          Create Account
        </Link>
      </div>
    </section>
  )
}

function FormField({
  autoComplete,
  error,
  inputMode,
  label,
  name,
  onChange,
  type = 'text',
  value,
}: {
  autoComplete?: string
  error?: string
  inputMode?: 'email'
  label: string
  name: keyof LoginFormValues
  onChange: (value: string) => void
  type?: 'email' | 'password' | 'text'
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
        type={type}
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

function LoginLoadingState() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-[1480px] items-center px-6 pb-16 pt-4 text-[#111111] sm:px-10 lg:min-h-[calc(100vh-9rem)] lg:px-16 lg:pb-24">
      <div className="border border-[#d3d3d3] bg-[#f4f4f1]/75 px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-[#555555]">
        Loading Session
      </div>
    </section>
  )
}

function validateLoginForm(values: LoginFormValues) {
  const nextErrors: LoginFormErrors = {}

  if (!values.email) {
    nextErrors.email = 'Email is required.'
  } else if (!emailPattern.test(values.email)) {
    nextErrors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    nextErrors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    nextErrors.password = 'Password must be at least 8 characters.'
  }

  return nextErrors
}

function getPostLoginPath(from: RedirectLocation | undefined, role?: Role) {
  const safeFrom = getSafeRedirectPath(from)

  if (role === 'CUSTOMER' && safeFrom && !safeFrom.startsWith('/admin')) {
    return safeFrom
  }

  if (role === 'ADMIN' && safeFrom?.startsWith('/admin')) {
    return safeFrom
  }

  return '/profile'
}

function getSafeRedirectPath(from: RedirectLocation | undefined) {
  const pathname = from?.pathname

  if (!pathname || !pathname.startsWith('/') || pathname.startsWith('//')) {
    return null
  }

  if (isAuthPath(pathname)) {
    return null
  }

  return `${pathname}${from.search ?? ''}${from.hash ?? ''}`
}

function isAuthPath(pathname: string) {
  return (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/login/') ||
    pathname.startsWith('/register/')
  )
}

function normalizeLoginError(error: unknown): ApiError {
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
