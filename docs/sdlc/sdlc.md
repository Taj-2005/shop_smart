# ShopSmart — Software Development Life Cycle (SDLC)

This document defines **how the team plans, builds, reviews, and ships** ShopSmart. It aligns day-to-day work with coursework expectations (process, quality gates, and clear ownership).

**Roles referenced:** Taj (Team Lead), Hadole, Pranavi, Praneeth, Ashrith.

---

## 1. Phases of the project

Work is grouped into **phases** with clear intent. Dates are filled in by the team against course deadlines.

| Phase | Goal | Typical outputs |
|-------|------|------------------|
| **1 — Setup** | Everyone can run client + API locally; repo rules are clear | Env templates, `CONTRIBUTING.md`, branch protection, CI green on `develop` |
| **2 — Design** | Architecture and data model are documented before heavy refactors | ADRs, UML (use case, sequence, class), ER diagram, layered overview |
| **3 — Development** | Implement or refactor features per ownership | PRs to `develop`, layered server modules, client structure |
| **4 — Hardening (patterns & quality)** | SOLID/patterns narrative matches code; tech debt reduced | `docs/architecture` updates, optional `server/src/domain/` value types |
| **5 — Testing** | Automated proof of behavior | Unit + integration + expanded e2e; critical paths documented |
| **6 — Documentation & release prep** | Submission-ready package | Final README alignment, SDLC/RACI current, demo script |
| **7 — Demo** | Stakeholder presentation | Recorded or live demo, seed data verified |

**Phase exit (general rule):** A phase is “done” when its **deliverables** exist in the repo (or linked artifact) and the **Team Lead** has acknowledged them in standup or PR.

---

## 2. RACI matrix

**Legend**

| Letter | Meaning |
|--------|---------|
| **R** | **Responsible** — does the work |
| **A** | **Accountable** — final decision / merge for that area (one **A** per row) |
| **C** | **Consulted** — gives input before or during work |
| **I** | **Informed** — kept in the loop after decisions |

| Activity / deliverable | Taj | Hadole | Pranavi | Praneeth | Ashrith |
|------------------------|-----|--------|---------|----------|---------|
| Architecture & ADRs | **A/R** | C | C | C | I |
| SDLC / process docs (this file) | **A/R** | I | I | I | I |
| Git workflow & PR policy | **A/R** | I | I | I | I |
| Server modularization (routes → services) | C | **A/R** | I | C | I |
| Prisma schema / migrations / seed | C | C | I | **A/R** | I |
| ER diagram & data mapping | C | C | I | **A/R** | I |
| Integration tests (API) | C | C | I | **A/R** | C |
| Client structure & UX flows | C | I | **A/R** | I | C |
| Client unit/component tests | C | I | **A/R** | I | C |
| UML (use case / sequence — customer flows) | C | C | **A/R** | I | C |
| E2E tests (Playwright) | C | I | C | C | **A/R** |
| QA checklist & demo script | C | I | C | C | **A/R** |
| CI workflows (lint/test/e2e) | **A/R** | C | C | C | C |
| Release PR `develop` → `main` | **A/R** | I | I | I | I |

*If a task is not listed, default **R** is the person who owns the touched folder (see `PROJECT_AUDIT_AND_ROADMAP.md`); **A** is Taj for cross-cutting conflicts.*

---

## 3. Definition of Done (DoD)

A work item (ticket or PR scope) is **Done** when **all** applicable items below are true.

### 3.1 Code & quality

- [ ] **Lint passes** for affected packages (`client`, `server`, or agreed scope).
- [ ] **Tests pass** locally for affected packages (unit; add integration/e2e when the change touches API contracts or user flows).
- [ ] **No secrets** committed (env files, keys, tokens).
- [ ] **Behavior change** is intentional; unrelated refactors are split into a separate PR when practical.

### 3.2 Review & integration

- [ ] **PR** targets **`develop`** (unless release exception from lead).
- [ ] **PR template** filled: what changed, how to test, screenshots for UI.
- [ ] At least **one approval** from a teammate (Team Lead approval required for architecture, CI, or `develop` → `main`).
- [ ] **CI green** on the PR before merge.

### 3.3 Documentation (when required)

- [ ] **User-visible** or **setup** change → `README.md` or env example updated.
- [ ] **Architecture / security** change → ADR or architecture doc updated (or follow-up issue filed with owner).
- [ ] **Schema** change → migration + ER note or diagram update (owner: Praneeth, reviewed by Taj).

### 3.4 Done ≠ perfect

“Done” means **merged and shippable for this iteration**. Follow-ups are allowed if they are **tracked** (issue or next milestone).

---

## 4. Development workflow

### 4.1 Daily flow (beginner-friendly)

1. `git checkout develop` and `git pull origin develop`.
2. `git checkout -b feature/yourname-short-topic` (see `CONTRIBUTING.md` for prefixes).
3. Make **small commits** with conventional messages (`feat(server): …`).
4. Push branch → open **PR to `develop`**.
5. Fix review comments; keep CI green.
6. After merge, delete the feature branch (local + remote) if your team uses that habit.

### 4.2 Branching rules

| Branch | Purpose |
|--------|---------|
| `main` | **Release / submission** line; protected; merge only via reviewed release PR |
| `develop` | **Integration** line; all feature PRs target here first |
| `feature/*`, `fix/*`, `docs/*`, `test/*`, `chore/*` | Short-lived work branches |

### 4.3 Pull requests

- **One coherent change** per PR (or clearly described stack with lead OK).
- **Reviewer** focuses on correctness, security (auth/cookies/CORS), and DoD.
- **Author** responds to comments within agreed team SLA (e.g. 24–48h on school days).

### 4.4 Merge to `main`

- Triggered for **milestones** or **submission** windows.
- **Taj** opens `develop` → `main` PR after team sign-off (demo dry-run, critical tests green).
- Tag or release note optional but recommended for coursework handoff.

### 4.5 Conflict avoidance

- **File ownership** by area (backend vs client vs e2e vs docs) — see RACI and `PROJECT_AUDIT_AND_ROADMAP.md`.
- **Do not** edit the same large file in parallel without coordination (e.g. `README.md` — one PR at a time, lead merges sections).

---

## 5. Related documents

| Document | Location |
|----------|----------|
| Contributing & git conventions | `CONTRIBUTING.md` |
| PR template | `.github/pull_request_template.md` |
| Audit & roadmap | `PROJECT_AUDIT_AND_ROADMAP.md` |
| Architecture decisions | `docs/architecture/adr-*.md` |

---

## 6. Revision history

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-03-29 | Initial SDLC: phases, RACI, DoD, workflow |

---

*Maintained by **Taj** (Accountable). All members keep RACI accurate when roles shift.*
