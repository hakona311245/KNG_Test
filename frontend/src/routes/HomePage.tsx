import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from '../components/icons'

const featuredProducts = [
  {
    category: 'Cotton T Shirt',
    image: '/product/whitepant.png',
    name: 'Full Sleeve Zipper',
    price: '$ 199',
  },
  {
    category: 'Cotton T Shirt',
    image: '/product/blackTshirt.png',
    name: 'Full Sleeve Zipper',
    price: '$ 199',
  },
  {
    category: 'Cotton T Shirt',
    image: '/product/whitepant.png',
    name: 'Full Sleeve Zipper',
    price: '$ 199',
  },
]

export function HomePage() {
  return (
    <section className="mx-auto min-h-[calc(100vh-6rem)] max-w-[1480px] px-6 pb-10 pt-6 sm:px-10 lg:min-h-[calc(100vh-9rem)] lg:px-16 lg:pb-16 lg:pt-0">
      <div className="grid gap-10 lg:grid-cols-[560px_minmax(0,1fr)] lg:gap-20 xl:grid-cols-[600px_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col lg:min-h-[calc(100vh-9rem)]">
          <Link
            to="/products"
            className="mt-6 flex h-11 w-full max-w-[448px] items-center justify-between bg-[#dedede]/85 px-6 text-[#111111] transition hover:bg-[#d4d4d4] md:h-14 lg:mt-16"
          >
            <SearchIcon className="size-7" />
            <span className="text-base tracking-[0.18em] text-[#595959]">
              Search
            </span>
          </Link>

          <div className="mt-12 md:mt-16 lg:mt-auto">
            <h1 className="max-w-[560px] text-[3.25rem] font-black uppercase leading-[0.9] tracking-normal text-[#222222] md:text-[4.4rem] lg:text-[4.65rem] xl:text-[5.15rem]">
              NEW
              <br />
              COLLECTION
            </h1>
            <p className="mt-5 text-2xl font-medium leading-[1.45] tracking-[0.08em] text-[#222222]">
              Summer
              <br />
              2024
            </p>
          </div>

          <div className="hidden items-center gap-8 pt-20 lg:flex">
            <ShopCta />
            <CarouselControls />
          </div>
        </div>

        <div className="min-w-0 lg:flex lg:items-end">
          <div className="hidden w-full grid-cols-2 gap-10 lg:grid">
            <HeroImage
              alt="White outfit from the new collection"
              className="aspect-[1.02]"
              src="/product/whitepant.png"
            />
            <HeroImage
              alt="Black graphic shirt from the new collection"
              className="aspect-[1.02]"
              src="/product/blackshirt.png"
            />
          </div>

          <div className="-mx-6 mt-2 lg:hidden">
            <div className="flex gap-3 overflow-x-auto px-6 pb-2">
              {featuredProducts.map((product, index) => (
                <ProductTile key={`${product.name}-${index}`} {...product} />
              ))}
            </div>
            <div className="mt-5 px-6">
              <ShopCta />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroImage({
  alt,
  className = '',
  src,
}: {
  alt: string
  className?: string
  src: string
}) {
  return (
    <div className={`border border-[#d3d3d3] bg-[#f2f2f2] ${className}`}>
      <img src={src} alt={alt} className="size-full object-cover" />
    </div>
  )
}

function ProductTile({
  category,
  image,
  name,
  price,
}: {
  category: string
  image: string
  name: string
  price: string
}) {
  return (
    <article className="w-[42vw] min-w-[160px] max-w-[190px] shrink-0">
      <div className="aspect-square border border-[#d3d3d3] bg-[#f2f2f2]">
        <img src={image} alt={name} className="size-full object-cover" />
      </div>
      <p className="mt-2 text-xs font-medium text-[#555555]">{category}</p>
      <div className="mt-1 grid grid-cols-[1fr_auto] gap-2 text-sm font-semibold leading-tight text-[#111111]">
        <h2>{name}</h2>
        <span>{price}</span>
      </div>
    </article>
  )
}

function ShopCta() {
  return (
    <Link
      to="/products"
      className="flex h-11 w-[170px] items-center justify-between bg-[#dedede]/90 px-5 text-base font-semibold text-[#111111] transition hover:bg-[#d4d4d4] md:h-16 md:w-80 md:px-8 md:text-xl"
    >
      <span>Go To Shop</span>
      <ArrowRightIcon className="h-5 w-11 md:h-6 md:w-16" />
    </Link>
  )
}

function CarouselControls() {
  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        className="grid size-14 place-items-center border border-[#cfcfcf] text-[#8a8a8a]"
        aria-label="Previous collection image"
      >
        <ChevronLeftIcon className="size-6" />
      </button>
      <button
        type="button"
        className="grid size-14 place-items-center border border-[#cfcfcf] text-[#111111]"
        aria-label="Next collection image"
      >
        <ChevronRightIcon className="size-6" />
      </button>
    </div>
  )
}
