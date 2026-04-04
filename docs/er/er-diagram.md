# ShopSmart — Entity Relationship Diagram

> Rendered with **Mermaid** (`erDiagram`). Open in any Mermaid-compatible viewer (e.g. VS Code Mermaid Preview, GitHub, draw.io import).

## ER Diagram

```mermaid
erDiagram

    ROLE {
        UUID id PK
        string name "CUSTOMER | ADMIN | SUPER_ADMIN"
        string description
    }

    USER {
        UUID id PK
        string email UK
        string password_hash
        string full_name
        string avatar_url
        boolean email_verified
        string email_verify_token
        datetime email_verify_expires
        boolean active
        int failed_logins
        datetime locked_until
        string reset_token_hash
        datetime reset_token_expires
        UUID role_id FK
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    REFRESH_TOKEN {
        UUID id PK
        string token_hash
        UUID user_id FK
        datetime expires_at
        boolean revoked
        datetime created_at
    }

    CATEGORY {
        UUID id PK
        string name UK
        string slug UK
        string description
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    PRODUCT {
        UUID id PK
        string name
        string slug UK
        string description
        decimal price
        decimal original_price
        string image
        json images
        UUID category_id FK
        boolean in_stock
        int stock_qty
        boolean active
        boolean is_new
        boolean is_deal
        datetime created_at
        datetime updated_at
        datetime deleted_at
    }

    ADDRESS {
        UUID id PK
        UUID user_id FK
        string line1
        string line2
        string city
        string state
        string postal_code
        string country
        boolean is_default
        datetime created_at
        datetime updated_at
    }

    ORDER {
        UUID id PK
        UUID user_id FK
        string status "PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED|REFUNDED"
        decimal subtotal
        decimal discount
        decimal shipping
        decimal total
        UUID address_id FK
        datetime created_at
        datetime updated_at
    }

    ORDER_ITEM {
        UUID id PK
        UUID order_id FK
        UUID product_id FK
        int quantity
        decimal price
        datetime created_at
    }

    CART {
        UUID id PK
        UUID user_id FK "UK"
        datetime updated_at
    }

    CART_ITEM {
        UUID id PK
        UUID cart_id FK
        UUID product_id FK
        int quantity
        datetime created_at
    }

    REVIEW {
        UUID id PK
        UUID user_id FK
        UUID product_id FK
        int rating
        string body
        string status "pending|approved|rejected"
        datetime created_at
        datetime updated_at
    }

    AUDIT_LOG {
        UUID id PK
        UUID user_id FK
        string action
        string resource
        string resource_id
        string ip
        string user_agent
        json metadata
        datetime created_at
    }

    COUPON {
        UUID id PK
        string code UK
        string type "PERCENT | FIXED"
        decimal value
        decimal min_order
        int max_uses
        int used_count
        datetime expires_at
        boolean active
        datetime created_at
        datetime updated_at
    }

    SYSTEM_CONFIG {
        UUID id PK
        string key UK
        json value
        datetime updated_at
    }

    %% ─── Relationships ───
    ROLE      ||--o{ USER          : "has many"
    USER      ||--o{ REFRESH_TOKEN : "has many"
    USER      ||--o| CART          : "has one"
    USER      ||--o{ ADDRESS       : "has many"
    USER      ||--o{ ORDER         : "places"
    USER      ||--o{ REVIEW        : "writes"
    USER      ||--o{ AUDIT_LOG     : "generates"
    CATEGORY  ||--o{ PRODUCT       : "contains"
    CART      ||--o{ CART_ITEM     : "has"
    PRODUCT   ||--o{ CART_ITEM     : "in"
    ORDER     ||--o{ ORDER_ITEM    : "contains"
    PRODUCT   ||--o{ ORDER_ITEM    : "ordered as"
    ADDRESS   ||--o{ ORDER         : "ships to"
    PRODUCT   ||--o{ REVIEW        : "reviewed by"
```

---

## Entity ↔ Prisma Model ↔ Table Mapping

| ER Entity | Prisma Model | DB Table (`@@map`) |
|-----------|-------------|-------------------|
| USER | `User` | `users` |
| ROLE | `Role` | `roles` |
| REFRESH_TOKEN | `RefreshToken` | `refresh_tokens` |
| CATEGORY | `Category` | `categories` |
| PRODUCT | `Product` | `products` |
| ADDRESS | `Address` | `addresses` |
| ORDER | `Order` | `orders` |
| ORDER_ITEM | `OrderItem` | `order_items` |
| CART | `Cart` | `carts` |
| CART_ITEM | `CartItem` | `cart_items` |
| REVIEW | `Review` | `reviews` |
| AUDIT_LOG | `AuditLog` | `audit_logs` |
| COUPON | `Coupon` | `coupons` |
| SYSTEM_CONFIG | `SystemConfig` | `system_config` |

---

## Key Design Notes

- **Soft Deletes**: `User`, `Product`, `Category` use `deleted_at` (nullable) — records are never hard deleted in normal operation.
- **One Cart per User**: `cart.user_id` has a `@unique` constraint — each user has exactly one cart.
- **Cascade Deletes**: `RefreshToken`, `Cart`, `CartItem`, `Address`, `Review` cascade-delete when the parent `User` or `Cart` is deleted.
- **Order Immutability**: `OrderItem.price` is stored at the time of order — not linked live to `Product.price` — preventing price drift.
- **Role Enum**: `CUSTOMER`, `ADMIN`, `SUPER_ADMIN` stored in the `roles` table and referenced by FK from `users`.
- **Coupon**: Standalone entity — not FK-linked to `Order` in schema (applied at checkout, discount recorded in `Order.discount`).
- **AuditLog**: `userId` is nullable — allows logging system-level actions with no user context.
