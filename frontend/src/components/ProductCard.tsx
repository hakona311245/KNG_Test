import { Link } from 'react-router-dom'
import type { ProductListItem } from '../types/api'
import { useState } from 'react'

const fallbackImages: Record<ProductListItem['type'], string> = {
  JACKET: '/product/blackshirt.png',
  PANT: '/product/whitepant.png',
  SHIRT: '/product/blackTshirt.png',
}

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function ProductCard({ product }: { product: ProductListItem }) {
  const fallbackImage = fallbackImages[product.type]
  const [imageUrl, setImageUrl] = useState(
    getInitialImageUrl(product.thumbnailUrl, fallbackImage),
  )
  const colorsToShow = product.availableColors.slice(0, 1)
  const remainingColorCount = Math.max(product.availableColors.length - 1, 0)

  return (
    <Link
      to={`/products/${product.id}`}
      className="group block min-w-0 text-[#111111]"
    >
      <div className="aspect-[0.86] overflow-hidden border border-[#d3d3d3] bg-[#f2f2f2] sm:aspect-[0.84] lg:aspect-[0.86]">
        <img
          src={imageUrl}
          alt={product.name}
          className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={() => setImageUrl(fallbackImage)}
        />
      </div>

      <div className="mt-2 min-w-0">
        <div className="flex min-w-0 items-center gap-1.5 text-xs font-medium leading-none text-[#555555] sm:text-sm">
          <span className="truncate">{product.material}</span>
          {colorsToShow.map((color) => (
            <span
              key={color}
              className="size-3 shrink-0 border border-[#bdbdbd]"
              style={{ backgroundColor: getSwatchColor(color) }}
              aria-label={color}
            />
          ))}
          {remainingColorCount > 0 ? (
            <span className="shrink-0 text-[0.65rem] text-[#6f6f6f]">
              +{remainingColorCount}
            </span>
          ) : null}
        </div>

        <div className="mt-1 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 text-sm font-semibold leading-tight sm:text-base">
          <h2 className="truncate">{product.name}</h2>
          <span className="whitespace-nowrap text-xs sm:text-sm">
            {formatProductPrice(product.price)}
          </span>
        </div>
      </div>
    </Link>
  )
}

function formatProductPrice(price: number) {
  return vndFormatter.format(price).replace(/\s/g, ' ')
}

function getInitialImageUrl(thumbnailUrl: string | null, fallbackImage: string) {
  if (!thumbnailUrl || thumbnailUrl.includes('example.com')) {
    return fallbackImage
  }

  return thumbnailUrl
}

function getSwatchColor(color: string) {
  const normalized = color.trim().toLowerCase()
  const knownColors: Record<string, string> = {
    black: '#111111',
    blue: '#5d7895',
    brown: '#7a5a42',
    cream: '#eee5d4',
    gray: '#8a8a8a',
    green: '#5f6f55',
    grey: '#8a8a8a',
    navy: '#1f2d44',
    red: '#9f3b35',
    white: '#f7f7f7',
  }

  return knownColors[normalized] ?? '#d9d9d9'
}
