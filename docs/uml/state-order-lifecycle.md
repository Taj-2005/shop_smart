# ShopSmart — State Diagram: Order Lifecycle

> Order status transitions from placement through delivery or cancellation.

```mermaid
stateDiagram-v2
    [*] --> PENDING : Customer places order\nPOST /api/orders

    state "🟡 Active Order" as ActiveGroup {
        PENDING --> CONFIRMED   : Admin confirms order
        CONFIRMED --> PROCESSING : Admin starts processing
        PROCESSING --> SHIPPED  : Admin marks as shipped\n(tracking number added)
    }

    PENDING --> CANCELLED   : Customer cancels (before confirmation)\nOR Admin cancels (fraud/out-of-stock)
    PROCESSING --> CANCELLED : Admin unable to fulfil
    SHIPPED --> DELIVERED   : Delivery confirmed
    SHIPPED --> REFUNDED    : Item lost or returned in transit
    DELIVERED --> REFUNDED  : Customer raises return request\n(Admin approves refund)

    CANCELLED --> [*]
    REFUNDED  --> [*]
    DELIVERED --> [*]

    note right of PENDING
        Stock is reserved.
        Awaiting admin action.
    end note

    note right of SHIPPED
        Customer can track order.
        No cancellation allowed.
    end note

    note right of REFUNDED
        Stock is restored if applicable.
        Refund processed externally.
    end note
```

---

## Transition Table

| From | To | Trigger | Actor |
|------|----|---------|-------|
| — | PENDING | Customer places order | Customer |
| PENDING | CONFIRMED | Admin confirms | Admin |
| PENDING | CANCELLED | Customer or Admin cancels | Customer / Admin |
| CONFIRMED | PROCESSING | Admin starts processing | Admin |
| PROCESSING | SHIPPED | Admin marks shipped | Admin |
| PROCESSING | CANCELLED | Admin unable to fulfil | Admin |
| SHIPPED | DELIVERED | Delivery confirmed | Admin / System |
| SHIPPED | REFUNDED | Lost/returned in transit | Admin |
| DELIVERED | REFUNDED | Return approved | Admin |
| CANCELLED | — | Terminal state | — |
| REFUNDED | — | Terminal state | — |
| DELIVERED | — | Terminal state | — |
