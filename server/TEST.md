# Server — APIs & Tests

This document describes all **API endpoints** and all **tests** for the ShopSmart backend.

**Base URL:** `http://localhost:4000/api` (local) — production: `https://shopsmart-server.taj.works/api`

**Authentication:** Protected routes expect `Authorization: Bearer <accessToken>`. Refresh uses `POST /api/auth/refresh` with `{ "refreshToken": "..." }` in the JSON body.

**Error response format (all errors):**

```json
{
  "success": false,
  "message": "Human-readable message",
  "code": "ERROR_CODE"
}
```

---

## Running tests

```bash
cd server
npm install
npm run test          # run once
npm run test:watch    # watch mode
```

**Requirements:** Set `DATABASE_URL` in env (or use the default in `tests/setup.ts`). Integration tests mock the auth service for login so no real DB is required for those flows.

---

## API reference (quick table)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/refresh` | No (cookie/body) | Refresh tokens |
| POST | `/api/auth/logout` | No | Logout |
| POST | `/api/auth/verify-email` | No | Verify email |
| POST | `/api/auth/forgot-password` | No | Forgot password |
| POST | `/api/auth/reset-password` | No | Reset password |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/users` | Admin | List users |
| GET | `/api/users/:id` | Yes (self or admin) | Get user |
| PATCH | `/api/users/:id` | Yes (self or admin) | Update user |
| DELETE | `/api/users/:id` | Yes (self or admin) | Soft-delete user |
| GET | `/api/users/:id/orders` | Yes (self or admin) | User orders |
| GET | `/api/users/:id/cart` | Yes (self or admin) | User cart |
| GET | `/api/categories` | No | List categories |
| POST | `/api/categories` | Admin | Create category |
| GET | `/api/products` | No | List products |
| GET | `/api/products/:id` | No | Get product |
| GET | `/api/products/:id/reviews` | No | Product reviews |
| GET | `/api/products/:id/analytics` | Admin | Product analytics |
| POST | `/api/products` | Admin | Create product |
| PATCH | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/cart` | Yes | Get my cart |
| POST | `/api/cart` | Yes | Add to cart |
| PATCH | `/api/cart/item/:id` | Yes | Update cart item |
| DELETE | `/api/cart/item/:id` | Yes | Remove cart item |
| POST | `/api/orders` | Yes | Create order |
| GET | `/api/orders` | Yes | My orders |
| GET | `/api/orders/:id` | Yes | Get order |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |
| POST | `/api/reviews` | Yes | Create review |
| DELETE | `/api/reviews/:id` | Admin | Delete review |
| GET | `/api/admin/dashboard` | Admin | Dashboard stats |
| GET | `/api/admin/revenue` | Admin | Total revenue |
| GET | `/api/admin/users/stats` | Admin | User stats |
| GET | `/api/admin/products/stats` | Admin | Product stats |
| GET | `/api/admin/orders/stats` | Admin | Order stats |
| POST | `/api/admin/create-admin` | Super Admin | Create admin user |
| GET | `/api/admin/logs` | Admin | Audit logs |

---

## API details (request/response)

### Health

- **GET** `/api/health`  
- **Response:** `200`  
```json
{ "success": true, "message": "ShopSmart API" }
```

---

### Auth

- **POST** `/api/auth/register`  
- **Body:** `{ "email": "string", "password": "string", "fullName": "string", "roleRequest": "admin" (optional) }`  
- **Validation:** email valid; password min 8 chars, uppercase, lowercase, number/special; fullName min 2 chars.  
- **Response:** `201`  
```json
{
  "success": true,
  "accessToken": "string",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "string",
    "fullName": "string",
    "role": "CUSTOMER",
    "avatarUrl": null,
    "emailVerified": false,
    "createdAt": "ISO8601"
  }
}
```
- **Error:** `409` — email already exists.

- **POST** `/api/auth/login`  
- **Body:** `{ "email": "string", "password": "string" }`  
- **Response:** `200` — same shape as register (success, accessToken, expiresIn, user). Sets `refreshToken` cookie.  
- **Error:** `401` invalid credentials; `423` account locked.

- **POST** `/api/auth/refresh`  
- **Body:** optional `{ "refreshToken": "string" }`, or cookie `refreshToken`.  
- **Response:** `200` — same as login.  
- **Error:** `400` no token; `401` invalid/expired.

- **POST** `/api/auth/logout`  
- **Body:** optional; cookie/body refresh token cleared.  
- **Response:** `200`  
```json
{ "success": true, "message": "Logged out" }
```

- **POST** `/api/auth/verify-email`  
- **Body:** `{ "token": "string" }`  
- **Response:** `200`  
```json
{ "success": true, "user": { ... } }
```

- **POST** `/api/auth/forgot-password`  
- **Body:** `{ "email": "string" }`  
- **Response:** `200`  
```json
{ "success": true, "message": "If an account exists..." }
```

- **POST** `/api/auth/reset-password`  
- **Body:** `{ "token": "string", "newPassword": "string" }`  
- **Response:** `200`  
```json
{ "success": true, "message": "Password has been reset." }
```

- **GET** `/api/auth/me`  
- **Headers:** `Authorization: Bearer <accessToken>`  
- **Response:** `200`  
```json
{ "success": true, "user": { "id", "email", "fullName", "role", "avatarUrl", "emailVerified", "createdAt" } }
```

---

### Users

- **GET** `/api/users` — Admin/Super Admin only.  
- **Response:** `200`  
```json
{ "success": true, "data": [ { "id", "email", "fullName", "role", "active", "createdAt" } ] }
```

- **GET** `/api/users/:id` — Self or admin.  
- **Response:** `200`  
```json
{ "success": true, "data": { "id", "email", "fullName", "role", "avatarUrl", "createdAt" } }
```

- **PATCH** `/api/users/:id`  
- **Body:** `{ "fullName": "string?", "avatarUrl": "string?" }`  
- **Response:** `200` — `{ "success": true, "data": user }`

- **DELETE** `/api/users/:id` — Soft delete.  
- **Response:** `200`  
```json
{ "success": true, "message": "User deleted" }
```

- **GET** `/api/users/:id/orders` — Self or admin.  
- **Response:** `200`  
```json
{ "success": true, "data": [ { "id", "userId", "status", "subtotal", "discount", "shipping", "total", "items", ... } ] }
```

- **GET** `/api/users/:id/cart` — Self or admin.  
- **Response:** `200`  
```json
{ "success": true, "data": { "id", "items": [ { "id", "productId", "quantity", "product": { ... } } ] } }
```

---

### Categories

- **GET** `/api/categories`  
- **Response:** `200`  
```json
{ "success": true, "data": [ { "id", "name", "slug", "description", "createdAt", "updatedAt" } ] }
```

- **POST** `/api/categories` — Admin.  
- **Body:** `{ "name": "string", "slug": "string?", "description": "string?" }`  
- **Response:** `201`  
```json
{ "success": true, "data": { "id", "name", "slug", "description", ... } }
```

---

### Products

- **GET** `/api/products`  
- **Response:** `200`  
```json
{ "success": true, "data": [ { "id", "name", "slug", "description", "price", "originalPrice", "image", "categoryId", "category", "inStock", "stockQty", "active", "isNew", "isDeal", ... } ] }
```

- **GET** `/api/products/:id`  
- **Response:** `200` — single product; `404` if not found.

- **GET** `/api/products/:id/reviews`  
- **Response:** `200`  
```json
{ "success": true, "data": [ { "id", "userId", "productId", "rating", "body", "user": { "id", "fullName" }, "createdAt" } ] }
```

- **GET** `/api/products/:id/analytics` — Admin.  
- **Response:** `200`  
```json
{ "success": true, "data": { "id", "name", "slug", "unitsSold", "orderCount", "avgRating", "reviewCount" } }
```

- **POST** `/api/products` — Admin.  
- **Body:** `{ "name", "price", "categoryId", "slug?", "description?", "image?", "originalPrice?", "inStock?", "stockQty?", "active?", "isNew?", "isDeal?" }`  
- **Response:** `201` — created product.

- **PATCH** `/api/products/:id` — Admin. Same body fields (partial).  
- **DELETE** `/api/products/:id` — Admin.  
- **Response:** `200`  
```json
{ "success": true, "message": "..." }
```

---

### Cart

All cart routes require authentication.

- **GET** `/api/cart`  
- **Response:** `200`  
```json
{ "success": true, "data": { "id", "items": [ { "id", "productId", "quantity", "product": { ... } } ] } }
```
If no cart: `{ "success": true, "data": { "id": null, "items": [] } }`

- **POST** `/api/cart`  
- **Body:** `{ "productId": "string", "quantity": number? }` (default quantity 1)  
- **Response:** `201` — full cart with items.

- **PATCH** `/api/cart/item/:id`  
- **Body:** `{ "quantity": number }` — if ≤ 0, item removed.  
- **Response:** `200` — updated item or `{ "removed": true }`.

- **DELETE** `/api/cart/item/:id`  
- **Response:** `200`  
```json
{ "success": true, "message": "Item removed" }
```

---

### Orders

- **POST** `/api/orders`  
- **Body:** `{ "addressId": "string?", "items": [ { "productId": "string", "quantity": number } ] }`  
- **Response:** `201` — order with items (subtotal, discount, shipping, total as numbers).

- **GET** `/api/orders` — Current user's orders.  
- **GET** `/api/orders/:id` — Own order only.  
- **Response:** `200` — order with items and address.

- **PATCH** `/api/orders/:id/status` — Admin.  
- **Body:** `{ "status": "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" }`  
- **Response:** `200` — updated order.

---

### Reviews

- **POST** `/api/reviews`  
- **Body:** `{ "productId": "string", "rating": number (1-5), "body": "string?" }`  
- **Response:** `201`  
```json
{ "success": true, "data": { "id", "userId", "productId", "rating", "body", "user": { "id", "fullName" }, "createdAt" } }
```

- **DELETE** `/api/reviews/:id` — Admin.  
- **Response:** `200`  
```json
{ "success": true, "message": "Review deleted" }
```

---

### Admin

All under `/api/admin`; require Admin or Super Admin unless noted.

- **GET** `/api/admin/dashboard`  
- **Response:** `200`  
```json
{ "success": true, "data": { "users": number, "products": number, "orders": number, "revenue": number } }
```

- **GET** `/api/admin/revenue`  
- **Response:** `200`  
```json
{ "success": true, "data": { "total": number } }
```

- **GET** `/api/admin/users/stats`  
- **Response:** `200`  
```json
{ "success": true, "data": { "total": number, "byRole": [ { "roleId", "roleName", "count" } ] } }
```

- **GET** `/api/admin/products/stats`  
- **Response:** `200`  
```json
{ "success": true, "data": { "total": number, "active": number } }
```

- **GET** `/api/admin/orders/stats`  
- **Response:** `200`  
```json
{ "success": true, "data": [ { "status", "_count" } ] }
```

- **POST** `/api/admin/create-admin` — **Super Admin only.**  
- **Body:** `{ "email": "string", "password": "string", "fullName": "string?" }`  
- **Response:** `201`  
```json
{ "success": true, "data": { "id", "email", "fullName", "role": { ... } } }
```

- **GET** `/api/admin/logs`  
- **Query:** `limit` (default 50, max 100).  
- **Response:** `200`  
```json
{ "success": true, "data": [ { "id", "userId", "action", "resource", "resourceId", "ip", "userAgent", "metadata", "createdAt", "user": { "id", "email" } } ] }
```

---

## Test suite overview

| Test file | Type | Description |
|-----------|------|-------------|
| `src/utils/__tests__/hash.test.ts` | Unit | `hashPassword`, `comparePassword`, `hashToken`, `generateToken` |
| `src/utils/__tests__/jwt.test.ts` | Unit | `signAccessToken`/`verifyAccessToken`, `signRefreshToken`/`verifyRefreshToken` |
| `src/middleware/__tests__/errorHandler.test.ts` | Unit | `AppError`, `errorHandler` (AppError vs generic Error status/message) |
| `src/middleware/__tests__/authorize.test.ts` | Unit | `authorize` — allowed role, forbidden role, no user (401) |
| `src/modules/auth/__tests__/auth.service.test.ts` | Unit | Auth service: register (success, 409), login (success, 401, 423), refresh (invalid), logout (no token), me (found, 404); Prisma & email mocked |
| `tests/integration/api.test.ts` | Integration | Supertest: GET health, POST register (400), POST login (400/401), POST refresh (400), POST logout (200), GET me (401); auth service mocked for login |

**Total:** 35 tests (unit + integration).
