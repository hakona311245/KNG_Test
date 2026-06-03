# Global Storefront Design System

Use this as the shared design context for all KNG Fashion frontend pages. Reference images live in `docs/figma/`.

## Design Direction

- Monochrome editorial fashion storefront: off-white textured paper, black type, thin borders, large product photography.
- Keep pages sparse, geometric, and image-led. Avoid dashboard styling, colorful accents, gradients, nested cards, heavy shadows, and rounded card-heavy layouts.
- UI should feel like a fashion lookbook with ecommerce controls, not a marketing SaaS site.
- Desktop layouts use wide whitespace and asymmetric product imagery. Mobile layouts stack content vertically and use horizontal product strips where useful.

## Global Style Rules

- Background: full-page off-white paper/noise texture across every customer page.
- Palette:
  - Page: `#f4f4f1`
  - Text: `#111111`
  - Muted text: `#555555` / `#888888`
  - Border: `#d6d6d6`
  - Soft control fill: `#e4e4e4`
  - Active black controls: `#050505`
  - Optional count/accent blue from references: deep blue only for small counts.
- Typography:
  - Use a clean sans-serif globally.
  - Navigation, labels, filters: small uppercase or title case with positive letter spacing.
  - Page headings: bold uppercase.
  - Hero/display text: very heavy, uppercase, compact line height.
- Shapes:
  - Buttons, filters, inputs, cards, and image frames are mostly square rectangles.
  - Icon actions are circular.
  - Border radius should be `0` or very low.
- Inputs:
  - Transparent or off-white fields with thin gray border.
  - Search uses a soft gray rectangular fill with icon left and text aligned right.
- Buttons:
  - Primary CTA is a wide gray rectangle with text left/center and a long arrow right.
  - Add/continue buttons are full-width gray rectangles.
  - Quantity controls are small stacked square buttons.
- Images:
  - Product images should be clean studio or editorial fashion shots on pale backgrounds.
  - Image frames use thin gray borders and no heavy shadows.

## Shared Layout

- Header:
  - Desktop: hamburger, text nav, centered diamond logo, wishlist circle, cart pill + bag circle, profile circle.
  - Mobile: hamburger/back action left, diamond logo centered when applicable, cart/profile circles right.
  - Header should be transparent over the textured background, not a white bordered app bar.
- Main max width:
  - Desktop pages align to a wide canvas, roughly `1200px-1440px`.
  - Mobile pages use `24px` side padding.
- Footer:
  - Sparse footer with small muted labels, link stacks, centered logo/large type mark, copyright and privacy.
  - Keep it quiet and low contrast.

## Route And Page Map

| Route | Page | Design Source | Notes |
| --- | --- | --- | --- |
| `/` | Home | `Home.png`, `Home(mobile).png`, `gallery-carousel.png`, `product-carousel.png` | Editorial hero, category/search stack, product image carousel, shop CTA. |
| `/products` | Product list | `Products.png`, `product-mobile.png`, `product-filter.png` | Breadcrumb, title, search, category chips, filters, product grid/list. |
| `/products/:id` | Product detail | `product_detail.png`, `product_detail_mobile.png` | Gallery, thumbnails, product info panel, color/size selectors, add button. |
| `/cart` | Cart | `cart.png`, `cart_mobile.png` | Shopping bag list, item controls, order summary on desktop. |
| `/checkout` | Checkout | `checkout.png`, `checkout_mobile.png` | Back arrow, step tabs, shipping form, order summary. |
| `/login` | Login | No specific Figma reference | Use checkout form styling: bold page heading, thin bordered inputs, wide gray submit. |
| `/register` | Register | No specific Figma reference | Same as login, with extra full name and phone fields. |
| `/profile` | Profile | No specific Figma reference | Use checkout/form styling for account details and simple tab/sidebar navigation. |
| `/profile/orders` | Order history | Cart/checkout references | Use thin bordered order rows, status labels, product thumbnails, simple detail links. |
| `/profile/orders/:id` | Order detail | Cart/checkout references | Reuse order summary and item list patterns; include cancellation action for pending orders. |
| `/admin` and admin subroutes | Admin management | No Figma reference | Keep restrained monochrome, but denser table/forms are acceptable. Avoid decorative hero layouts. |
| `*` | Not found | Global style | Minimal centered message with CTA back to products/home. |

## Component Inventory

- `SiteHeader`: desktop/mobile responsive header with nav, logo, cart, profile, and back/menu variants.
- `DiamondLogo`: split gray/black diamond mark.
- `IconButton`: circular icon button for cart, user, wishlist, close, search, back.
- `Hero`: home-only editorial hero with category stack, search, display heading, CTA, and featured imagery.
- `SearchBar`: gray rectangular search field with icon and right-aligned placeholder.
- `CategoryChips`: thin bordered chips for New, Shirts, T-Shirts, Jeans, Jackets, etc.
- `FilterPanel`: desktop sidebar and mobile slide/side panel for size, availability, category, colors, price, collections, tags, ratings.
- `ProductCard`: image frame, small category line, product title, price, optional color swatch/count, optional quick add.
- `ProductCardList` / `ProductGrid`: responsive product collection layout; desktop grid, mobile two-column or horizontal strip depending page.
- `ProductCarousel`: horizontal row with product cards and square prev/next controls.
- `GalleryCarousel`: editorial image row with staggered large lifestyle images.
- `ProductGallery`: main product image plus thumbnail rail; desktop side thumbnails, mobile thumbnail strip.
- `ColorSwatches`: square swatches, active state by border.
- `SizeSelector`: bordered square size buttons.
- `QuantityStepper`: stacked plus/count/minus control.
- `CartItem`: large product image, remove action, size/color, quantity, refresh/update icon, price.
- `OrderSummary`: bordered summary panel for subtotal, shipping, total, terms checkbox, continue button.
- `CheckoutSteps`: Information, Shipping, Payment tab row.
- `FormField`: thin bordered input/select with muted placeholder.
- `Footer`: sparse editorial footer.

## Page-Specific Rules

- Home:
  - No card container around hero content.
  - Desktop shows two large image panels; mobile shows horizontal product strip with partial third item.
- Products:
  - Desktop uses filter sidebar plus product grid.
  - Mobile can show filters as a left panel/overlay, with products in two columns.
  - Category chips remain thin outlined rectangles.
- Product detail:
  - Desktop info panel is a thin bordered rectangle.
  - Mobile uses image-first layout with sticky bottom add button if needed.
- Cart:
  - Desktop cart items are large and spacious, summary panel sits right.
  - Mobile stacks items; controls sit to the right of image/content.
- Checkout:
  - Form uses thin rectangular inputs.
  - Desktop is two-column form + order summary; mobile stacks summary below form.
- Auth/Profile:
  - Use the same form language as checkout.
  - Keep copy minimal; do not add marketing panels.

## Implementation Defaults

- Use Tailwind utility classes plus small global CSS for texture and shared primitives.
- Use `lucide-react` icons if installed later; otherwise keep icon implementation minimal and consistent.
- Product cards should support real backend product data but can accept temporary static image data during layout work.
- Keep mobile breakpoints explicit: mobile first, then desktop at `md`/`lg`.
- Preserve readability: no text over product images unless the reference explicitly shows it.
