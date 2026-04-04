import { Response, NextFunction } from "express";
import type { AuthRequest } from "../../middleware/authenticate";
import { ApiResponseFactory } from "../../factories/ApiResponseFactory";
import { AppErrorFactory } from "../../factories/AppErrorFactory";
import type { CartService } from "./cart.service";

export function createCartController(cartService: CartService) {
  return {
    async get(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const data = await cartService.getForUser(req.user!.id);
        res.json(ApiResponseFactory.successData(data));
      } catch (e) {
        next(e);
      }
    },

    async post(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const { productId, quantity = 1 } = req.body;
        if (!productId) return next(AppErrorFactory.validation("productId required"));
        const updated = await cartService.addItem(req.user!.id, productId, quantity);
        res.status(201).json(ApiResponseFactory.successData(updated));
      } catch (e) {
        next(e);
      }
    },

    async patchItem(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        const { quantity } = req.body;
        const data = await cartService.patchItem(req.user!.id, req.params.id, quantity);
        res.json(ApiResponseFactory.successData(data));
      } catch (e) {
        next(e);
      }
    },

    async deleteItem(req: AuthRequest, res: Response, next: NextFunction) {
      try {
        await cartService.removeItem(req.user!.id, req.params.id);
        res.json(ApiResponseFactory.successMessage("Item removed"));
      } catch (e) {
        next(e);
      }
    },
  };
}
