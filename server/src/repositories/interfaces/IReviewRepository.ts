export interface IReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  [key: string]: unknown;
}

export interface IReviewRepository {
  findById(id: string): Promise<IReview | null>;
  findByProductId(productId: string): Promise<IReview[]>;
  create(data: Record<string, unknown>): Promise<IReview>;
  update(id: string, data: Record<string, unknown>): Promise<IReview | null>;
  delete(id: string): Promise<boolean>;
}
