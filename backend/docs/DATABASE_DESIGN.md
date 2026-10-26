# FreshCart Database Design (Planned — not implemented)

> No schemas exist yet. Collections below map 1:1 to `src/models/`.

- `User`: auth identity, role (customer/admin), profile.
- `Product` / `Category`: catalogue, images, pricing, stock flags.
- `Cart` / `Wishlist` / `Address`: shopper state.
- `Order` / `Payment` / `Coupon` / `Review`: purchase lifecycle.
- `InventoryLog`: stock changes for low-stock/out-of-stock alerts.
- `Notification`: customer + admin order events.
- `ShoppingRequest`: AI Hindi/English/Hinglish requests + PDF/WhatsApp metadata.

Relationships, indexes, and validation to be designed per module.
