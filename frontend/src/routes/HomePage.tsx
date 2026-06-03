import { PrimaryLink } from '../components/links'
import { API_BASE_URL } from '../lib/api'

export function HomePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold leading-tight tracking-normal text-zinc-950 sm:text-5xl">
          KNG Fashion storefront foundation
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600">
          React, Vite, Tailwind, routing, and credentialed Axios are wired for
          the backend API. The next pass can build the customer and admin flows
          on top of this shell.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <PrimaryLink to="/products">Browse products</PrimaryLink>
          <PrimaryLink to="/login">Sign in</PrimaryLink>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium text-zinc-500">API base URL</div>
        <div className="mt-2 break-all rounded-md bg-zinc-100 px-3 py-2 font-mono text-sm text-zinc-800">
          {API_BASE_URL}
        </div>
        <div className="mt-6 grid gap-3 text-sm text-zinc-600">
          <div className="rounded-md border border-zinc-200 p-3">
            Auth cookies use `withCredentials: true`.
          </div>
          <div className="rounded-md border border-zinc-200 p-3">
            Routes are ready for customer and admin pages.
          </div>
          <div className="rounded-md border border-zinc-200 p-3">
            Tokens must stay out of localStorage.
          </div>
        </div>
      </div>
    </section>
  )
}
