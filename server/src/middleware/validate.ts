import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { AppErrorFactory } from "../factories/AppErrorFactory";

export function validate(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }
    const msg = errors.array().map((e) => (e as { msg: string }).msg).join("; ");
    next(AppErrorFactory.validation(msg));
  };
}
