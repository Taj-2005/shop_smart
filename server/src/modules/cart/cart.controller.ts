import { Response } from "express";
import type { AuthRequest } from "../../middleware/authenticate";
import { AppErrorFactory } from "../../factories/AppErrorFactory";
import type { CartService } from "./cart.service";
import { BaseController } from "../../base/BaseController";

class GetCartController extends BaseController {
  constructor(private cartService: CartService) { super(); }
  protected async execute(req: AuthRequest) {
    return await this.cartService.getForUser(req.user!.id);
  }
}

class PostCartController extends BaseController {
  constructor(private cartService: CartService) { super(); }
  protected async execute(req: AuthRequest, res: Response) {
    const { productId, quantity = 1 } = req.body;
    if (!productId) throw AppErrorFactory.validation("productId required");
    const updated = await this.cartService.addItem(req.user!.id, productId, quantity);
    res.status(201);
    return updated;
  }
}

class PatchCartItemController extends BaseController {
  constructor(private cartService: CartService) { super(); }
  protected async execute(req: AuthRequest) {
    const { quantity } = req.body;
    return await this.cartService.patchItem(req.user!.id, req.params.id, quantity);
  }
}

class DeleteCartItemController extends BaseController {
  constructor(private cartService: CartService) { super(); }
  protected async execute(req: AuthRequest) {
    await this.cartService.removeItem(req.user!.id, req.params.id);
    return { success: true, message: "Item removed" };
  }
}

export function createCartController(cartService: CartService) {
  return {
    get: new GetCartController(cartService).handleRequest.bind(new GetCartController(cartService)),
    post: new PostCartController(cartService).handleRequest.bind(new PostCartController(cartService)),
    patchItem: new PatchCartItemController(cartService).handleRequest.bind(new PatchCartItemController(cartService)),
    deleteItem: new DeleteCartItemController(cartService).handleRequest.bind(new DeleteCartItemController(cartService)),
  };
}
