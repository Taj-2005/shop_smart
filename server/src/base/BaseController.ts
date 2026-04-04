import { Request, Response, NextFunction } from "express";
import { ApiResponseFactory } from "../factories/ApiResponseFactory";

export abstract class BaseController {
  /**
   * Hook for request validation logic.
   * Can be overridden by subclasses.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async validateRequest(req: Request): Promise<void> {
    // Default implementation does nothing
  }

  /**
   * Abstract method containing core request execution logic.
   * Must be implemented by specific endpoint controllers.
   */
  protected abstract execute(req: Request, res: Response): Promise<unknown>;

  /**
   * Standardizes response formatting.
   * Only called if headers haven't already been sent by the execution block.
   */
  protected formatResponse(res: Response, result: unknown): void {
    if (result && typeof result === "object" && "success" in result) {
      res.json(result);
      return;
    }
    res.json(ApiResponseFactory.successData(result));
  }

  /**
   * Centralized error handling hook.
   */
  protected handleError(err: unknown, next: NextFunction): void {
    next(err);
  }

  /**
   * The Template Method managing the HTTP request lifecycle.
   */
  public async handleRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.validateRequest(req);
      const result = await this.execute(req, res);
      
      // If the controller didn't send the response headers, apply default formatting
      if (!res.headersSent && result !== undefined) {
        this.formatResponse(res, result);
      }
    } catch (err) {
      this.handleError(err, next);
    }
  }
}
