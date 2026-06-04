import type { ReactNode } from 'react'

export type AdminSection = {
  id: string
  label: string
  description: string
}

export type AdminTableColumn = {
  key: string
  label: string
  align?: 'left' | 'right'
}

export type AdminTableRow = {
  id: string
  cells: Record<string, ReactNode>
  actions?: ReactNode
}

export function AdminShell({
  activeSectionId,
  children,
  sections,
  onSectionChange,
}: {
  activeSectionId: string
  children: ReactNode
  sections: AdminSection[]
  onSectionChange: (sectionId: string) => void
}) {
  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-14 pt-2 text-[#111111] sm:px-10 lg:px-16 lg:pb-20">
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <AdminSectionMenu
          activeSectionId={activeSectionId}
          sections={sections}
          onSectionChange={onSectionChange}
        />
        <main className="min-w-0">{children}</main>
      </div>
    </section>
  )
}

export function AdminPageHeader({
  actions,
  description,
  title,
}: {
  actions?: ReactNode
  description: string
  title: string
}) {
  return (
    <div className="border-b border-[#d3d3d3] pb-7">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-[2.7rem] font-black uppercase leading-none tracking-normal sm:text-[3.5rem] lg:text-[4.35rem]">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-6 tracking-[0.04em] text-[#555555]">
            {description}
          </p>
        </div>
        {actions ? <div className="flex shrink-0 gap-3">{actions}</div> : null}
      </div>
    </div>
  )
}

export function AdminSectionPanel({
  children,
  description,
  eyebrow,
  title,
}: {
  children: ReactNode
  description?: string
  eyebrow?: string
  title: string
}) {
  return (
    <section className="border border-[#d3d3d3] bg-[#f4f4f1]/70">
      <div className="border-b border-[#d3d3d3] px-4 py-4 sm:px-5">
        {eyebrow ? (
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#777777]">
            {eyebrow}
          </p>
        ) : null}
        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2 className="text-2xl font-black uppercase leading-none tracking-normal">
            {title}
          </h2>
          {description ? (
            <p className="max-w-xl text-sm font-medium leading-6 tracking-[0.03em] text-[#555555]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}

export function AdminMetricGrid({
  metrics,
}: {
  metrics: Array<{
    label: string
    value: string
    detail: string
  }>
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="border border-[#d3d3d3] bg-[#f4f4f1]/80 px-4 py-4"
        >
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#777777]">
            {metric.label}
          </p>
          <p className="mt-5 text-4xl font-black uppercase leading-none tracking-normal">
            {metric.value}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#555555]">
            {metric.detail}
          </p>
        </div>
      ))}
    </div>
  )
}

export function AdminTable({
  columns,
  emptyLabel = 'No rows ready',
  rows,
}: {
  columns: AdminTableColumn[]
  emptyLabel?: string
  rows: AdminTableRow[]
}) {
  if (!rows.length) {
    return (
      <div className="border border-dashed border-[#c9c9c9] px-4 py-10 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#555555]">
          {emptyLabel}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-[#d3d3d3]">
      <table className="min-w-[760px] w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[#d3d3d3] bg-[#e7e7e3]">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={getCellClassName(column.align, true)}
              >
                {column.label}
              </th>
            ))}
            <th scope="col" className={getCellClassName('right', true)}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[#d3d3d3] last:border-b-0"
            >
              {columns.map((column) => (
                <td key={column.key} className={getCellClassName(column.align)}>
                  {row.cells[column.key]}
                </td>
              ))}
              <td className={getCellClassName('right')}>{row.actions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AdminActionButton({
  children,
  disabled = true,
  onClick,
  variant = 'secondary',
}: {
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}) {
  const className =
    variant === 'primary'
      ? 'border-[#111111] bg-[#111111] text-white disabled:border-[#777777] disabled:bg-[#777777]'
      : 'border-[#111111] bg-transparent text-[#111111] disabled:border-[#bdbdbd] disabled:text-[#777777]'

  return (
    <button
      type="button"
      className={`h-10 whitespace-nowrap border px-4 text-xs font-bold uppercase tracking-[0.16em] transition ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function AdminStatusBadge({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: 'active' | 'danger' | 'neutral' | 'warning'
}) {
  const toneClassName = {
    active: 'border-[#111111] text-[#111111]',
    danger: 'border-[#7a2e2e] text-[#7a2e2e]',
    neutral: 'border-[#a7a7a7] text-[#555555]',
    warning: 'border-[#8a6d2c] text-[#6d541f]',
  }[tone]

  return (
    <span
      className={`inline-flex h-7 items-center border px-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] ${toneClassName}`}
    >
      {label}
    </span>
  )
}

function AdminSectionMenu({
  activeSectionId,
  sections,
  onSectionChange,
}: {
  activeSectionId: string
  sections: AdminSection[]
  onSectionChange: (sectionId: string) => void
}) {
  return (
    <aside className="min-w-0 lg:sticky lg:top-8 lg:self-start">
      <div className="border-b border-[#d3d3d3] pb-4 lg:border lg:px-4 lg:py-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#777777]">
          Admin Menu
        </p>
        <nav
          aria-label="Admin sections"
          className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0"
        >
          {sections.map((section) => {
            const isActive = section.id === activeSectionId

            return (
              <button
                key={section.id}
                type="button"
                className={`min-w-[180px] border px-4 py-3 text-left transition lg:min-w-0 lg:w-full ${
                  isActive
                    ? 'border-[#111111] bg-[#111111] text-white'
                    : 'border-[#d3d3d3] bg-transparent text-[#111111] hover:border-[#111111]'
                }`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onSectionChange(section.id)}
              >
                <span className="block text-xs font-black uppercase tracking-[0.16em]">
                  {section.label}
                </span>
                <span
                  className={`mt-2 block text-xs font-medium leading-5 tracking-[0.03em] ${
                    isActive ? 'text-white/75' : 'text-[#666666]'
                  }`}
                >
                  {section.description}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

function getCellClassName(align: AdminTableColumn['align'], isHeader = false) {
  const baseClassName = isHeader
    ? 'px-4 py-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#555555]'
    : 'px-4 py-4 align-middle text-sm font-medium leading-6 text-[#111111]'
  const alignClassName = align === 'right' ? 'text-right' : 'text-left'

  return `${baseClassName} ${alignClassName}`
}
