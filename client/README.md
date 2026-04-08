# ShopSmart — Client

Next.js 16 (App Router) frontend for ShopSmart. UI-only: landing page, shop experience, design system (Tailwind + Framer Motion).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script   | Description              |
|----------|--------------------------|
| `npm run dev`   | Dev server (port 3000)   |
| `npm run build` | Production build         |
| `npm run start` | Run production build     |
| `npm run lint`  | ESLint                   |

## Routes

| Path    | Description              |
|---------|--------------------------|
| `/`     | Public landing           |
| `/shop` | Shop UI (product grid)   |

## Design

- **Colors**: Deep Charcoal, Cognitive Teal, Cloud White, UI Gray (`app/globals.css`)
- **Fonts**: Plus Jakarta Sans (body), Outfit (headings)
- **Favicon**: `app/icon.svg` (teal “S” logo)

See the [root README](../README.md) for full project setup and deployment.

**Production:** [shopsmart.taj.works](https://shopsmart.taj.works/) — API [shopsmart-server.taj.works](https://shopsmart-server.taj.works/) — Swagger [shopsmart-swagger.taj.works/api-docs](https://shopsmart-swagger.taj.works/api-docs)
