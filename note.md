# Next Work Notes
## 02 June, 2026 work
- Backend auth is implemented and verified.
- Postgres host port is `5433`; Docker internal DB stays `postgres:5432`.
- Run backend checks from `backend/`: `npm run build`, `npm run test -- --runInBand`, `npm run db:seed`.
- Docker check: `docker compose up --build -d backend`.
- Swagger: `http://localhost:3000/api/docs`.
- Seed admin: `admin@kng-fashion.local` / `AdminPassword123`.
- Next build phase: Product service.
- Do not use `npm audit fix --force` unless we review dependency impact.

## 03 June, 2026 work
- Product service is implemented: public catalog, admin product/variant CRUD, soft delete, image arrays.
- Product images use `ProductImage`; DB stores URLs only. Migration `20260603000000_add_product_images` is applied.
- Cloudinary upload endpoint exists: `POST /api/admin/uploads/product-images` with admin cookie auth and form-data key `file`.
- Cloudinary config now supports `CLOUDINARY_URL`; set `CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@dipuutpjn"` and `CLOUDINARY_FOLDER="kng-fashion/products"` in `backend/.env`.
- `KNGupload` preset is not needed for backend signed upload.
- Product Postman collection includes optional upload request and image-array product flow.
- Checks passed: `npx tsc -p tsconfig.build.json --noEmit`, `npm run test -- --runInBand` = 6 suites / 41 tests.
- Docker backend runs and maps upload route. If new deps are missing in container, run `docker compose exec backend npm install`.
- Local `npm run build` still hits Windows `backend/dist` EPERM lock; Docker/Nest compile works.

## 03 June, 2026 Phase 6 work
- CartAndOrder backend is implemented: database-backed cart, checkout, stock decrement, order snapshots, cancellation request, and admin order management.
- New customer endpoints: `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:itemId`, `DELETE /api/cart/items/:itemId`, `POST /api/checkout`, `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/cancel-request`.
- New admin endpoints: `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `PATCH /api/admin/orders/:id/status`, `POST /api/admin/orders/:id/cancel`.
- Placeholder shirt/pant/jacket seed flow is safe Postman API setup, not direct Prisma seed. Use `docs/postman/KNG_Fashion_Cart_Order.postman_collection.json`.
- Checks passed after implementation: `npm run test -- --runInBand` = 7 suites / 57 tests; `npx tsc -p tsconfig.build.json --noEmit`.

## Frontend scaffold
- `frontend/` is initialized with React, TypeScript, Vite, Tailwind CSS, React Router, and Axios.
- Axios client lives at `frontend/src/lib/api.ts` and uses `withCredentials: true`; API URL is configured with `VITE_API_BASE_URL`.
- Frontend env example exists at `frontend/.env.example`.
- Initial routes exist for home, products, product detail, cart, checkout, login, register, and admin.
- Checks passed from `frontend/`: `npm run build`, `npm run lint`.

## Frontend API integration foundation
- Added typed API wrappers for auth, products, cart, orders, and admin endpoints.
- Added `AuthProvider` and `useAuth` for current-user bootstrap from `GET /api/auth/me`.
- Added customer and admin route guards for protected placeholder routes.
- Browser routing now wraps the app in `frontend/src/main.tsx`.
- Auth state stores only the user object; JWTs remain in HttpOnly cookies.

## Homepage first viewport
- Home page now follows the provided Figma references for the first viewport: editorial header, retractable `SHIRT`/`PANTS`/`JACKET` menu, search bar, `NEW COLLECTION`, shop CTA, product panels, and mobile product strip.
- Home assets use `frontend/public/noisy_background.png`, `frontend/public/logo/KNG_Logo_transparent.png`, `frontend/public/product/whitepant.png`, and a temporary cropped `frontend/public/product/blackshirt.png`.
- The reusable storefront header lives in `frontend/src/components/SiteHeader.tsx` and owns the hamburger category menu.
- Product API integration, footer, login/register forms, and downstream homepage sections are still deferred.

## Frontend next-session handoff
- Current frontend design sources: `docs/designs/global_design_system.md`, `docs/designs/home_page_design.md`, and `docs/figma/*`.
- `SiteHeader` is reusable and should be used for customer storefront pages. Hamburger toggles the category menu; closed state is hidden, open state pushes page content down. Menu links map to `/products?type=SHIRT`, `/products?type=PANT`, and `/products?type=JACKET`.
- `HomePage` is static for now. It uses provided public assets and does not yet fetch product data.
- Latest homepage visual fix: desktop product panels were pushed right by widening the left text column in `frontend/src/routes/HomePage.tsx`; this prevents overlap with `NEW COLLECTION`.
- QA used Playwright fallback because Codex in-app Browser still returned no registered `iab` browsers. Verified `npm run build`, `npm run lint`, hamburger menu interaction, and desktop/mobile screenshots.
- Expected console noise during unauthenticated frontend QA: `/api/auth/me` returns `401` until login is implemented.
- Recommended next frontend slice: build `/products` page using `Products.png`, `product-mobile.png`, and `product-filter.png`, reusing `SiteHeader`, `SearchBar` styling, product cards, and category/filter chips.
- Do not start login/register yet unless requested; user asked to hold auth UI for later.

## Products page slice
- `/products` now fetches real catalog data through `productsApi.listProducts()` and uses URL query params for `type`, `size`, and `page`.
- Category chips map `SHIRT`, `PANTS`, and `JACKET` to backend product types; `PANTS` uses the backend value `PANT`.
- Size filtering uses backend-supported sizes only: `S`, `M`, `L`, `XL`.
- The search bar is visual-only for now because the backend product list endpoint does not support search yet.
- Product cards use real backend names, material, prices, colors, and thumbnail URLs, with local fallback images when a product has no thumbnail.
- Next product work: build `/products/:id` detail page and wire variant selection before cart add.

## Homepage product card integration
- Home page now fetches featured products through `productsApi.listProducts({ page: 1, limit: 6 })`.
- Desktop home hero reuses `ProductCard` for the two visible product cards instead of static product images.
- Mobile home product strip also reuses `ProductCard` with real backend products.
- Desktop carousel arrows cycle through the loaded featured products.
- Home search is now an input form; submitting routes to `/products?search=...`.
- `/products` reads the `search` URL param and applies a lightweight client-side filter over the loaded product page until backend search exists.

## CORS local dev note
- Backend CORS now supports `FRONTEND_URLS` as a comma-separated allowlist while keeping `FRONTEND_URL` for backward compatibility.
- Local backend `.env` allows both `http://localhost:5173` and `http://localhost:5174`, because Vite may move to `5174` when `5173` is already in use.
- Restart the backend after changing these env values; CORS headers are set at backend startup.

## Frontend auth future work
- `frontend/src/lib/api.ts` throws normalized `ApiError` objects from `unwrapData`, but `toApiError` does not recognize an already-normalized `ApiError`; shared error normalization should be updated in a focused auth/API cleanup so all callers preserve backend messages.

## Frontend auth/profile handoff
- Login now uses HttpOnly-cookie auth through `useAuth().login`; frontend still stores no JWTs.
- Header account icon sends unauthenticated users to `/login` with current route as `state.from`; customer login returns there unless it is an admin route.
- `/profile` is protected by an auth-only guard, shows profile details, recent customer orders, admin dashboard link for admins, and logout.
- `/admin` has a `Back To Profile` link; admin login defaults to `/profile` unless the user was explicitly trying to access `/admin`.
- Checks passed: `npm.cmd run lint`; `npm.cmd run build` passes through the approved elevated Vite/Tailwind native path.
- Manual browser QA still needed for real customer/admin login redirects because Codex in-app Browser still reports no `iab` browser.

## Admin dashboard handoff
- Product/variant create, edit, delete, stock mutation, and Cloudinary image workflows remain deferred.
- `docs/backend_frontend_integration.md` still lists `OrderStatus.SHIPPING`; Prisma/source docs use `PROCESSING` and `SHIPPED`.
