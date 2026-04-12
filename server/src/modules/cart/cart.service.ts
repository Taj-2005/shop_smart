import { Prisma } from "@prisma/client";
import { AppErrorFactory } from "../../factories/AppErrorFactory";
import type { ICartRepository } from "../../interfaces/ICartRepository";

export class CartService {
  constructor(private readonly cart: ICartRepository) {}

  /** JSON-safe cart payload (Prisma Decimals and raw rows normalized). */
  private toClientCart(raw: unknown | null): { id: string | null; items: unknown[] } {
    if (!raw) return { id: null, items: [] };
    const cart = raw as {
      id: string;
      items: Array<Record<string, unknown> & { product: Record<string, unknown> | null }>;
    };
    return {
      id: cart.id,
      items: cart.items.map((i) => {
        const p = i.product;
        return {
          ...i,
          product: p
            ? {
                ...p,
                price: Number(p.price),
                originalPrice:
                  p.originalPrice != null && p.originalPrice !== undefined
                    ? Number(p.originalPrice as number | string)
                    : null,
              }
            : null,
        };
      }),
    };
  }

  async getForUser(userId: string) {
    const raw = await this.cart.findCartWithItems(userId);
    return this.toClientCart(raw);
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const cart = await this.cart.ensureCart(userId);
    try {
      await this.cart.upsertItem(cart.id, productId, quantity);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        throw AppErrorFactory.validation("Unknown product");
      }
      throw err;
    }
    const raw = await this.cart.findCartWithItemsById(cart.id);
    return this.toClientCart(raw);
  }

  async patchItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.cart.findCartByUserId(userId);
    if (!cart) throw AppErrorFactory.notFound("Cart not found");
    const item = await this.cart.findItemInCart(cart.id, itemId);
    if (!item) throw AppErrorFactory.notFound("Cart item not found");
    if (quantity <= 0) {
      await this.cart.deleteItem(item.id);
      return { removed: true };
    }
    return this.cart.updateItemQuantity(item.id, quantity);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.cart.findCartByUserId(userId);
    if (!cart) throw AppErrorFactory.notFound("Cart not found");
    const item = await this.cart.findItemInCart(cart.id, itemId);
    if (!item) throw AppErrorFactory.notFound("Cart item not found");
    await this.cart.deleteItem(item.id);
  }
}
