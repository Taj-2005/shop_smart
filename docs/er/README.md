# Entity–Relationship (ER)

This folder holds the **conceptual and logical data model** for ShopSmart, aligned with persistence.

**Live app:** [Frontend](https://shopsmart.taj.works/) · [API](https://shopsmart-server.taj.works/) · [Swagger](https://shopsmart-swagger.taj.works/api-docs)

## Purpose

- Provide an **ER diagram** that matches the implemented schema (`server/prisma/schema.prisma`).
- Document **entities, relationships, cardinalities**, and important attributes for markers and onboarding.
- Bridge **business language** (Customer, Order, Product) with **physical tables** (including naming conventions and soft deletes).

## What to add here

| Artifact | Description |
|----------|-------------|
| ER diagram | Exported image (PNG/SVG) plus editable source |
| Mapping notes | Short table: ER entity ↔ Prisma model ↔ table name (`@@map`) |
| Narrative | Assumptions, enums (e.g. order status), and indexing rationale if relevant |

## Conventions

- When the schema changes, **update the diagram and mapping** in the same PR or immediately after.
- Prefer **one canonical** ER export for submissions; archive older versions if needed.

---

*Primary ownership: data model and integration testing; architecture lead reviews for consistency.*
