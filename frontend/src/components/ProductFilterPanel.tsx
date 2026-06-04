import type { ProductType, Size } from '../types/api'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

const fallbackSizes: Size[] = ['S', 'M', 'L', 'XL']
const categoryOptions: Array<{ label: string; value: ProductType }> = [
  { label: 'SHIRT', value: 'SHIRT' },
  { label: 'PANTS', value: 'PANT' },
  { label: 'JACKET', value: 'JACKET' },
]
const collapsedRows = ['Colors', 'Price Range', 'Collections', 'Tags', 'Ratings']

export function ProductFilterPanel({
  activeSize,
  activeType,
  className = '',
  onClose,
  onSizeChange,
  onTypeChange,
  sizes,
}: {
  activeSize?: Size
  activeType?: ProductType
  className?: string
  onClose?: () => void
  onSizeChange: (size?: Size) => void
  onTypeChange: (type?: ProductType) => void
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

      <div className="mt-8">
        <div className="border-b border-dashed border-[#d0d0d0] py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold tracking-[0.08em] text-[#111111]">
              Category
            </h3>
            <ChevronLeftIcon className="size-4 rotate-90" />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {categoryOptions.map((category) => {
              const isActive = category.value === activeType

              return (
                <button
                  key={category.value}
                  type="button"
                  className={[
                    'h-9 border px-3 text-left text-xs font-semibold tracking-[0.14em] transition',
                    isActive
                      ? 'border-[#111111] bg-[#111111] text-white'
                      : 'border-[#bdbdbd] bg-transparent text-[#111111] hover:border-[#111111]',
                  ].join(' ')}
                  onClick={() =>
                    onTypeChange(isActive ? undefined : category.value)
                  }
                >
                  {category.label}
                </button>
              )
            })}
          </div>
        </div>

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
