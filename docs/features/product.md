# Product Feature Spec

This feature belongs to the Product service.

Related source-of-truth docs:

- API contract: `docs/01_API_CONTRACT.md`
- Data model: `docs/02_DATA_MODEL.md`
- Feature overview: `docs/03_FEATURE_SPEC_OVERVIEW.md`

## Feature Goal

Provide the product catalog and admin product management for KNG Fashion. Customers can browse active products, view product details, inspect available size/color variants, and view product/variant image galleries. Admins can manage products, variants, images, stock, and soft deletion.

The MVP supports only shirts, pants, and jackets. Product variants are defined by size and color, with stock tracked per variant.

## User Roles

### Customer

Customers can:

- View active product listing.
- Filter products by type, size, and color.
- View product detail.
- View available variants and stock.
- View product-level and variant-level images.
- View fixed product options.

### Admin

Admins can:

- View all products.
- Create products.
- Update products.
- Soft delete products.
- View product variants.
- Create variants.
- Update variant size, color, stock, and active status.
- Manage product-level and variant-level image URLs.
- Soft delete variants.

## User Actions

### Browse Product List

A customer opens the product catalog and can filter by:

- Product type
- Size
- Color

System returns only active, non-deleted products.

### View Product Detail

A customer opens a product detail page. System returns product information and active, non-deleted variants.

Product detail includes product-level images and each variant's own images.

### View Product Options

Frontend requests fixed product options for filters and forms.

System returns:

- Product types: `SHIRT`, `PANT`, `JACKET`
- Sizes: `S`, `M`, `L`, `XL`

### Manage Product

Admin can create, update, and soft delete products.

Product create requires at least one product-level image.

### Manage Product Variant

Admin can create, update, and soft delete product variants. Variant stock is controlled at the size/color level.

Variant images are optional and can be managed through variant create/update payloads.

## Business Rules

- Product types are fixed: `SHIRT`, `PANT`, `JACKET`.
- Sizes are fixed: `S`, `M`, `L`, `XL`.
- Colors are free-text strings.
- Product price is stored on `Product`.
- All variants of the same product use the same product price.
- Product-level images are stored on `ProductImage` with `variantId = null`.
- Variant-level images are stored on `ProductImage` with `variantId` set.
- Product create requires at least one product-level image.
- Variant images are optional.
- Images are URL strings only; file upload/storage is out of scope for MVP.
- Image display order uses `sortOrder`.
- `isPrimary` marks the preferred thumbnail image.
- `thumbnailUrl` is selected from the primary product image, falling back to the first product image by `sortOrder`.
- If a variant image references a variant, the variant must belong to the same product as the image.
- Stock is stored on `ProductVariant`.
- Customer-facing APIs hide inactive products, inactive variants, and soft-deleted records.
- Admin product list can include deleted products only when `includeDeleted=true`.
- Product delete is soft delete only.
- Variant delete is soft delete only.
- Variant stock must be `>= 0`.
- A product cannot have duplicate variants with the same size and color.
- Product and variant APIs must not permanently delete records.

## Related API Endpoints

Reference only. Full request/response details are defined in `docs/01_API_CONTRACT.md`.

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/options`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/products/:id`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/products/:productId/variants`
- `POST /api/admin/products/:productId/variants`
- `PATCH /api/admin/variants/:variantId`
- `DELETE /api/admin/variants/:variantId`

## Backend Services/Modules

Recommended NestJS modules for this feature:

- `ProductModule`
- `PrismaModule`
- Auth guards from `AuthModule`

Recommended backend responsibilities:

- `ProductsController`: customer product listing, detail, and options.
- `AdminProductsController`: admin product and variant management.
- `ProductsService`: product queries, product mutation, variant mutation, soft delete behavior.
- Product DTOs: validate product create/update payloads and product query parameters.
- Variant DTOs: validate variant create/update payloads.
- Product presenters: shape product responses to match `docs/01_API_CONTRACT.md`.
- `JwtAuthGuard` and `RolesGuard`: protect admin product endpoints.

Data models used:

- Product
- ProductVariant
- ProductImage

## Edge Cases

- Customer product list has no matching products.
- Customer filters by invalid type or size.
- Customer requests inactive product.
- Customer requests soft-deleted product.
- Product detail has no active variants.
- Product detail has no product images.
- Admin creates product without product-level images.
- Admin creates image with missing URL.
- Admin creates variant image for a variant that does not belong to the product.
- Admin updates images and replaces current non-deleted images.
- Admin creates product with invalid type.
- Admin creates product with negative price.
- Admin updates product that does not exist.
- Admin soft deletes product that does not exist.
- Admin creates variant for missing product.
- Admin creates variant with invalid size.
- Admin creates variant with negative stock.
- Admin creates duplicate size/color variant for the same product.
- Admin updates variant that does not exist.
- Admin soft deletes variant that does not exist.
- Customer tries to access admin product endpoint.
- Unauthenticated user tries to access admin product endpoint.

## Implementation Tasks

### Data Model

- [x] Add `ProductType` enum with `SHIRT`, `PANT`, and `JACKET`.
- [x] Add `Size` enum with `S`, `M`, `L`, and `XL`.
- [x] Add `Product` model fields from `docs/02_DATA_MODEL.md`.
- [x] Add `ProductVariant` model fields from `docs/02_DATA_MODEL.md`.
- [ ] Add `ProductImage` model fields from `docs/02_DATA_MODEL.md`.
- [x] Add relation from `Product` to `ProductVariant`.
- [ ] Add relation from `Product` to `ProductImage`.
- [ ] Add optional relation from `ProductVariant` to `ProductImage`.
- [x] Add unique constraint on product, size, and color variant combination.
- [x] Add soft delete fields for product and variant.
- [ ] Add soft delete fields for product images.
- [x] Add Prisma migration for product models.
- [ ] Add Prisma migration for product images.
- [ ] Backfill existing `Product.imageUrl` into primary `ProductImage`.
- [ ] Remove `Product.imageUrl` after image backfill.

### Backend Product

- [x] Implement `ProductModule`.
- [x] Register `ProductModule` in `AppModule`.
- [x] Implement customer product list endpoint.
- [x] Implement customer product detail endpoint.
- [x] Implement product options endpoint.
- [x] Implement admin product list endpoint.
- [x] Implement admin product create endpoint.
- [x] Implement admin product detail endpoint.
- [x] Implement admin product update endpoint.
- [x] Implement admin product soft delete endpoint.
- [x] Implement admin variant list endpoint.
- [x] Implement admin variant create endpoint.
- [x] Implement admin variant update endpoint.
- [x] Implement admin variant soft delete endpoint.
- [ ] Update product create/update to accept product-level `images`.
- [ ] Update variant create/update to accept optional variant-level `images`.
- [ ] Update product list response to return `thumbnailUrl`.
- [ ] Update product detail response to return product-level `images`.
- [ ] Update product detail response to return variant-level `images`.

### Backend Validation and Rules

- [x] Add DTO validation for product create/update.
- [x] Add DTO validation for variant create/update.
- [x] Add DTO validation for product query filters.
- [x] Enforce fixed product types.
- [x] Enforce fixed sizes.
- [x] Allow free-text colors.
- [x] Reject negative product price.
- [x] Reject negative variant stock.
- [x] Reject duplicate size/color variant on the same product.
- [ ] Require at least one product-level image on product create.
- [ ] Validate image URL strings.
- [ ] Validate image `sortOrder`.
- [ ] Validate variant image ownership matches product.
- [ ] Replace current non-deleted images when `images` is provided on update.
- [x] Hide inactive or deleted products from customer catalog.
- [x] Hide inactive or deleted variants from customer detail.
- [x] Allow admin list to include deleted products with `includeDeleted=true`.
- [x] Use soft delete only.

### Backend Authorization

- [x] Protect admin product endpoints with `ADMIN` role.
- [x] Allow unauthenticated customer catalog reads.
- [x] Ensure customers cannot access admin product endpoints.

### Frontend

- [ ] Build product listing page.
- [ ] Add filters for type, size, and color.
- [ ] Build product detail page.
- [ ] Add variant selection by size and color.
- [ ] Build admin product list.
- [ ] Build admin product create/edit form.
- [ ] Build admin variant and stock management UI.

### Documentation and Testing

- [x] Add Swagger decorators for customer product endpoints.
- [x] Add Swagger decorators for admin product endpoints.
- [ ] Update Swagger DTOs for product and variant image arrays.
- [ ] Update Product service unit tests for image behavior.
- [ ] Update Product Postman collection for image payloads.
- [x] Add Product service unit tests listed in `docs/tests/product_service_test_plan.md`.
- [x] Record Product service test results in `docs/tests/product_service_test_result.md`.
- [x] Update `docs/TASK_BREAKDOWN.md` after implementation.
- [x] Update `docs/system_spec.md` after implementation.
