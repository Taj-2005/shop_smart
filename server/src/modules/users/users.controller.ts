
import type { AuthRequest } from "../../middleware/authenticate";
import { container } from "../../container";
import { BaseController } from "../../base/BaseController";

class ListUsersController extends BaseController {
  protected async execute() {
    return await container.usersService.listForAdmin();
  }
}
export const list = new ListUsersController().handleRequest.bind(new ListUsersController());

class GetUserByIdController extends BaseController {
  protected async execute(req: AuthRequest) {
    return await container.usersService.getById(req.params.id);
  }
}
export const getById = new GetUserByIdController().handleRequest.bind(new GetUserByIdController());

class UpdateUserController extends BaseController {
  protected async execute(req: AuthRequest) {
    const { fullName, avatarUrl } = req.body;
    return await container.usersService.updateProfile(req.params.id, { fullName, avatarUrl });
  }
}
export const update = new UpdateUserController().handleRequest.bind(new UpdateUserController());

class RemoveUserController extends BaseController {
  protected async execute(req: AuthRequest) {
    await container.usersService.softDelete(req.params.id);
    return { success: true, message: "User deleted" };
  }
}
export const remove = new RemoveUserController().handleRequest.bind(new RemoveUserController());

class ListUserOrdersController extends BaseController {
  protected async execute(req: AuthRequest) {
    return await container.usersService.listOrdersForUser(req.params.id);
  }
}
export const listOrders = new ListUserOrdersController().handleRequest.bind(new ListUserOrdersController());

class GetUserCartController extends BaseController {
  protected async execute(req: AuthRequest) {
    const data = await container.usersService.getCartForUser(req.params.id);
    return data || null;
  }
}
export const getCart = new GetUserCartController().handleRequest.bind(new GetUserCartController());
