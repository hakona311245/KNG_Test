import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { toApiError } from '../lib/api'
import type { ApiError } from '../types/api'

type RegisterFormValues = {
  email: string
  fullName: string
  password: string
  phoneNumber: string
}

type RegisterFormErrors = Partial<Record<keyof RegisterFormValues, string>>

const initialFormValues: RegisterFormValues = {
  email: '',
  fullName: '',
  password: '',
  phoneNumber: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [values, setValues] = useState(initialFormValues)
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [apiError, setApiError] = useState<ApiError | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedValues = {
      email: values.email.trim(),
      fullName: values.fullName.trim(),
      password: values.password,
      phoneNumber: values.phoneNumber.trim(),
    }
    const nextErrors = validateRegisterForm(trimmedValues)

    setErrors(nextErrors)
    setApiError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await register(trimmedValues)
      navigate('/login')
    } catch (error) {
      setApiError(toApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateField(field: keyof RegisterFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))

    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1480px] min-w-0 overflow-hidden px-6 pb-16 pt-4 text-[#111111] sm:px-10 lg:min-h-[calc(100vh-9rem)] lg:grid-cols-[minmax(0,1fr)_540px] lg:items-center lg:gap-20 lg:px-16 lg:pb-24">
      <div className="hidden lg:block">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#777777]">
          Customer Account
        </p>
        <h1 className="mt-5 max-w-xl text-[4.35rem] font-black uppercase leading-[0.9] tracking-normal xl:text-[5.15rem]">
          Join
          <br />
          KNG Fashion
        </h1>
        <p className="mt-7 max-w-md text-base font-medium leading-7 tracking-[0.04em] text-[#555555]">
          Create your customer profile to save your cart, checkout faster, and
          keep your order history in one place.
        </p>
      </div>

      <div
        className="min-w-0 max-w-full justify-self-center border border-[#d3d3d3] bg-[#f4f4f1]/75 px-5 py-7 backdrop-blur-sm sm:px-8 sm:py-9 lg:px-10"
        style={{ width: 'min(100%, calc(100vw - 4rem))' }}
      >
        <div className="lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#777777]">
            Customer Account
          </p>
          <h1 className="mt-3 text-[2.9rem] font-black uppercase leading-none tracking-normal">
            Register
          </h1>
        </div>

        <div className="hidden lg:block">
          <h2 className="text-[2.2rem] font-black uppercase leading-none tracking-normal">
            Register
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 tracking-[0.04em] text-[#555555]">
            Use your email, full name, password, and phone number.
          </p>
        </div>

        <form
          className="mx-auto mt-8 max-w-full space-y-5"
          style={{ width: 'min(100%, calc(100vw - 6rem))' }}
          noValidate
          onSubmit={handleSubmit}
        >
          <FormField
            autoComplete="name"
            error={errors.fullName}
            label="Full Name"
            name="fullName"
            value={values.fullName}
            onChange={(value) => updateField('fullName', value)}
          />
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
            autoComplete="tel"
            error={errors.phoneNumber}
            inputMode="tel"
            label="Phone Number"
            name="phoneNumber"
            value={values.phoneNumber}
            onChange={(value) => updateField('phoneNumber', value)}
          />
          <FormField
            autoComplete="new-password"
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
            {isSubmitting ? 'Creating Account' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-sm font-medium leading-6 tracking-[0.04em] text-[#555555]">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-bold uppercase tracking-[0.12em] text-[#111111] underline-offset-4 hover:underline"
          >
            Login
          </Link>
        </p>
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
  inputMode?: 'email' | 'tel'
  label: string
  name: keyof RegisterFormValues
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

function validateRegisterForm(values: RegisterFormValues) {
  const nextErrors: RegisterFormErrors = {}

  if (!values.fullName) {
    nextErrors.fullName = 'Full name is required.'
  }

  if (!values.email) {
    nextErrors.email = 'Email is required.'
  } else if (!emailPattern.test(values.email)) {
    nextErrors.email = 'Enter a valid email address.'
  }

  if (!values.phoneNumber) {
    nextErrors.phoneNumber = 'Phone number is required.'
  }

  if (!values.password) {
    nextErrors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    nextErrors.password = 'Password must be at least 8 characters.'
  }

  return nextErrors
}
