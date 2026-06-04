import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

type LoginFormValues = {
  email: string
  password: string
}

const initialFormValues: LoginFormValues = {
  email: '',
  password: '',
}

export function LoginPage() {
  const [values, setValues] = useState(initialFormValues)
  const [message, setMessage] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Login is not connected yet.')
  }

  function updateField(field: keyof LoginFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setMessage(null)
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
          Sign in will connect to your customer profile once the full login flow
          is wired.
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
            This is a temporary login screen.
          </p>
        </div>

        <form
          className="mx-auto mt-8 max-w-full space-y-5"
          style={{ width: 'min(100%, calc(100vw - 6rem))' }}
          onSubmit={handleSubmit}
        >
          <FormField
            autoComplete="email"
            inputMode="email"
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={(value) => updateField('email', value)}
          />
          <FormField
            autoComplete="current-password"
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={(value) => updateField('password', value)}
          />

          {message ? (
            <div
              className="border border-[#111111] bg-[#111111]/5 px-4 py-3 text-sm font-semibold leading-6 text-[#111111]"
              role="status"
            >
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center bg-[#111111] px-6 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[#2a2a2a] sm:h-14"
          >
            Login
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
  inputMode,
  label,
  name,
  onChange,
  type = 'text',
  value,
}: {
  autoComplete?: string
  inputMode?: 'email'
  label: string
  name: keyof LoginFormValues
  onChange: (value: string) => void
  type?: 'email' | 'password' | 'text'
  value: string
}) {
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
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
