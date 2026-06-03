import type { ProductType } from '../types/api'

type CategoryChip = {
  label: string
  value?: ProductType
}

const categoryChips: CategoryChip[] = [
  { label: 'NEW' },
  { label: 'SHIRTS', value: 'SHIRT' },
  { label: 'PANTS', value: 'PANT' },
  { label: 'JACKETS', value: 'JACKET' },
]

export function CategoryChips({
  activeType,
  onTypeChange,
}: {
  activeType?: ProductType
  onTypeChange: (type?: ProductType) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">
      {categoryChips.map((chip) => {
        const isActive =
          chip.value === activeType || (!chip.value && activeType === undefined)

        return (
          <button
            key={chip.label}
            type="button"
            className={[
              'h-7 border border-[#c9c9c9] px-4 text-[0.65rem] font-medium uppercase tracking-normal transition',
              isActive
                ? 'bg-[#f4f4f1] text-[#111111]'
                : 'bg-transparent text-[#666666] hover:border-[#111111] hover:text-[#111111]',
            ].join(' ')}
            onClick={() => onTypeChange(chip.value)}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
