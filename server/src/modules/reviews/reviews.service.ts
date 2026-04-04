import { AppError } from "../../middleware/errorHandler";
import { EventBus } from "../../events/EventBus";
import type { IReviewRepository } from "../../interfaces/IReviewRepository";

export class ReviewsService {
  constructor(private readonly reviews: IReviewRepository) {}

  async create(userId: string, body: { productId: string; rating: number; body?: string | null }) {
    const { productId, rating, body: text } = body;
    if (!productId || rating == null) throw new AppError(400, "productId and rating required", "VALIDATION_ERROR");
    if (rating < 1 || rating > 5) throw new AppError(400, "rating must be 1-5", "VALIDATION_ERROR");
    const product = await this.reviews.findProductNotDeleted(productId);
    if (!product) throw new AppError(404, "Product not found", "NOT_FOUND");
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
      throw new AppError(400, "status must be one of: " + allowed.join(", "), "VALIDATION_ERROR");
    }
    return this.reviews.updateReviewStatus(id, status);
  }
}
