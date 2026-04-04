const isProd = process.env.NODE_ENV === "production";

type LogLevel = "info" | "warn" | "error" | "debug";

export class LoggerService {
  private static instance: LoggerService | undefined;

  private constructor() {}

  private static getInstance(): LoggerService {
    LoggerService.instance ??= new LoggerService();
    return LoggerService.instance;
  }

  private write(
    level: LogLevel,
    message: string,
    meta: Record<string, unknown> | undefined,
    writeLine: (line: string) => void,
  ): void {
    if (isProd && level !== "error") return;

    const payload: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta ?? {}),
    };
    writeLine(JSON.stringify(payload));
  }

  static info(message: string, meta?: Record<string, unknown>): void {
    LoggerService.getInstance().write("info", message, meta, console.log);
  }

  static warn(message: string, meta?: Record<string, unknown>): void {
    LoggerService.getInstance().write("warn", message, meta, console.warn);
  }

  static error(message: string, meta?: Record<string, unknown>): void {
    LoggerService.getInstance().write("error", message, meta, console.error);
  }

  static debug(message: string, meta?: Record<string, unknown>): void {
    LoggerService.getInstance().write("debug", message, meta, console.debug);
  }
}
