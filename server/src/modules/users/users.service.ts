import { AppError } from "../../middleware/errorHandler";
import type { IUserReader } from "../../interfaces/IUserReader";
import type { IUserWriter } from "../../interfaces/IUserWriter";

export class UsersService {
  constructor(
    private readonly readers: IUserReader,
    private readonly writers: IUserWriter
  ) {}

  async listForAdmin() {
    return this.readers.listUsersForAdmin(50);
  }

  async getById(id: string) {
    const user = await this.readers.findUserProfileById(id);
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");
    return user;
  }

  async updateProfile(id: string, body: { fullName?: string; avatarUrl?: string | null }) {
    return this.writers.updateProfile(id, body);
  }

  async softDelete(id: string) {
    await this.writers.softDelete(id);
  }

  async listOrdersForUser(userId: string) {
    const orders = await this.readers.findOrdersByUserId(userId, 50);
    return orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      shipping: Number(o.shipping),
      total: Number(o.total),
    }));
  }

  async getCartForUser(userId: string) {
    const cart = await this.readers.findCartWithItemsByUserId(userId);
    if (!cart) return null;
    return {
      ...cart,
      items: cart.items.map((i) => ({
        ...i,
        product: i.product ? { ...i.product, price: Number(i.product.price) } : null,
      })),
    };
  }
}
