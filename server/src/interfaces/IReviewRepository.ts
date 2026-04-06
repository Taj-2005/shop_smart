export interface IReviewRepository {
  findProductNotDeleted(productId: string): Promise<{ id: string } | null>;
  createReview(data: { userId: string; productId: string; rating: number; body: string | null }): Promise<unknown>;
  deleteReview(id: string): Promise<void>;
  updateReviewStatus(
    id: string,
    status: string
  ): Promise<unknown>;
}
