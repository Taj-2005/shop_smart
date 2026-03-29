# UML

This folder holds **Unified Modeling Language** artifacts for the system design project.

## Purpose

- Satisfy coursework requirements for **structural** and **behavioral** models.
- Give reviewers a **single place** to find use cases, classes, and interaction flows.

## Recommended diagrams

| Type | Typical focus |
|------|----------------|
| **Use case** | Actors: Customer, Admin, Super Admin — goals and system boundaries |
| **Class** | Domain concepts, services, and key client boundaries (keep legible; group by package/module) |
| **Sequence** | Critical flows: login + token refresh, checkout, admin order status change |

## What to add here

- **Source** (`.puml`, `.drawio`, or tool-native files) so diagrams can be revised.
- **Exports** (PNG/SVG/PDF) for reports, slides, and the main README.

## Conventions

- Name files clearly: `use-case-overview`, `sequence-checkout`, `class-backend-services`.
- One **primary flow per sequence** diagram to avoid clutter.

---

*Diagram ownership is split by area; the team lead consolidates naming and cross-links.*
