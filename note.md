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
