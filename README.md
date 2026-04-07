<div align="center">

# ShopSmart

### A production-grade, full-stack eCommerce platform built with Next.js, Express, and Prisma

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://shopsmart-v1.vercel.app/)
[![Backend](https://img.shields.io/badge/Backend-Express%20%2B%20Prisma-blue?style=for-the-badge&logo=nodedotjs)](https://shop-smart-7sjw.onrender.com/)
[![Language](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

</div>

---

## Live Deployments

| Service | URL |
|---|---|
| **Frontend** | [shopsmart-v1.vercel.app](https://shopsmart-v1.vercel.app/) |
| **Backend API** | [shop-smart-7sjw.onrender.com](https://shop-smart-7sjw.onrender.com/) |
| **Swagger API Docs** | [shop-smart-7sjw.onrender.com/api-docs](https://shop-smart-7sjw.onrender.com/api-docs) |

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Design Patterns & OOP](#design-patterns--oop)
- [Contributing](#contributing)
- [Future Scope](#future-scope)
- [License](#license)

---

## Features

### Customer Storefront
- Browse a full product catalog with filtering, sorting, and category navigation
- Add items to cart, update quantities, and proceed through checkout
- View order history and track order lifecycle status
- Submit and read product reviews

### Authentication & Security
- Secure cookie-based JWT sessions (httpOnly, sameSite-protected)
- Automatic token refresh on 401 with a single-retry Axios interceptor
- Email verification and self-service password reset flows
- Role-based access control (Customer / Admin / Super Admin)

### Admin Dashboard
- View KPI cards, sales reports, and user analytics
- Manage product catalog: create, update, and delete listings
- Moderate reviews and manage coupon codes
- Update order statuses with RBAC enforcement

### Super Admin Panel
- Full admin user management (create, update, delete admins)
- System configuration and feature flag management
- Platform-wide analytics and audit logs

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | JWT (httpOnly cookies), bcrypt |
| **API Docs** | Swagger / OpenAPI |
| **Testing** | Playwright (E2E), Jest (unit) |
| **Frontend Deploy** | Vercel |
| **Backend Deploy** | Render |
| **Containerization** | Docker + Docker Compose |

---

## Architecture

ShopSmart follows a clean **monorepo** structure with a strict layered backend and a role-gated frontend.

### High-Level Request Flow

```
Browser / Next.js Client
        │
        │  Axios (withCredentials: true)
        ▼
   Express Server  (/api)
        │
        ├── authenticate middleware  (JWT cookie / Bearer)
        ├── authorize middleware     (RBAC: user / admin / super-admin)
        │
        ▼
   Route -> Controller -> Service -> Repository -> PostgreSQL (Prisma)
        │
        └── Domain Events (EventBus -> Observers)
```

### Backend Layers

| Layer | Responsibility | Example |
|---|---|---|
| **Routes** | Express wiring + middleware composition | `auth.routes.ts` |
| **Controllers** | HTTP orchestration, status codes | `auth.controller.ts` |
| **Services** | Domain / business logic | `auth.service.ts` |
| **Repositories** | Prisma persistence behind interfaces | `PrismaOrderRepository.ts` |
| **Middleware** | Auth, RBAC, validation, error handling | `authenticate.ts`, `authorize.ts` |

### Composition Root & Dependency Injection

All concrete implementations are wired in `server/src/container.ts` via `ServiceFactory`, enabling runtime strategy selection:

- **Token service**: `JwtTokenService` vs `OAuthJwtTokenService` (controlled by `AUTH_PROVIDER`)
- **Email provider**: `NodemailerStrategy` vs `SendGridStrategy` (controlled by `EMAIL_PROVIDER`)
- **Order pricing profile**: discount, shipping, and pricing strategies (controlled by `ORDER_PRICING_STRATEGY`)

---

## Folder Structure

```
shop_smart/
├── client/                         # Next.js (App Router) frontend
│   ├── app/                        # App shell + page routes
│   ├── api/
│   │   └── axios.ts                # Shared Axios client + refresh-on-401 logic
│   ├── components/
│   │   ├── auth/                   # ProtectedRoute, AdminRoute, SuperAdminRoute
│   │   ├── admin/                  # Admin dashboard: charts, tables, sidebar
│   │   ├── super-admin/            # Super admin sidebar + navigation
│   │   ├── shop/                   # Product cards, grid, filters, sorting
│   │   ├── layout/                 # Header, footer, containers
│   │   └── ui/                     # Shared UI primitives (Button, Logo, etc.)
│   ├── context/
│   │   └── auth-context.tsx        # AuthProvider, useIsAdmin, useIsSuperAdmin
│   └── hooks/
│       ├── use-api-cart.ts         # API-backed cart hook
│       └── use-debounce.ts         # Input debounce utility
│
├── server/                         # Express + Prisma backend
│   └── src/
│       ├── app.ts                  # Express app setup + Swagger mount
│       ├── server.ts               # Server bootstrap
│       ├── container.ts            # Composition root (DI wiring)
│       ├── routes/
│       │   └── index.ts            # API router mount + /health endpoint
│       ├── modules/                # Feature slices (routes / controller / service)
│       │   ├── auth/
│       │   ├── user/
│       │   ├── users/
│       │   ├── products/
│       │   ├── categories/
│       │   ├── cart/
│       │   ├── orders/
│       │   ├── reviews/
│       │   ├── admin/
│       │   └── super-admin/
│       ├── middleware/             # authenticate, authorize, validate, errorHandler
│       ├── repositories/          # Prisma implementations (e.g. PrismaOrderRepository)
│       ├── interfaces/             # I*Repository, ITokenService, IHashService, etc.
│       ├── factories/              # ServiceFactory, ApiResponseFactory, AppErrorFactory
│       ├── strategies/             # Email + order commerce strategies
│       ├── services/               # JwtTokenService, registry.ts (pricing profiles)
│       ├── adapters/               # OrderAdapter, ProductAdapter, UserAdapter
│       ├── commands/               # UpdateOrderStatusCommand
│       ├── events/                 # EventBus + observers (Audit, Notification)
│       ├── base/                   # BaseController (Template Method)
│       └── config/                 # env.ts, prisma.ts
│
├── e2e/                            # Playwright smoke tests
│   ├── playwright.config.ts
│   └── specs/smoke.spec.ts
│
├── docs/                           # Architecture, ER, UML, SDLC docs
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **npm**
- **PostgreSQL** database (local or hosted)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shop-smart.git
cd shop-smart
```

### 2. Configure Environment Variables

**Backend** — create `server/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shopsmart"

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
COOKIE_ACCESS_NAME=access_token
COOKIE_REFRESH_NAME=refresh_token

# Auth Provider: "jwt" | "oauth"
AUTH_PROVIDER=jwt

# Email Provider: "nodemailer" | "sendgrid"
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_password

# Order Pricing Strategy: "standard" | "premium" | etc.
ORDER_PRICING_STRATEGY=standard

# App
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**Frontend** — create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Run the Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

> API available at: `http://localhost:4000`  
> Health check: `GET http://localhost:4000/api/health`

### 4. Run the Frontend

```bash
cd client
npm install
npm run dev
```

> Frontend available at: `http://localhost:3000`

### 5. Run via Docker Compose

```bash
docker compose up --build
```

Both services will start automatically.

---

## Running Tests

### E2E Tests (Playwright)

```bash
cd e2e
npm install
npm run e2e
```

Smoke tests cover:
- Home page loads (`GET /`)
- API health endpoint responds (`GET /api/health`)

### Backend Unit Tests

```bash
cd server
npm run test
```

---

## API Documentation

Interactive API documentation is available via Swagger UI:

**[https://shop-smart-7sjw.onrender.com/api-docs](https://shop-smart-7sjw.onrender.com/api-docs)**

### API Modules

| Prefix | Module | Auth Required |
|---|---|---|
| `/api/auth` | Register, login, refresh, logout, verify email | Public / Authenticated |
| `/api/user` | Current user profile (me endpoints) | Authenticated |
| `/api/users` | User CRUD, orders, cart (self or admin) | Authenticated |
| `/api/products` | Product catalog, analytics | Public / Admin |
| `/api/categories` | Category listing and management | Public / Admin |
| `/api/cart` | Cart CRUD | Authenticated |
| `/api/orders` | Checkout, order lifecycle | Authenticated |
| `/api/reviews` | Create, moderate, list reviews | Public / Admin |
| `/api/admin` | KPIs, reports, coupons, moderation | Admin |
| `/api/super-admin` | Admin CRUD, feature flags, analytics | Super Admin |
| `/api/health` | Health check | Public |

### Testing APIs

1. Open the Swagger UI link above
2. Use the **Authorize** button to set a Bearer token, or rely on cookie auth from the frontend
3. Execute requests directly in the browser

---

## Deployment

### Frontend — Vercel

The `client/` directory is deployed to [Vercel](https://vercel.com). On every push to `main`, Vercel automatically builds and deploys the Next.js app.

Set the following environment variable in the Vercel dashboard:

```
NEXT_PUBLIC_API_URL=https://shop-smart-7sjw.onrender.com
```

### Backend — Render

The `server/` directory is deployed to [Render](https://render.com) as a Node.js web service.

Set all required environment variables (see `.env` template above) in the Render dashboard under **Environment**.

Run the following as the start command:

```bash
npx prisma migrate deploy && npm start
```

---

## Design Patterns & OOP

ShopSmart demonstrates applied software engineering principles throughout the codebase.

### Design Patterns

| Pattern | Implementation |
|---|---|
| **Repository** | `I*Repository` interfaces + `Prisma*Repository` implementations |
| **Strategy** | Token, email, pricing, shipping, and discount strategies |
| **Factory** | `ServiceFactory`, `ApiResponseFactory`, `AppErrorFactory` |
| **Template Method** | `BaseController.handleRequest()` — subclasses override `execute()` |
| **Observer** | `EventBus` + `AuditLogObserver`, `NotificationObserver` |
| **Command** | `UpdateOrderStatusCommand` |
| **Adapter** | `OrderAdapter`, `ProductAdapter`, `UserAdapter` |
| **Singleton** | Prisma client (dev global cache), `EventBus` |
| **Middleware** | Express pipeline: authenticate -> authorize -> validate -> handle |

### SOLID Principles

- **S** — Each service, repository, and middleware has a single, focused responsibility
- **O** — New pricing profiles and notification channels can be added without modifying existing services
- **L** — All controller subclasses are substitutable via the `BaseController` contract
- **I** — Small focused interfaces: `IUserReader` / `IUserWriter`, `IEmailProviderStrategy` vs `IEmailService`
- **D** — High-level modules depend on abstractions (e.g. `AuthService` depends on `ITokenService`, not `JwtTokenService` directly)

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

### Ownership Boundaries

| Area | Path |
|---|---|
| Frontend (Next.js) | `client/app/*`, `client/components/*`, `client/context/*`, `client/api/*` |
| Backend (Express/Prisma) | `server/src/modules/*`, `server/src/middleware/*`, `server/src/repositories/*` |
| Backend Unit Tests | `server/src/**/__tests__/*` |
| Frontend Tests | `client/**/__tests__/*` |
| E2E Tests | `e2e/specs/*` |
| Docs | `docs/*` |

Please ensure your changes include relevant tests and do not break existing ones.

---

## Future Scope

The codebase includes ready-made extension points:

- **New pricing/shipping/discount policies** — add factories in `server/src/services/registry.ts` and implement strategies in `server/src/strategies/*`
- **New notification channels** — implement `IAuthNotificationSender` and wire in `ServiceFactory`
- **Richer event handling** — subscribe new observers via `EventBus`
- **OAuth support** — swap to `OAuthJwtTokenService` via the `AUTH_PROVIDER` env flag

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

<div align="center">
  Built with Next.js, Express, and Prisma
</div>