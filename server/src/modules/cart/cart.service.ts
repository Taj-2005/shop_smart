import { AppError } from "../../middleware/errorHandler";
import type { ICartRepository } from "../../interfaces/ICartRepository";

export class CartService {
  constructor(private readonly cart: ICartRepository) {}

  async getForUser(userId: string) {
    const raw = await this.cart.findCartWithItems(userId);
    if (!raw) return { id: null, items: [] as unknown[] };
    const cart = raw as { id: string; items: { product: { price: unknown } | null }[] };
    return {
      ...cart,
      items: cart.items.map((i) => ({
        ...i,
        product: i.product ? { ...i.product, price: Number(i.product.price) } : null,
      })),
    };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const cart = await this.cart.ensureCart(userId);
    await this.cart.upsertItem(cart.id, productId, quantity);
    return this.cart.findCartWithItemsById(cart.id);
  }

  async patchItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.cart.findCartByUserId(userId);
    if (!cart) throw new AppError(404, "Cart not found", "NOT_FOUND");
    const item = await this.cart.findItemInCart(cart.id, itemId);
    if (!item) throw new AppError(404, "Cart item not found", "NOT_FOUND");
    if (quantity <= 0) {
      await this.cart.deleteItem(item.id);
      return { removed: true };
    }
    return this.cart.updateItemQuantity(item.id, quantity);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.cart.findCartByUserId(userId);
    if (!cart) throw new AppError(404, "Cart not found", "NOT_FOUND");
    const item = await this.cart.findItemInCart(cart.id, itemId);
    if (!item) throw new AppError(404, "Cart item not found", "NOT_FOUND");
    await this.cart.deleteItem(item.id);
  }
}
