import type { PrismaClient } from "@prisma/client";
import type { IReviewRepository } from "../interfaces/IReviewRepository";

export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findProductNotDeleted(productId: string) {
    return this.prisma.product.findFirst({ where: { id: productId, deletedAt: null }, select: { id: true } });
  }

  createReview(data: { userId: string; productId: string; rating: number; body: string | null }) {
    return this.prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        body: data.body,
      },
      include: { user: { select: { id: true, fullName: true } } },
    });
  }

  async deleteReview(id: string) {
    await this.prisma.review.delete({ where: { id } });
  }

  updateReviewStatus(id: string, status: string) {
    return this.prisma.review.update({
      where: { id },
      data: { status },
      include: { user: { select: { id: true, fullName: true } }, product: { select: { id: true, name: true } } },
    });
  }
}
