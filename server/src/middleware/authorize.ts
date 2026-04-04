import { Response, NextFunction } from "express";
import { AuthRequest } from "./authenticate";
import { AppErrorFactory } from "../factories/AppErrorFactory";
import { type RoleType, ADMIN_ROLES, SUPER_ADMIN_ONLY } from "../constants/roles";

export function authorize(...allowedRoles: RoleType[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppErrorFactory.unauthorized("Authentication required"));
      return;
    }
    if (!allowedRoles.includes(req.user.roleType as RoleType)) {
      next(AppErrorFactory.unauthorized("Forbidden", { statusCode: 403, code: "FORBIDDEN" }));
      return;
    }
    next();
  };
}

/** Store Admin or Super Admin — manage products, orders, customers, reports. */
export const requireAdmin = authorize(...ADMIN_ROLES);

/** System Owner only — create/delete admins, system config, RBAC. */
export const requireSuperAdmin = authorize(...SUPER_ADMIN_ONLY);
