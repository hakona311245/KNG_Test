import { Link } from 'react-router-dom'
import { ArrowRightIcon, ChevronLeftIcon } from './icons'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Collection', to: '/products' },
  { label: 'Placeholder - About', to: '/about' },
  { label: 'Placeholder - Contact', to: '/contact' },
]

const languages = ['ENG', 'VN']

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[#d6d6d6]/70 bg-[#f4f4f1]/85 text-[#111111]">
      <div className="mx-auto grid max-w-[1480px] gap-16 px-6 py-16 sm:px-10 lg:grid-cols-[280px_minmax(0,1fr)_280px] lg:px-16 lg:py-24">
        <section>
          <FooterLabel>Navigation</FooterLabel>
          <nav className="mt-8 space-y-3" aria-label="Footer navigation">
            {footerLinks.map((link, index) => (
              <Link
                key={link.label}
                to={link.to}
                className="group flex w-fit items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#111111]/70 transition hover:text-[#111111]"
              >
                <span>{link.label}</span>
                {index < footerLinks.length - 1 ? (
                  <span className="text-[#111111]/25">/</span>
                ) : null}
                <ArrowRightIcon className="h-3 w-8 opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </nav>
        </section>

        <section className="lg:justify-self-center">
          <FooterLabel>KNG Fashion</FooterLabel>
          <Link
            to="/"
            className="mt-7 flex w-fit items-center gap-6"
            aria-label="KNG Fashion home"
          >
            <img
              src="/logo/KNG_Logo-removebg.png"
              alt=""
              className="size-20 object-contain lg:size-24"
            />
            <div className="text-[4.5rem] font-black uppercase leading-[0.78] tracking-normal text-[#111111] sm:text-[5.5rem] lg:text-[6.25rem]">
              KNG
              <br />
              Store
            </div>
          </Link>
        </section>

        <section className="lg:justify-self-end lg:text-right">
          <FooterLabel>Languages</FooterLabel>
          <div className="mt-8 flex gap-4 lg:justify-end">
            {languages.map((language, index) => (
              <button
                key={language}
                type="button"
                className="text-sm font-semibold uppercase tracking-[0.12em] text-[#111111]/70 transition hover:text-[#111111]"
              >
                {language}
                {index < languages.length - 1 ? (
                  <span className="ml-4 text-[#111111]/25">/</span>
                ) : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="mt-12 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]/45 transition hover:text-[#111111]"
            onClick={() => window.scrollTo({ behavior: 'smooth', top: 0 })}
          >
            <ChevronLeftIcon className="size-4 rotate-90" />
            To Top
          </button>
        </section>
      </div>

      <div className="mx-auto flex max-w-[1480px] flex-col gap-3 border-t border-[#d6d6d6]/70 px-6 py-5 text-[0.7rem] font-medium lowercase tracking-normal text-[#111111]/40 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-16">
        <p>© 2026 — KNG Fashion</p>
        <div className="flex gap-8">
          <Link to="/privacy" className="transition hover:text-[#111111]/70">
            privacy
          </Link>
          <Link to="/terms" className="transition hover:text-[#111111]/70">
            terms
          </Link>
        </div>
      </div>
    </footer>
  )
}

function FooterLabel({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#111111]/40">
      {children}
    </h2>
  )
}
