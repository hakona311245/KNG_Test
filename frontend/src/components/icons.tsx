import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M3 6h15M3 12h10M3 18h7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m15.8 15.8 4.2 4.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 19.2c-3.9-2.9-6.5-5.2-6.5-8.2 0-1.9 1.2-3.4 3.1-3.4 1.2 0 2.4.7 3.1 1.8.7-1.1 1.9-1.8 3.1-1.8 1.9 0 3.1 1.5 3.1 3.4 0 3-2.6 5.3-6.5 8.2Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function BagIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.2 8.4h9.6l-.7 10.2H7.9L7.2 8.4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
      <path
        d="M9.3 9V7.3a2.7 2.7 0 0 1 5.4 0V9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="8.2" r="3.1" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M6.4 19c.9-2.7 3-4.2 5.6-4.2s4.7 1.5 5.6 4.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 40 24" fill="none" aria-hidden="true" {...props}>
      <path d="M2 12h34" stroke="currentColor" strokeWidth="1.7" />
      <path d="m28 5 8 7-8 7" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m14.5 6-6 6 6 6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m9.5 6 6 6-6 6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
