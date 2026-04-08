# ShopSmart Backend API

Production-grade e-commerce REST API with Prisma, PostgreSQL, JWT access + refresh, and Nodemailer for email verification and password reset.

**Production:** [API](https://shopsmart-server.taj.works/) · [Swagger](https://shopsmart-swagger.taj.works/api-docs) · [Frontend](https://shopsmart.taj.works/)

---

## Quick start

```bash
cd backend
npm install
cp .env.example .env
# Set DATABASE_URL to your PostgreSQL connection string
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Server runs at `http://localhost:4000`. Health: `GET /api/health`.

### Vercel and `/api-docs` (Swagger UI)

If `/api-docs/` loads but the browser console shows **MIME type `text/html`** for `swagger-ui.css` / `.js`, the serverless bundle omitted **`swagger-ui-dist`** static files. `express.static` then falls through to the HTML handler, so those URLs return the Swagger page as HTML.

This repo’s [`vercel.json`](./vercel.json) sets `includeFiles: "node_modules/swagger-ui-dist/**"` on the Node build so those assets ship with the function. Redeploy after pulling that change.

---

## Authentication

- **Access token**: Returned in JSON body on login/register/refresh. Send in header: `Authorization: Bearer <accessToken>`.
- **Refresh token**: Stored in HttpOnly cookie `refreshToken` and optionally in request body for mobile. Used at `POST /api/auth/refresh`. Rotated on each refresh; previous token is revoked.
- **Email verification**: Required for full access (optional enforcement). Use `POST /api/auth/verify-email` with the token from the verification link.

---

## API Reference

Base URL: `http://localhost:4000/api` (production: `https://shopsmart-server.taj.works/api`)

All success responses use `{ "success": true, ... }`. Errors use `{ "success": false, "message": "...", "code": "..." }` with appropriate HTTP status.

---

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login; returns access token and sets refresh cookie |
| POST | `/auth/refresh` | No (cookie/body) | Rotate refresh token; returns new access + refresh |
| POST | `/auth/logout` | No (cookie/body) | Revoke refresh token and clear cookie |
| POST | `/auth/verify-email` | No | Verify email with token from link |
| POST | `/auth/forgot-password` | No | Request password reset email |
| POST | `/auth/reset-password` | No | Set new password with reset token |
| GET | `/auth/me` | Bearer | Get current user profile |

#### POST `/auth/register`

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!",
  "fullName": "Jane Doe",
  "roleRequest": "admin"
}
```

- `roleRequest` optional; if `"admin"`, account is still created as CUSTOMER (admin can promote later).

**Response:** `201`

```json
{
  "success": true,
  "accessToken": "eyJ...",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Jane Doe",
    "role": "CUSTOMER",
    "avatarUrl": null,
    "emailVerified": false,
    "createdAt": "2025-01-28T..."
  }
}
```

- Refresh token is set in HttpOnly cookie `refreshToken`.

---

#### POST `/auth/login`

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass1!"
}
```

**Response:** `200`

```json
{
  "success": true,
  "accessToken": "eyJ...",
  "expiresIn": 3600,
  "user": { "id", "email", "fullName", "role", "avatarUrl", "emailVerified", "createdAt" }
}
```

- Refresh token set in cookie. On invalid credentials or locked account: `401` or `423`.

---

#### POST `/auth/refresh`

**Request:** Cookie `refreshToken` (or body `{ "refreshToken": "..." }` for mobile).

**Response:** `200`

```json
{
  "success": true,
  "accessToken": "eyJ...",
  "expiresIn": 3600,
  "user": { "id", "email", "fullName", "role", "avatarUrl", "emailVerified", "createdAt" }
}
```

- New refresh token set in cookie; previous one revoked.

---

#### POST `/auth/logout`

**Request:** Cookie `refreshToken` or body `{ "refreshToken": "..." }`.

**Response:** `200`  
`{ "success": true, "message": "Logged out" }`

---

#### POST `/auth/verify-email`

**Request body:**

```json
{
  "token": "token-from-email-link"
}
```

**Response:** `200`  
`{ "success": true, "user": { ... } }`

---

#### POST `/auth/forgot-password`

**Request body:**

```json
{
  "email": "user@example.com"
}
```

**Response:** `200`  
`{ "success": true, "message": "If an account exists with this email, you will receive a reset link." }`

---

#### POST `/auth/reset-password`

**Request body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecure1!"
}
```

**Response:** `200`  
`{ "success": true, "message": "Password has been reset." }`

---

#### GET `/auth/me`

**Headers:** `Authorization: Bearer <accessToken>`

**Response:** `200`  
`{ "success": true, "user": { "id", "email", "fullName", "role", "avatarUrl", "emailVerified", "createdAt" } }`

---

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Bearer (Admin) | List users (paginated) |
| GET | `/users/:id` | Bearer | Get user by ID (self or Admin) |
| PATCH | `/users/:id` | Bearer | Update user (self or Admin); body: `fullName`, `avatarUrl` |
| DELETE | `/users/:id` | Bearer | Soft-delete user (self or Admin) |
| GET | `/users/:id/orders` | Bearer | List user's orders (self or Admin) |
| GET | `/users/:id/cart` | Bearer | Get user's cart (self or Admin) |

#### GET `/users`

**Headers:** `Authorization: Bearer <accessToken>` (Admin or Super Admin)

**Response:** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Jane",
      "role": { "name": "CUSTOMER" },
      "active": true,
      "createdAt": "..."
    }
  ]
}
```

#### GET `/users/:id`

**Headers:** `Authorization: Bearer <accessToken>`

**Response:** `200`  
`{ "success": true, "data": { "id", "email", "fullName", "role", "avatarUrl", "createdAt" } }`

- Customer can only request own `id`; Admin/Super Admin can request any.

---

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | No | List active products |
| GET | `/products/:id` | No | Get product by ID |
| GET | `/products/:id/reviews` | No | List approved reviews for product |
| GET | `/products/:id/analytics` | Bearer (Admin) | Product analytics (units sold, orders, ratings) |
| POST | `/products` | Bearer (Admin) | Create product |
| PATCH | `/products/:id` | Bearer (Admin) | Update product (partial body) |
| DELETE | `/products/:id` | Bearer (Admin) | Soft-delete product |

#### GET `/products`

**Response:** `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Wireless Headphones",
      "slug": "wireless-headphones-0",
      "description": "...",
      "price": 4999,
      "originalPrice": 6999,
      "image": "https://...",
      "categoryId": "uuid",
      "category": { "id", "name", "slug" },
      "inStock": true,
      "stockQty": 50,
      "active": true,
      "isNew": true,
      "isDeal": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

#### GET `/products/:id`

**Response:** `200`  
`{ "success": true, "data": { ...product } }`  
`404` if not found.

#### POST `/products`

**Headers:** `Authorization: Bearer <accessToken>` (Admin or Super Admin)

**Request body:**

```json
{
  "name": "Product Name",
  "slug": "product-name",
  "description": "Optional",
  "price": 1999,
  "originalPrice": 2499,
  "image": "https://...",
  "categoryId": "uuid",
  "inStock": true,
  "stockQty": 100,
  "active": true,
  "isNew": false,
  "isDeal": false
}
```

**Response:** `201`  
`{ "success": true, "data": { ...product } }`

---

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | No | List categories |
| POST | `/categories` | Bearer (Admin) | Create category |

#### GET `/categories`

**Response:** `200`  
`{ "success": true, "data": [ { "id", "name", "slug", "description" } ] }`

#### POST `/categories`

**Request body:**

```json
{
  "name": "Electronics",
  "slug": "electronics",
  "description": "Optional"
}
```

**Response:** `201`  
`{ "success": true, "data": { "id", "name", "slug", "description" } }`

---

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | Bearer | Get current user's cart |
| POST | `/cart` | Bearer | Add or update item in cart |
| PATCH | `/cart/item/:id` | Bearer | Update cart item quantity (0 = remove) |
| DELETE | `/cart/item/:id` | Bearer | Remove item from cart |

**POST `/cart` body:** `{ "productId": "uuid", "quantity": 1 }`  
**PATCH `/cart/item/:id` body:** `{ "quantity": 2 }`

---

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | Bearer | Create order from items |
| GET | `/orders` | Bearer | List current user's orders |
| GET | `/orders/:id` | Bearer | Get order by ID (own only) |
| PATCH | `/orders/:id/status` | Bearer (Admin) | Update order status |

**POST `/orders` body:** `{ "addressId": "uuid?", "items": [ { "productId": "uuid", "quantity": 1 } ] }`  
**PATCH `/orders/:id/status` body:** `{ "status": "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED" }`

---

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews` | Bearer | Create review for product |
| GET | `/products/:id/reviews` | No | List approved reviews for product |
| DELETE | `/reviews/:id` | Bearer (Admin) | Delete review |

**POST `/reviews` body:** `{ "productId": "uuid", "rating": 1-5, "body": "optional text" }`

---

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | Bearer (Admin) | Dashboard counts (users, products, orders, revenue) |
| GET | `/admin/revenue` | Bearer (Admin) | Total delivered revenue |
| GET | `/admin/users/stats` | Bearer (Admin) | User counts by role |
| GET | `/admin/products/stats` | Bearer (Admin) | Product total/active counts |
| GET | `/admin/orders/stats` | Bearer (Admin) | Order counts by status |
| POST | `/admin/create-admin` | Bearer (Super Admin) | Create new admin user |
| GET | `/admin/logs` | Bearer (Admin) | Audit logs (query: `?limit=50`) |

**POST `/admin/create-admin` body:** `{ "email": "...", "password": "...", "fullName": "optional" }`

---

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | API health check |

**Response:** `200`  
`{ "success": true, "message": "ShopSmart API" }`

---

## Environment variables

See `.env.example`. Required:

- `DATABASE_URL` – PostgreSQL connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` – Min 32 chars in production
- `FRONTEND_URL` – For CORS and email links

Optional SMTP for verification and reset emails; if not set, emails are logged only.

---

## Database

- **Migrations:** `npx prisma migrate dev`
- **Seed:** `npx prisma db seed` (creates roles, categories, 50 users, 100 products, orders, reviews; admin: `admin@shopsmart.test` / `Admin123!`)
- **Studio:** `npx prisma studio`

---

## Tests

```bash
npm run test
```

---

## Swagger

You can add Swagger/OpenAPI using the same base URL and the payloads above. All endpoints return JSON and use standard HTTP status codes (200, 201, 400, 401, 403, 404, 409, 423, 500).
