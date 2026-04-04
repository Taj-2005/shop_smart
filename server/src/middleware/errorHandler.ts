import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";
import { ApiResponseFactory } from "../factories/ApiResponseFactory";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Structural match: any thrown value with these fields behaves like AppError (LSP-safe substitution). */
function httpErrorShape(err: unknown): { statusCode: number; message: string; code: string } | null {
  if (err === null || typeof err !== "object") return null;
  const o = err as Record<string, unknown>;
  const statusCode = o.statusCode;
  const message = o.message;
  if (typeof statusCode !== "number" || typeof message !== "string") return null;
  const code = o.code;
  return {
    statusCode,
    message,
    code: typeof code === "string" ? code : "INTERNAL_ERROR",
  };
}

function messageFromUnknown(err: unknown): string | undefined {
  if (err === null || typeof err !== "object") return undefined;
  const m = (err as Record<string, unknown>).message;
  return typeof m === "string" ? m : undefined;
}

function stackFromUnknown(err: unknown): string | undefined {
  if (err === null || typeof err !== "object") return undefined;
  const s = (err as Record<string, unknown>).stack;
  return typeof s === "string" ? s : undefined;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const shaped = httpErrorShape(err);
  const status = shaped !== null ? shaped.statusCode : 500;
  const message = shaped !== null ? shaped.message : "Internal server error";
  const code = shaped !== null ? shaped.code : "INTERNAL_ERROR";

  if (status >= 500) {
    logger.error("Unhandled error", { err: messageFromUnknown(err) ?? String(err), stack: stackFromUnknown(err) });
  }

  res.status(status).json({
    ...ApiResponseFactory.error(message, code),
    ...(process.env.NODE_ENV === "development" && { stack: stackFromUnknown(err) }),
  });
}
