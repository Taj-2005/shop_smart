# ADR-001: Monorepo architecture for ShopSmart

| Field | Value |
|-------|--------|
| **Status** | Accepted |
| **Date** | 2026-03-29 |
| **Deciders** | Team (ShopSmart) |
| **Technical area** | Repository structure, delivery |

---

## Context

ShopSmart is a full-stack e-commerce system with:

- A **browser client** (Next.js) for customers, admins, and super-admins.
- A **REST API** (Express + Prisma) for business logic, persistence, and auth.
- **End-to-end tests** (Playwright) and **CI** that must run across these parts.

The team needed to decide how to **organize source control**: keep everything in one repository (**monorepo**) or split into separate repositories (**polyrepo**) for frontend, backend, and tests.

Drivers:

- **Course and team collaboration** — five contributors need clear ownership without constant cross-repo versioning drift.
- **API contract** — the client and server share an implicit contract (URLs, payloads, cookies); changes often land together.
- **CI** — lint, unit, integration, and e2e should run in a **single pipeline** with one commit SHA.
- **Onboarding** — one clone, one `docker-compose`, predictable folder layout.

---

## Decision

Adopt a **monorepo** with a fixed top-level layout:

- `client/` — Next.js application.
- `server/` — Express API and Prisma schema/migrations.
- `e2e/` — Playwright tests against the running stack.
- `docs/` — architecture, UML, ER, SDLC artifacts.
- Shared root files: `README.md`, `CONTRIBUTING.md`, `docker-compose.yml`, `.github/workflows/`.

Feature work is delivered via **branches and PRs into `develop`**; releases promote to `main` per team process. The monorepo is the **single source of truth** for the ShopSmart product as submitted for the system design project.

---

## Alternatives

### 1. Polyrepo (separate Git repositories)

- **Description:** One repo for `shopsmart-web`, one for `shopsmart-api`, optional third for `shopsmart-e2e`.
- **Pros:** Independent versioning, smaller clones per service, separate access rules if needed.
- **Cons:** Harder to keep API and UI in sync; duplicate CI wiring; more overhead for students (three PRs, tag alignment, submodule or manual coordination).
- **Outcome:** Rejected for this project phase due to **coordination cost** and coursework need for **one coherent submission**.

### 2. Monorepo with shared packages (npm workspaces / Turborepo)

- **Description:** Same repo plus `packages/ui`, `packages/types`, etc.
- **Pros:** Strong reuse and type-sharing between client and server; scalable for large teams.
- **Cons:** Extra tooling and mental overhead; current codebase does not yet require extracted packages.
- **Outcome:** **Deferred** — can be revisited if shared DTOs or UI kits become painful to duplicate.

### 3. Single folder without clear boundaries (flat monolith folder)

- **Description:** All code under one `src/` mixing UI and API.
- **Pros:** Minimal structure.
- **Cons:** Violates separation of concerns; breaks Next.js and Node deployment models; poor clarity for RBAC and coursework diagrams.
- **Outcome:** Rejected.

---

## Consequences

### Positive

- **One PR** can update API and client together when contracts change (e.g. new field on cart or order).
- **CI** sees the whole tree; failing client lint or server tests blocks merge consistently.
- **Documentation** (`docs/`) lives beside code, improving traceability for system design deliverables.
- **Docker Compose** can reference `./client` and `./server` without cross-repo paths.

### Negative / trade-offs

- **Repository size** grows with all `node_modules` ignored but still larger history than a single-service repo.
- **Access control** is all-or-nothing at repo level (GitHub does not split folders per team member without additional tooling).
- **Deploy pipelines** (e.g. Vercel + Render) must each **point at a subdirectory** and env vars must stay aligned manually unless automated.

### Follow-up

- Document **deployment mapping** (which root folder deploys where) in `README.md` or a follow-up ADR if the stack changes.
- If **shared types** between client and server become essential, consider ADR-002 for workspaces or OpenAPI-generated clients.

---

## References

- Repository layout: root `README.md`, `PROJECT_AUDIT_AND_ROADMAP.md`
- Contributing: `CONTRIBUTING.md`
