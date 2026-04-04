import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// Extend the Express Request to include our custom context
export interface RequestWithContext extends Request {
  context?: {
    requestId: string;
    timestamp: Date;
    [key: string]: unknown;
  };
}

/**
 * Middleware to inject a unique request context.
 * Attaches a `requestId` and `timestamp` to `req.context` for tracking and logging.
 */
export function requestContextMiddleware(
  req: RequestWithContext,
  _res: Response,
  next: NextFunction
): void {
  req.context = {
    requestId: uuidv4(),
    timestamp: new Date(),
  };

  next();
}
