import { IReviewRepository, IReview } from '../interfaces/IReviewRepository';
import { prisma } from '../../config/prisma';

export class PrismaReviewRepository implements IReviewRepository {
  async findById(id: string): Promise<IReview | null> {
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return null;
    return review as unknown as IReview;
  }

  async findByProductId(productId: string): Promise<IReview[]> {
    const reviews = await prisma.review.findMany({ where: { productId } });
    return reviews as unknown as IReview[];
  }

  async create(data: Record<string, unknown>): Promise<IReview> {
    const review = await prisma.review.create({ data: data as never });
    return review as unknown as IReview;
  }

  async update(id: string, data: Record<string, unknown>): Promise<IReview | null> {
    const review = await prisma.review.update({
      where: { id },
      data: data as never,
    });
    return review as unknown as IReview;
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.review.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
