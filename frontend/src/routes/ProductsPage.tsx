import type { ReactNode } from 'react'
import { PrimaryLink } from '../components/links'

export function ProductsPage() {
  return (
    <PageFrame
      title="Products"
      description="Catalog listing will call GET /api/products with type, size, color, page, and limit filters."
    >
      <PrimaryLink to="/products/demo-product-id">Open product detail</PrimaryLink>
    </PageFrame>
  )
}

export function PageFrame({
  children,
  description,
  title,
}: {
  children?: ReactNode
  description: string
  title: string
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-normal text-zinc-950">
          {title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </section>
  )
}
