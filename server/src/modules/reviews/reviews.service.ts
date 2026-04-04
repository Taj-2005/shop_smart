import { AppErrorFactory } from "../../factories/AppErrorFactory";
import { EventBus } from "../../events/EventBus";
import type { IReviewRepository } from "../../interfaces/IReviewRepository";

export class ReviewsService {
  constructor(private readonly reviews: IReviewRepository) {}

  async create(userId: string, body: { productId: string; rating: number; body?: string | null }) {
    const { productId, rating, body: text } = body;
    if (!productId || rating == null) throw AppErrorFactory.validation("productId and rating required");
    if (rating < 1 || rating > 5) throw AppErrorFactory.validation("rating must be 1-5");
    const product = await this.reviews.findProductNotDeleted(productId);
    if (!product) throw AppErrorFactory.notFound("Product not found");
    const review = (await this.reviews.createReview({
      userId,
      productId,
      rating,
      body: text || null,
    })) as { id: string; userId: string; productId: string; rating: number };
    EventBus.emit("ReviewSubmitted", {
      reviewId: review.id,
      userId: review.userId,
      productId: review.productId,
      rating: review.rating,
    });
    return review;
  }

  async deleteReview(id: string) {
    await this.reviews.deleteReview(id);
  }

  async setStatus(id: string, status: string | undefined) {
    const allowed = ["pending", "approved", "rejected", "flagged"];
    if (!status || !allowed.includes(status)) {
      throw AppErrorFactory.validation("status must be one of: " + allowed.join(", "));
    }
    return this.reviews.updateReviewStatus(id, status);
  }
}
