<div align="center">

<h1>ShopSmart</h1>

<p><strong>Smart shopping. Trusted choices.</strong></p>

<p>A production-grade, full-stack eCommerce platform built with Next.js and Express — featuring cookie-based JWT authentication, Role-Based Access Control, and a complete REST API.</p>

[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)

</div>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Features by Role](#4-features-by-role)
5. [Authentication & Security](#5-authentication--security)
6. [API Documentation](#6-api-documentation)
7. [Getting Started](#7-getting-started)
8. [Environment Variables](#8-environment-variables)
9. [Deployment](#9-deployment)
10. [Contributing](#10-contributing)
11. [License](#11-license)

---

## 1. Overview

ShopSmart is a **monorepo eCommerce platform** with a clear separation of concerns between a Next.js 16 frontend and an Express.js REST API backend. It is designed with security-first principles, a layered RBAC system, and developer-friendly tooling.

### Role-Based Access Control (RBAC)

| Role            | Description                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| **Customer**    | Browse products, manage cart & wishlist, place orders, write reviews, manage profile                      |
| **Admin**       | Manage products, categories, inventory, orders, coupons, customers, and reports                           |
| **Super Admin** | Full system access — manage admins, RBAC, system config, payments, shipping, feature flags, and analytics |

> **Security note:** Authentication is entirely cookie-based. Access and refresh tokens are stored in `httpOnly` cookies — never in `localStorage` or the response body. All protected routes enforce role checks via dedicated middleware.

---

## 2. Tech Stack

### Frontend

| Technology                  | Purpose                                 |
| --------------------------- | --------------------------------------- |
| **Next.js 16** (App Router) | React framework with SSR/SSG            |
| **React 19**                | UI component layer                      |
| **TypeScript**              | End-to-end type safety                  |
| **Tailwind CSS v4**         | Utility-first styling                   |
| **Axios**                   | HTTP client (`withCredentials: true`)   |
| **Framer Motion**           | Page and component animations           |
| **Recharts**                | Charts for admin/super-admin dashboards |

### Backend

| Technology              | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| **Node.js + Express**   | REST API server                               |
| **TypeScript**          | Type safety across all modules                |
| **Prisma + MySQL**      | ORM and relational database                   |
| **JWT + bcryptjs**      | Stateless authentication and password hashing |
| **cookie-parser**       | Read`req.cookies` for token extraction        |
| **express-validator**   | Request body validation                       |
| **Swagger (OpenAPI 3)** | Auto-generated API documentation              |
| **Helmet**              | HTTP security headers                         |
| **CORS**                | Credential-safe cross-origin configuration    |

---

## 3. Architecture

### Monorepo Structure

```
shop_smart/
├── client/                       # Next.js 16 frontend
│   ├── app/
│   │   ├── admin/                # Admin dashboard (products, orders, users, coupons, reports)
│   │   ├── super-admin/          # Super Admin (config, admins, payments, shipping, analytics)
│   │   ├── shop/                 # Customer storefront
│   │   ├── cart/ checkout/ orders/ profile/ login/
│   ├── api/                      # Axios API client (auth, cart, orders, etc.)
│   ├── components/               # Shared UI components
│   ├── context/                  # Auth context provider
│   ├── lib/                      # Utilities and 401 interceptor logic
│   └── middleware.ts             # Next.js middleware (pass-through for cross-origin cookies)
│
├── server/                       # Express REST API
│   ├── prisma/
│   │   ├── schema.prisma         # MySQL schema definition
│   │   └── migrations/
│   ├── src/
│   │   ├── app.ts                # App entry: CORS, cookieParser, route mounting
│   │   ├── server.ts             # HTTP server bootstrap
│   │   ├── config/               # Env, Prisma client, Swagger, logger
│   │   ├── middleware/           # authenticate, requireAdmin, requireSuperAdmin, validate, errorHandler
│   │   ├── modules/
│   │   │   ├── auth/             # login, register, refresh, logout, me
│   │   │   ├── user/             # GET/PATCH /api/user/me
│   │   │   ├── users/            # list, get, update, delete (self or admin)
│   │   │   ├── products/ categories/ cart/ orders/ reviews/
│   │   │   ├── admin/            # dashboard, stats, orders, reviews, coupons, reports, logs
│   │   │   └── super-admin/      # admin CRUD, role assign, config, payments, shipping, flags, analytics
│   │   ├── routes/               # Central route registration under /api
│   │   └── utils/                # JWT helpers, password hashing
│   └── package.json
│
└── README.md
```

### Request Lifecycle (Server)

```
Request
  └─► cookieParser()               — Populates req.cookies
  └─► cors()                       — Validates origin, enables credentials
  └─► Route Handler
        └─► authenticate()         — Reads accessToken from req.cookies
        └─► requireAdmin()         — Enforces ADMIN | SUPER_ADMIN on /api/admin/*
        └─► requireSuperAdmin()    — Enforces SUPER_ADMIN only on /api/super-admin/*
        └─► Controller             — Business logic
```

### Client-Side Auth Flow

- All API calls use `withCredentials: true` (Axios) or `credentials: "include"` (fetch)
- On **401**, the Axios interceptor calls `POST /api/auth/refresh` and retries once
- If refresh fails, the user is redirected to `/login`
- Route protection is handled in layouts via `ProtectedRoute` and auth context

### RBAC Route Map

| Route Prefix         | Access Level                |
| -------------------- | --------------------------- |
| `/api/user/*`        | Any authenticated user      |
| `/api/users`         | Self, Admin, or Super Admin |
| `/api/admin/*`       | Admin or Super Admin        |
| `/api/super-admin/*` | Super Admin only            |

---

## 4. Features by Role

### 👤 Customer

- Browse and search products and categories
- Add to cart, update quantities, remove items
- Wishlist management
- Checkout and order placement
- Order tracking
- Product reviews
- Profile and address management
- Email verification, forgot/reset password

### 🛠️ Admin

- Full product and category CRUD
- Inventory management
- Order processing and status updates (shipped, delivered, cancelled, refunded)
- Customer management and support
- Discount and coupon management (create, update, delete)
- Sales and revenue reports
- Dashboard with KPIs (users, products, orders, revenue)
- Audit logs
- Review moderation

> Admins cannot modify system-level settings, create/delete other admins, or access Super Admin–only configuration.

### Super Admin

- Create and delete Admin accounts
- Assign and manage user roles (RBAC)
- System configuration
- Payment gateway settings
- Shipping provider management
- Feature flags (enable/disable platform features)
- Full analytics dashboard
- Override Admin-level access across the platform

---

## 5. Authentication & Security

| Mechanism             | Detail                                                                         |
| --------------------- | ------------------------------------------------------------------------------ |
| **httpOnly Cookies**  | Tokens are inaccessible to JavaScript — mitigates XSS                          |
| **Secure Flag**       | `secure: true` in production (HTTPS-only)                                      |
| **SameSite Policy**   | `none` + `secure` for cross-origin; `lax` for local development                |
| **No Token Exposure** | Zero storage in`localStorage`, `sessionStorage`, or `document.cookie`          |
| **CORS**              | Exact`FRONTEND_URL` origin with `credentials: true` — no wildcard              |
| **RBAC Middleware**   | `authenticate` → `requireAdmin` / `requireSuperAdmin` on every protected route |
| **Login Lockout**     | Configurable failed login threshold and lockout duration                       |
| **Password Hashing**  | bcryptjs with salted hashing                                                   |

### Cookie-Based Authentication Flow

```
1. POST /api/auth/login
   └─► Server validates credentials
   └─► Sets httpOnly cookies: accessToken (short-lived) + refreshToken (long-lived)
   └─► Response body: { success, user }  ← No token in JSON

2. Protected Request
   └─► Browser sends cookies automatically
   └─► Server reads req.cookies.accessToken in authenticate()

3. Token Expiry
   └─► Client interceptor catches 401
   └─► Calls POST /api/auth/refresh with refreshToken cookie
   └─► New accessToken cookie issued, original request retried

4. POST /api/auth/logout
   └─► Server revokes refresh token
   └─► Clears both cookies
```

---

## 6. API Documentation

### Live deployment

| What                   | URL                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| **Swagger (API docs)** | [https://shopsmart-r8p3.onrender.com/api-docs/](https://shopsmart-r8p3.onrender.com/api-docs/) |
| **Backend API base**   | [https://shopsmart-r8p3.onrender.com](https://shopsmart-r8p3.onrender.com)                     |
| **Frontend**           | [https://shopsmart-web.vercel.app/](https://shopsmart-web.vercel.app/)                         |

Interactive Swagger (OpenAPI 3) docs at the link above cover:

- All endpoints with request/response schemas
- Role-based access per route
- Auth flows (login, register, refresh, logout) and cookie behavior
- Error codes and validation rules

> For local development, use `http://localhost:4000` (API) and `http://localhost:3000` (frontend).

---

## 7. Getting Started

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+
- **MySQL** database

### Installation

```bash
git clone <repository-url>
cd shop_smart
```

### Backend Setup

```bash
cd server
npm install
cp .env.example .env          # Fill in all required values
npx prisma generate
npx prisma migrate dev         # Use `migrate deploy` for production
npm run dev                    # Start development server
```

| Endpoint            | URL                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------- | --- |
| API Base (local)    | `http://localhost:4000`                                                                        |
| API Base (prod)     | [https://shopsmart-r8p3.onrender.com](https://shopsmart-r8p3.onrender.com)                     |     |
| Health Check        | `http://localhost:4000/api/health` or `…/api/health` on prod                                   |
| Swagger Docs (prod) | [https://shopsmart-r8p3.onrender.com/api-docs/](https://shopsmart-r8p3.onrender.com/api-docs/) |
| Frontend (prod)     | [https://shopsmart-web.vercel.app/](https://shopsmart-web.vercel.app/)                         |

### Frontend Setup

```bash
cd client
npm install
# Create .env.local — see Environment Variables section
npm run dev                    # Start development server
```

App available at: `http://localhost:3000`

### Scripts Reference

| Context | Command         | Description                         |
| ------- | --------------- | ----------------------------------- |
| Server  | `npm run dev`   | TypeScript dev server (ts-node-dev) |
| Server  | `npm run build` | Compile to`dist/`                   |
| Server  | `npm run start` | Run compiled production build       |
| Client  | `npm run dev`   | Next.js development server          |
| Client  | `npm run build` | Production build                    |
| Client  | `npm run start` | Serve production build              |

---

## 8. Environment Variables

### Frontend — `client/.env.local`

| Variable              | Description          | Example                 |
| --------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000` |

### Backend — `server/.env`

| Variable                   | Description                           | Default / Notes                       |
| -------------------------- | ------------------------------------- | ------------------------------------- |
| `PORT`                     | HTTP server port                      | `4000`                                |
| `NODE_ENV`                 | Runtime environment                   | `development` / `production`          |
| `DATABASE_URL`             | MySQL connection string               | **Required**                          |
| `JWT_ACCESS_SECRET`        | Access token signing secret           | **Required in production**            |
| `JWT_REFRESH_SECRET`       | Refresh token signing secret          | **Required in production**            |
| `JWT_ACCESS_EXPIRES`       | Access token TTL                      | `1h`                                  |
| `JWT_REFRESH_EXPIRES_DAYS` | Refresh cookie max age (days)         | `30`                                  |
| `FRONTEND_URL`             | CORS origin (exact frontend URL)      | `http://localhost:3000`               |
| `COOKIE_ACCESS_NAME`       | Access token cookie name              | `accessToken`                         |
| `COOKIE_REFRESH_NAME`      | Refresh token cookie name             | `refreshToken`                        |
| `COOKIE_DOMAIN`            | Optional cookie domain for subdomains | e.g.`.example.com`                    |
| `COOKIE_SECURE`            | Disable secure flag in dev            | Auto`true` when `NODE_ENV=production` |
| `COOKIE_SAME_SITE`         | Override SameSite policy              | `none` when secure, else `lax`        |
| `MAX_FAILED_LOGINS`        | Lockout threshold (attempts)          | `5`                                   |
| `LOCKOUT_MINUTES`          | Account lockout duration              | `15`                                  |
| `SMTP_HOST`                | Email server host                     | Optional                              |
| `SMTP_PORT`                | Email server port                     | Optional                              |
| `SMTP_USER`                | SMTP username                         | Optional                              |
| `SMTP_PASS`                | SMTP password                         | Optional                              |
| `SMTP_FROM`                | Sender email address                  | Optional                              |

---

## 9. Deployment

### Checklist

- [ ] **HTTPS** — Ensure both frontend and API are served over HTTPS. Required for `secure` cookies.
- [ ] **`COOKIE_SECURE=true`** — Always enabled in production.
- [ ] **`COOKIE_SAME_SITE=none`** — Required for cross-origin requests (e.g. `app.example.com` → `api.example.com`).
- [ ] **`FRONTEND_URL`** — Set to the exact frontend origin (e.g. `https://app.example.com`). No wildcards.
- [ ] **`COOKIE_DOMAIN`** — Set to `.example.com` for subdomain cookie sharing.
- [ ] **Secrets** — Use strong, random values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- [ ] **`npx prisma migrate deploy`** — Run migrations before starting the server.

### Subdomain Setup Example

```
Frontend:  https://app.example.com   →   FRONTEND_URL=https://app.example.com
API:       https://api.example.com   →   COOKIE_DOMAIN=.example.com
```

---

## 10. Contributing

Contributions are welcome! Please follow these guidelines to keep the codebase consistent and maintainable.

### Code Standards

- **TypeScript strict mode** — No `any` types, no unused imports
- **ESLint** — All rules must pass before committing
- **No `console` in committed code** — Use the logger utility
- **Architecture** — Keep the `routes → controllers → services` pattern; avoid logic scattered in middleware

### Git Workflow

- **Branches** — Use descriptive names: `feature/coupon-crud`, `fix/refresh-token-rotation`
- **Commits** — Follow conventional commits: `feat(admin): add coupon CRUD endpoints`, `fix(auth): sameSite cookie for cross-origin`
- **Pull Requests** — Include a clear description of the change and any relevant context

---

<div align="center">

**ShopSmart** — Smart shopping. Trusted choices.

</div>
