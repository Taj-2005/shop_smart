import { AppErrorFactory } from "../../factories/AppErrorFactory";
import type { ICartRepository } from "../../interfaces/ICartRepository";
import type { IProductRepository } from "../../interfaces/IProductRepository";

/** Bundled/serverless builds can break `instanceof PrismaClientKnownRequestError`; use structural check. */
function isPrismaForeignKeyError(err: unknown): boolean {
  if (err === null || typeof err !== "object") return false;
  const o = err as { code?: string };
  return o.code === "P2003";
}

export class CartService {
  constructor(
    private readonly cart: ICartRepository,
    private readonly products: IProductRepository
  ) {}

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
    const product = await this.products.findById(productId);
    if (!product) {
      throw AppErrorFactory.validation("Unknown product");
    }
    const row = product as { active?: boolean };
    if (row.active === false) {
      throw AppErrorFactory.validation("Product is not available");
    }

    const cart = await this.cart.ensureCart(userId);
    try {
      await this.cart.upsertItem(cart.id, productId, quantity);
    } catch (err) {
      if (isPrismaForeignKeyError(err)) {
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
