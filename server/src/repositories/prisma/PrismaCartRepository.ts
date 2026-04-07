import { ICartRepository, ICart } from '../interfaces/ICartRepository';
import { prisma } from '../../config/prisma';

export class PrismaCartRepository implements ICartRepository {
  async findById(id: string): Promise<ICart | null> {
    const cart = await prisma.cart.findUnique({ where: { id } });
    if (!cart) return null;
    return cart as unknown as ICart;
  }

  async findByUserId(userId: string): Promise<ICart | null> {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return null;
    return cart as unknown as ICart;
  }

  async create(data: Record<string, unknown>): Promise<ICart> {
    const cart = await prisma.cart.create({ data: data as never });
    return cart as unknown as ICart;
  }

  async update(id: string, data: Record<string, unknown>): Promise<ICart | null> {
    const cart = await prisma.cart.update({
      where: { id },
      data: data as never,
    });
    return cart as unknown as ICart;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.cart.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
