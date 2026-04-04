# ShopSmart — UML Diagrams Index

All diagrams are based on the actual codebase: `server/prisma/schema.prisma`, `server/src/`, and `client/`.

---

## 📂 Diagram Files

| # | Diagram | File | Format | Tool |
|---|---------|------|--------|------|
| 1 | Use Case Diagram | [use-case.puml](./use-case.puml) | PlantUML | PlantUML / draw.io |
| 2 | Class Diagram | [class-diagram.md](./class-diagram.md) | Mermaid | GitHub / VS Code |
| 3 | Sequence — Auth Flow | [seq-auth-flow.md](./seq-auth-flow.md) | Mermaid | GitHub / VS Code |
| 4 | Activity — Checkout | [activity-checkout.md](./activity-checkout.md) | Mermaid | GitHub / VS Code |
| 5 | State — Order Lifecycle | [state-order-lifecycle.md](./state-order-lifecycle.md) | Mermaid | GitHub / VS Code |
| 6 | Sequence — Admin Products | [seq-admin-products.md](./seq-admin-products.md) | Mermaid | GitHub / VS Code |
| 7 | Component Diagram | [component-diagram.puml](./component-diagram.puml) | PlantUML | PlantUML / draw.io |
| 8 | Deployment Diagram | [deployment-diagram.puml](./deployment-diagram.puml) | PlantUML | PlantUML / draw.io |

> ER Diagram is in [`../er/er-diagram.md`](../er/er-diagram.md)

---

## 🛠️ How to Render

### Mermaid files (`.md`)
- **GitHub** — renders automatically in any `.md` file with a mermaid code block
- **VS Code** — install [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)
- **Online** — paste code at https://mermaid.live

### PlantUML files (`.puml`)
- **VS Code** — install [PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml) + Java
- **Online** — paste code at https://www.plantuml.com/plantuml/uml/
- **draw.io** — File → Import → PlantUML

---

## 🔄 Maintenance

When any of the following change, update the corresponding diagram:

| Change | Update |
|--------|--------|
| Prisma schema model added/modified | `class-diagram.md`, `../er/er-diagram.md` |
| New API route / module | `use-case.puml`, `component-diagram.puml` |
| Order status enum changes | `state-order-lifecycle.md` |
| Auth flow changes (tokens, cookies) | `seq-auth-flow.md` |
| New deployment target | `deployment-diagram.puml` |
| Checkout process changes | `activity-checkout.md` |
