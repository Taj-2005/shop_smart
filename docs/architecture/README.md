# Architecture

This folder holds **system and software architecture** documentation for ShopSmart.

**Live app:** [Frontend](https://shopsmart.taj.works/) · [API](https://shopsmart-server.taj.works/) · [Swagger](https://shopsmart-swagger.taj.works/api-docs)

## Purpose

- **High-level views** of how the frontend, API, database, and external systems relate (e.g. layered diagrams, C4-style context/container notes).
- **Architecture Decision Records (ADRs)** — short, dated documents that capture *why* important technical choices were made (stack split, auth model, deployment shape).
- **Narratives** that tie implementation to coursework expectations (modularity, boundaries, evolution).

## What to add here

| Artifact | Description |
|----------|-------------|
| Diagrams | Source files (e.g. Draw.io, PlantUML) plus exported **PNG** or **SVG** for submissions and README links |
| ADRs | `adr-NNN-topic.md` in this folder (or `adr/` subfolder) — one decision per file |
| Overview | A single `OVERVIEW.md` summarizing layers: client → API → persistence |

## Architecture Decision Records (index)

| ID | Title | File |
|----|--------|------|
| ADR-001 | Monorepo architecture | [adr-001-monorepo.md](./adr-001-monorepo.md) |
| ADR-002 | JWT auth via httpOnly cookies | [adr-002-auth.md](./adr-002-auth.md) |

## Conventions

- Prefer **stable filenames** and date or ADR numbers in decision docs.
- Link to code paths (e.g. `server/src/routes`, `client/app`) when describing boundaries.

## CI/CD and cloud layout

Automated pipelines and AWS targets (**ECS Fargate** vs **Amazon EKS**) are documented in the repository root [README.md](../../README.md#github-actions-cicd) under **GitHub Actions (CI/CD)** and **AWS (Terraform)**. Workflow definitions live in [`.github/workflows/`](../../.github/workflows).

---

*Maintained by the team. Team lead integrates cross-cutting updates.*
