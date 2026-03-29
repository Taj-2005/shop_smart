# Architecture

This folder holds **system and software architecture** documentation for ShopSmart.

## Purpose

- **High-level views** of how the frontend, API, database, and external systems relate (e.g. layered diagrams, C4-style context/container notes).
- **Architecture Decision Records (ADRs)** — short, dated documents that capture *why* important technical choices were made (stack split, auth model, deployment shape).
- **Narratives** that tie implementation to coursework expectations (modularity, boundaries, evolution).

## What to add here

| Artifact | Description |
|----------|-------------|
| Diagrams | Source files (e.g. Draw.io, PlantUML) plus exported **PNG** or **SVG** for submissions and README links |
| ADRs | `adr/0001-title.md` style — one decision per file |
| Overview | A single `OVERVIEW.md` summarizing layers: client → API → persistence |

## Conventions

- Prefer **stable filenames** and date or ADR numbers in decision docs.
- Link to code paths (e.g. `server/src/routes`, `client/app`) when describing boundaries.

---

*Maintained by the team. Team lead integrates cross-cutting updates.*
