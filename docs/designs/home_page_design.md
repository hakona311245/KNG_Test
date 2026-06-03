# Home Page Design Notes

References:

- `docs/figma/Home.png` desktop, `5152 x 3360`
- `docs/figma/Home(mobile).png` mobile, `665 x 996`

## Visual Direction

- Style is monochrome editorial streetwear: black, white, light gray, paper texture, oversized display type, and large product photography.
- Avoid colorful accents, gradients, rounded card-heavy layouts, and marketing-copy sections.
- The page should feel like a fashion lookbook/storefront, not a SaaS dashboard.
- Use generous whitespace and a slightly raw printed texture background across the full page.

## Global Styling

- Background: off-white paper/noise texture. Use a subtle repeating/noise image or CSS texture overlay, not a flat white.
- Main color palette:
  - Text black: `#171717` / near-black.
  - Muted text: `#555555`.
  - Soft panel/button gray: `#e6e6e6`.
  - Border gray: `#d7d7d7`.
  - Page background: `#f4f4f1` or textured equivalent.
- Typography:
  - Navigation and body: clean sans-serif with wide letter spacing.
  - Hero headline: very heavy condensed/block sans-serif if available; otherwise use `font-black`, tight line-height, uppercase.
  - Letter spacing should be positive for nav/search/category text, normal for headline.
- Shape language:
  - Mostly square/rectangular.
  - Circular icon buttons for wishlist/cart/profile.
  - Avoid soft rounded cards; if radius is needed, keep it minimal.

## Desktop Layout

- Full viewport composition with no separate hero card.
- Header is transparent over the textured page:
  - Left: hamburger icon, then nav links `Home`, `Collections`, `New`.
  - Center: small split black/gray diamond logo mark.
  - Right: circular icon buttons, cart pill, profile circle.
- Top spacing is large; header sits around `80px` from the top in the reference.
- Left content column:
  - Category stack is not always visible; it is a retractable header menu opened from the hamburger icon.
  - Retractable menu links: `SHIRT`, `PANTS`, `JACKET`.
  - Search bar below the header/menu area, wide rectangular gray field with search icon left and `Search` text right.
  - Hero text: `NEW` over `COLLECTION`, uppercase, huge, black, heavy.
  - Subtext below: `Summer` and `2024` on separate lines.
  - CTA near bottom left: gray rectangular `Go To Shop` button with long arrow.
- Product imagery:
  - Two large square/near-square product image panels aligned across the lower center/right.
  - Images have thin gray borders and no shadow-heavy card treatment.
  - Desktop image panels are dominant and can crop product photography intentionally.
- Carousel controls:
  - Small square previous/next buttons near the CTA and image row.
  - Simple chevrons only.

## Mobile Layout

- Width target follows `Home(mobile).png`; content is a single vertical flow with a horizontally scrollable product strip.
- Header:
  - Hamburger left.
  - Diamond logo centered.
  - Cart and profile circular icons right.
  - Hide desktop text nav and wishlist/cart pill on mobile.
- Category stack appears below header, left aligned, only after tapping the hamburger icon.
- Search bar spans almost full width with gray background.
- Hero headline remains large and uppercase but fits in two lines: `NEW` then `COLLECTION`.
- Product area:
  - Use horizontal scrolling cards/tiles.
  - Show two product tiles fully or nearly fully, with the third partially visible to signal scroll.
  - Each tile has image, small category/name text, title, and price.
- CTA sits below the product strip, left aligned, gray rectangular button with arrow.

## Implementation Notes

- Replace the current scaffold home content; do not put the hero text inside a card.
- Header should be reusable across storefront pages and own the retractable category menu.
- Use real product/lifestyle images. If backend catalog images are unavailable, use temporary local/remote fashion placeholders until product API integration.
- Keep home page mostly static for the first coding pass; product API can be connected later.
- Prefer CSS grid for desktop and horizontal overflow for mobile product tiles.
- Ensure text never overlaps images on mobile; image strip should move below the hero text.

## Assets To Prepare

- Background paper/noise texture: `frontend/public/noisy_background.png`.
- Brand mark: `frontend/public/logo/KNG_Logo_transparent.png`, generated from `KNG_Logo.png`, replacing the reference diamond mark for KNG.
- Product images matching the reference:
  - White outfit seated/cropped image: `frontend/public/product/whitepant.png`.
  - Black graphic T-shirt model image: `frontend/public/product/blackshirt.png`.
  - Optional third product image for mobile overflow.
- Icons: menu, search, heart/wishlist, shopping bag/cart, user, arrow, chevrons.

## Acceptance Criteria

- Desktop first viewport resembles `Home.png`: editorial header, category/search stack, large `NEW COLLECTION` headline, CTA, carousel controls, and two large product images.
- Mobile first viewport resembles `Home(mobile).png`: compact header, category/search, large headline, horizontal product strip, CTA below.
- No visible dashboard-style cards, API setup copy, or frontend scaffold text remains on the home page.
