import { Outlet } from 'react-router-dom'
import { HeaderNavLink, PrimaryLink } from '../components/links'

export function AppShell() {
  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <HeaderNavLink to="/">
            <span className="text-base font-semibold tracking-normal text-zinc-950">
              KNG Fashion
            </span>
          </HeaderNavLink>

          <nav className="hidden items-center gap-7 md:flex">
            <HeaderNavLink to="/products">Products</HeaderNavLink>
            <HeaderNavLink to="/cart">Cart</HeaderNavLink>
            <HeaderNavLink to="/admin">Admin</HeaderNavLink>
          </nav>

          <div className="flex items-center gap-3">
            <HeaderNavLink to="/login">Login</HeaderNavLink>
            <PrimaryLink to="/register">Register</PrimaryLink>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
