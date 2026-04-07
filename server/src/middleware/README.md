# Middleware Documentation

## Request Context Middleware (`requestContext.ts`)

This middleware implements the Context pattern for the request lifecycle. It automatically intercepts incoming requests and attaches essential metadata to a `req.context` object before it hits your controllers.

### Features
- **Request ID Allocation**: Attaches a `requestId` (UUID v4) to explicitly trace and group logs across services.
- **Timestamping**: Captures the exact `Date()` the connection initialized.

### Example Usage

1. Register into the Express pipeline:
```typescript
import { requestContextMiddleware } from './middleware/requestContext';

app.use(requestContextMiddleware);
```

2. Access the context in your controllers:
```typescript
import { RequestWithContext } from '../middleware/requestContext';

export function myController(req: RequestWithContext, res: Response) {
  const { requestId, timestamp } = req.context!;
  console.log(`[${requestId}] Request started at ${timestamp}`);
}
```
