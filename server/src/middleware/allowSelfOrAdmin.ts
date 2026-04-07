import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate";
import { AppErrorFactory } from "../factories/AppErrorFactory";
import { ADMIN_ROLES } from "../constants/roles";

/**
 * Allow access if the request is for the current user's own resource (param matches req.user.id)
 * or if the user has Admin/Super Admin role. Use for routes like GET/PATCH/DELETE /users/:id.
 * Role validation only — no scattered checks in controllers.
 */
export function allowSelfOrAdmin(paramName = "id") {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppErrorFactory.unauthorized("Authentication required"));
      return;
    }
    const resourceId = req.params[paramName];
    if (!resourceId) {
      next(AppErrorFactory.validation("Missing resource id"));
      return;
    }
    const isOwn = resourceId === req.user.id;
    const isAdmin = ADMIN_ROLES.includes(req.user.roleType as (typeof ADMIN_ROLES)[number]);
    if (isOwn || isAdmin) {
      next();
      return;
    }
    next(AppErrorFactory.unauthorized("Forbidden", { statusCode: 403, code: "FORBIDDEN" }));
  };
}
