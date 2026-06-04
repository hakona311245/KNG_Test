import { useState, type FormEvent } from 'react'
import { SearchIcon } from './icons'

export function SearchBar({
  initialValue = '',
  onSearch,
}: {
  initialValue?: string
  onSearch?: (value: string) => void
}) {
  const [value, setValue] = useState(initialValue)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch?.(value.trim())
  }

  return (
    <form
      className="flex h-10 w-full items-center justify-between bg-[#dedede]/90 px-4 text-[#111111] sm:h-12 sm:px-6 md:h-14"
      role="search"
      onSubmit={handleSubmit}
    >
      <SearchIcon className="size-5 sm:size-6" />
      <input
        type="search"
        value={value}
        className="min-w-0 flex-1 bg-transparent text-right text-sm tracking-[0.22em] text-[#5f5f5f] outline-none placeholder:text-[#5f5f5f]"
        placeholder="Search"
        aria-label="Search products"
        onChange={(event) => setValue(event.target.value)}
      />
    </form>
  )
}
