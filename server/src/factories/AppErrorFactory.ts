import { AppError } from "../middleware/errorHandler";

export type AppErrorOptions = {
  statusCode?: number;
  /** When this key is present (even as `undefined`), it overrides the default code for the factory method. */
  code?: string | undefined;
};

function hasCodeKey(options?: AppErrorOptions): boolean {
  return options !== undefined && Object.prototype.hasOwnProperty.call(options, "code");
}

/**
 * Central factory for {@link AppError} instances (same behavior as `new AppError(...)`, defaults preserved).
 */
export class AppErrorFactory {
  static notFound(message: string, options?: AppErrorOptions): AppError {
    const statusCode = options?.statusCode ?? 404;
    const code = hasCodeKey(options) ? options!.code : "NOT_FOUND";
    return new AppError(statusCode, message, code);
  }

  static conflict(message: string, options?: AppErrorOptions): AppError {
    const statusCode = options?.statusCode ?? 409;
    const code = hasCodeKey(options) ? options!.code : "CONFLICT";
    return new AppError(statusCode, message, code);
  }

  static unauthorized(message: string, options?: AppErrorOptions): AppError {
    const statusCode = options?.statusCode ?? 401;
    const code = hasCodeKey(options) ? options!.code : "UNAUTHORIZED";
    return new AppError(statusCode, message, code);
  }

  static validation(message: string, options?: AppErrorOptions): AppError {
    const statusCode = options?.statusCode ?? 400;
    const code = hasCodeKey(options) ? options!.code : "VALIDATION_ERROR";
    return new AppError(statusCode, message, code);
  }
}
