import type { Size } from '../types/api'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

const fallbackSizes: Size[] = ['S', 'M', 'L', 'XL']
const collapsedRows = [
  'Category',
  'Colors',
  'Price Range',
  'Collections',
  'Tags',
  'Ratings',
]

export function ProductFilterPanel({
  activeSize,
  className = '',
  onClose,
  onSizeChange,
  productCount,
  sizes,
}: {
  activeSize?: Size
  className?: string
  onClose?: () => void
  onSizeChange: (size?: Size) => void
  productCount: number
  sizes?: Size[]
}) {
  const sizeOptions = sizes?.length ? sizes : fallbackSizes

  return (
    <aside className={className}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-[0.08em] text-[#111111]">
          Filters
        </h2>
        {onClose ? (
          <button
            type="button"
            className="grid size-9 place-items-center text-[#111111]"
            aria-label="Close filters"
            onClick={onClose}
          >
            <ChevronLeftIcon className="size-5" />
          </button>
        ) : null}
      </div>

      <div className="mt-8">
        <h3 className="text-base font-bold tracking-[0.14em] text-[#111111]">
          Size
        </h3>
        <div className="mt-3 flex flex-wrap gap-1">
          {sizeOptions.map((size) => {
            const isActive = size === activeSize

            return (
              <button
                key={size}
                type="button"
                className={[
                  'grid size-10 place-items-center border text-sm font-medium transition',
                  isActive
                    ? 'border-[#111111] bg-[#111111] text-white'
                    : 'border-[#bdbdbd] bg-transparent text-[#111111] hover:border-[#111111]',
                ].join(' ')}
                onClick={() => onSizeChange(isActive ? undefined : size)}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8 border-b border-dashed border-[#d0d0d0] pb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold tracking-[0.14em] text-[#111111]">
            Availability
          </h3>
          <ChevronLeftIcon className="size-4 rotate-90" />
        </div>
        <div className="mt-4 space-y-4 text-sm font-medium tracking-[0.12em]">
          <label className="flex items-center gap-3">
            <span className="size-6 border border-[#bdbdbd]" />
            <span>Availability</span>
            <span className="text-[#1f3294]">({productCount})</span>
          </label>
          <label className="flex items-center gap-3 text-[#333333]">
            <span className="size-6 border border-[#bdbdbd]" />
            <span>Out Of Stock</span>
            <span className="text-[#1f3294]">(0)</span>
          </label>
        </div>
      </div>

      <div>
        {collapsedRows.map((row) => (
          <button
            key={row}
            type="button"
            className="flex h-12 w-full items-center justify-between border-b border-dashed border-[#d0d0d0] text-left text-base font-bold tracking-[0.08em] text-[#111111]"
          >
            <span>{row}</span>
            <ChevronRightIcon className="size-4" />
          </button>
        ))}
      </div>
    </aside>
  )
}
