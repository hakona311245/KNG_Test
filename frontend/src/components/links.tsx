import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'

export function PrimaryLink({
  children,
  to,
}: {
  children: ReactNode
  to: string
}) {
  return (
    <Link
      to={to}
      className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
    >
      {children}
    </Link>
  )
}

export function HeaderNavLink({
  children,
  to,
}: {
  children: ReactNode
  to: string
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'text-sm font-semibold tracking-[0.18em] transition sm:text-base',
          isActive ? 'text-[#111111]' : 'text-[#111111]/75 hover:text-[#111111]',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}
