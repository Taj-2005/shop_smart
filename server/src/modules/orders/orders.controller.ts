import { Response } from "express";
import { OrderStatus } from "@prisma/client";
import { AuthRequest } from "../../middleware/authenticate";
import { AppErrorFactory } from "../../factories/AppErrorFactory";
import { container } from "../../container";
import { BaseController } from "../../base/BaseController";

class CreateOrderController extends BaseController {
  protected async execute(req: AuthRequest, res: Response) {
    const userId = req.user!.id;
    const data = await container.orderService.create(userId, req.body);
    res.status(201);
    return data;
  }
}
export const create = new CreateOrderController().handleRequest.bind(new CreateOrderController());

class ListOrdersController extends BaseController {
  protected async execute(req: AuthRequest) {
    return await container.orderService.listForUser(req.user!.id);
  }
}
export const list = new ListOrdersController().handleRequest.bind(new ListOrdersController());

class GetOrderByIdController extends BaseController {
  protected async execute(req: AuthRequest) {
    const isAdmin = req.user?.roleType === "ADMIN" || req.user?.roleType === "SUPER_ADMIN";
    const data = await container.orderService.getById(req.params.id, { userId: req.user!.id, isAdmin });
    if (!data) throw AppErrorFactory.notFound("Order not found");
    return data;
  }
}
export const getById = new GetOrderByIdController().handleRequest.bind(new GetOrderByIdController());

class UpdateOrderStatusController extends BaseController {
  protected async execute(req: AuthRequest) {
    const { status } = req.body as { status: OrderStatus };
    return await container.orderService.updateStatus(req.params.id, status);
  }
}
export const updateStatus = new UpdateOrderStatusController().handleRequest.bind(new UpdateOrderStatusController());
