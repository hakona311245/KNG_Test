import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BagIcon, HeartIcon, MenuIcon, UserIcon } from './icons'
import { HeaderNavLink } from './links'

const categoryLinks = [
  { label: 'SHIRT', to: '/products?type=SHIRT' },
  { label: 'PANTS', to: '/products?type=PANT' },
  { label: 'JACKET', to: '/products?type=JACKET' },
]

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="relative z-30">
      <div className="mx-auto grid h-24 max-w-[1480px] grid-cols-[1fr_auto_1fr] items-center px-6 sm:h-28 sm:px-10 lg:h-36 lg:px-16">
        <div className="flex items-center gap-9">
          <button
            type="button"
            className="grid size-10 place-items-center text-[#111111]"
            aria-controls="site-category-menu"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close category menu' : 'Open category menu'}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <MenuIcon className="size-7" />
          </button>

          <nav className="hidden items-center gap-12 md:flex">
            <HeaderNavLink to="/">Home</HeaderNavLink>
            <HeaderNavLink to="/products">Collections</HeaderNavLink>
          </nav>
        </div>

        <HeaderNavLink to="/">
          <img
            src="/logo/KNG_Logo_transparent.png"
            alt="KNG Fashion"
            className="size-12 object-contain sm:size-14 lg:size-16"
          />
        </HeaderNavLink>

        <nav className="flex items-center justify-end gap-3 sm:gap-6">
          <HeaderIconLink label="Wishlist" to="/products" className="hidden md:grid">
            <HeartIcon className="size-5" />
          </HeaderIconLink>

          <HeaderNavLink to="/cart">
            <span className="hidden h-16 items-center rounded-full bg-[#111111] px-9 text-base font-semibold tracking-[0.18em] text-white md:inline-flex">
              Cart
            </span>
          </HeaderNavLink>

          <HeaderIconLink label="Cart" to="/cart">
            <BagIcon className="size-5" />
          </HeaderIconLink>

          <HeaderIconLink label="Profile" to="/login" inverted>
            <UserIcon className="size-5" />
          </HeaderIconLink>
        </nav>
      </div>

      <div
        id="site-category-menu"
        aria-hidden={!isMenuOpen}
        className={[
          'overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out',
          isMenuOpen
            ? 'visible max-h-40 translate-y-0 opacity-100'
            : 'invisible pointer-events-none max-h-0 -translate-y-2 opacity-0',
        ].join(' ')}
      >
        <nav className="mx-auto max-w-[1480px] px-6 pb-8 sm:px-10 lg:px-16">
          <div className="space-y-0 text-lg font-medium leading-[1.45] tracking-[0.08em] text-[#333333] md:text-xl">
            {categoryLinks.map((category) => (
              <Link
                key={category.label}
                to={category.to}
                className="block w-fit transition hover:text-[#111111]"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}

function HeaderIconLink({
  children,
  className = '',
  inverted = true,
  label,
  to,
}: {
  children: ReactNode
  className?: string
  inverted?: boolean
  label: string
  to: string
}) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={[
        'grid size-11 place-items-center rounded-full border border-[#111111] transition sm:size-14',
        inverted
          ? 'bg-[#111111] text-white'
          : 'bg-[#f4f4f1]/80 text-[#111111]',
        className,
      ].join(' ')}
    >
      {children}
    </Link>
  )
}
