import { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/authenticate";
import { ApiResponseFactory } from "../../factories/ApiResponseFactory";
import { container } from "../../container";

export async function list(_req: unknown, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.usersService.listForAdmin();
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.usersService.getById(req.params.id);
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fullName, avatarUrl } = req.body;
    const data = await container.usersService.updateProfile(req.params.id, { fullName, avatarUrl });
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await container.usersService.softDelete(req.params.id);
    res.json(ApiResponseFactory.successMessage("User deleted"));
  } catch (e) {
    next(e);
  }
}

export async function listOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.usersService.listOrdersForUser(req.params.id);
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}

export async function getCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await container.usersService.getCartForUser(req.params.id);
    if (!data) {
      res.json(ApiResponseFactory.successData(null));
      return;
    }
    res.json(ApiResponseFactory.successData(data));
  } catch (e) {
    next(e);
  }
}
