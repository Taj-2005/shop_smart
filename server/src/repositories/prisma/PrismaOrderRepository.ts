import { IOrderRepository, IOrder } from '../interfaces/IOrderRepository';
import { prisma } from '../../config/prisma';

export class PrismaOrderRepository implements IOrderRepository {
  async findById(id: string): Promise<IOrder | null> {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return null;
    return order as unknown as IOrder;
  }

  async create(data: Record<string, unknown>): Promise<IOrder> {
    const order = await prisma.order.create({ data: data as never });
    return order as unknown as IOrder;
  }

  async update(id: string, data: Record<string, unknown>): Promise<IOrder | null> {
    const order = await prisma.order.update({
      where: { id },
      data: data as never,
    });
    return order as unknown as IOrder;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.order.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findByUserId(userId: string): Promise<IOrder[]> {
    const orders = await prisma.order.findMany({ where: { userId } });
    return orders as unknown as IOrder[];
  }
}
