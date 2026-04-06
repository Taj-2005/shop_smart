import type { PrismaClient } from "@prisma/client";
import type { ICartRepository } from "../interfaces/ICartRepository";

export class PrismaCartRepository implements ICartRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findCartWithItems(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  async ensureCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await this.prisma.cart.create({ data: { userId } });
    return { id: cart.id };
  }

  async upsertItem(cartId: string, productId: string, quantity: number) {
    await this.prisma.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      create: { cartId, productId, quantity },
      update: { quantity },
    });
  }

  findCartWithItemsById(cartId: string) {
    return this.prisma.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: true } } } });
  }

  findCartByUserId(userId: string) {
    return this.prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  }

  findItemInCart(cartId: string, itemId: string) {
    return this.prisma.cartItem.findFirst({ where: { id: itemId, cartId }, select: { id: true } });
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  updateItemQuantity(itemId: string, quantity: number) {
    return this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  }
}
