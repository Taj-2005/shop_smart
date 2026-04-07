import { IProductRepository, IProduct } from '../interfaces/IProductRepository';
import { prisma } from '../../config/prisma';

export class PrismaProductRepository implements IProductRepository {
  async findById(id: string): Promise<IProduct | null> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    return product as unknown as IProduct;
  }

  async create(data: Record<string, unknown>): Promise<IProduct> {
    const product = await prisma.product.create({ data: data as never });
    return product as unknown as IProduct;
  }

  async update(id: string, data: Record<string, unknown>): Promise<IProduct | null> {
    const product = await prisma.product.update({
      where: { id },
      data: data as never,
    });
    return product as unknown as IProduct;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findMany(filters?: Record<string, unknown>): Promise<IProduct[]> {
    const products = await prisma.product.findMany({ where: (filters || {}) as never });
    return products as unknown as IProduct[];
  }
}
