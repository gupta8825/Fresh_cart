# FreshCart API Endpoints (Planned — not implemented)

> None of the endpoints below are working yet. This is a planning document only.

## Auth `/api/auth` (planned)
- `POST /api/auth/register` — customer registration
- `POST /api/auth/login` — customer/admin login
- `POST /api/auth/logout` — end session
- `GET /api/auth/me` — current profile

## Users `/api/users` (planned)
- `GET /api/users/me`, `PATCH /api/users/me`

## Products `/api/products`, Categories `/api/categories` (planned)
- Product list/search/filter/detail; category list/detail; product images via upload config.

## Cart `/api/cart`, Wishlist `/api/wishlist`, Addresses `/api/addresses` (planned)
- Cart add/update/remove/clear; wishlist toggle/list; address CRUD.

## Orders `/api/orders`, Payments `/api/payments`, Coupons `/api/coupons`, Reviews `/api/reviews` (planned)
- Checkout, order detail/list, payment initiation/verification, coupon validate, review add/list.

## Inventory `/api/inventory`, Notifications `/api/notifications` (planned)
- Stock adjustments, low-stock/out-of-stock queries; customer/admin notifications.

## Admin `/api/admin` (planned)
- Dashboard analytics, sales reports, order management, role-gated routes.

## AI Shopping `/api/ai-shopping` (planned)
- Hindi/English/Hinglish grocery-list requests; PDF generation; configurable admin WhatsApp number.

## Uploads `/api/uploads` (planned)
- Local dev uploads only; production uses object storage.
