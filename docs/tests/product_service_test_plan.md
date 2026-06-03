# Product Service Test Plan

This document lists intended Product service unit tests before implementation.

Source references:

- API contract: `docs/01_API_CONTRACT.md`
- Data model: `docs/02_DATA_MODEL.md`
- Product feature spec: `docs/features/product.md`

## Unit Tests

| Test | Expected Behavior | Expected Result |
| --- | --- | --- |
| Customer list filters by type | Query with `type=SHIRT` only searches matching product type. | Service returns paginated products with `type = SHIRT`. |
| Customer list filters by size | Query with `size=M` only includes products with matching active variant. | Service returns products that have an active `M` variant. |
| Customer list filters by color | Query with `color=Black` only includes products with matching active variant. | Service returns products that have an active `Black` variant. |
| Customer list hides inactive/deleted products | Product where `isActive=false` or `deletedAt != null` is excluded. | Service does not return inactive or deleted products. |
| Product detail includes variants | Existing active product has active variants. | Service returns product detail with variants array. |
| Product detail hides inactive/deleted variants | Product has inactive or soft-deleted variants. | Service excludes inactive or deleted variants from customer detail. |
| Product options returns fixed types/sizes | Product options endpoint is called. | Service returns `SHIRT`, `PANT`, `JACKET` and `S`, `M`, `L`, `XL`. |
| Admin creates product | Valid product payload is submitted. | Service creates product with `isActive=true` by default. |
| Admin updates product | Existing product is updated. | Service returns updated product fields. |
| Product soft delete | Admin deletes existing product. | Service sets `deletedAt` and does not permanently delete row. |
| Create duplicate variant rejection | Same product already has same size/color variant. | Service throws conflict error. |
| Admin updates variant stock | Existing variant stock is updated to non-negative value. | Service returns updated variant stock. |
| Variant soft delete | Admin deletes existing variant. | Service sets `deletedAt` and does not permanently delete row. |

## Commands

Run from `backend/` after Product service tests are implemented:

```powershell
npm run build
npm run test -- --runInBand
```

## Result Recording

Write actual results to:

```text
docs/tests/product_service_test_result.md
```

Failed tests should be recorded with test name and failure message. Debugging or fixing failures is a separate next step.
