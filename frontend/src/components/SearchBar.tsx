import { SearchIcon } from './icons'

export function SearchBar() {
  return (
    <div
      className="flex h-10 w-full items-center justify-between bg-[#dedede]/90 px-4 text-[#111111] sm:h-12 sm:px-6 md:h-14"
      role="search"
      aria-label="Product search is not active yet"
    >
      <SearchIcon className="size-5 sm:size-6" />
      <span className="text-sm tracking-[0.22em] text-[#5f5f5f]">Search</span>
    </div>
  )
}
