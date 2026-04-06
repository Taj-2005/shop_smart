/** Catalog / product reads & admin product writes (DIP). */
export interface IProductRepository {
  listActive(): Promise<unknown[]>;
  listApprovedReviews(productId: string): Promise<unknown[]>;
  findById(id: string): Promise<unknown | null>;
  getAnalyticsSnapshot(productId: string): Promise<{
    id: string;
    name: string;
    slug: string;
    unitsSold: number;
    orderCount: number;
    avgRating: number | null;
    reviewCount: number;
  } | null>;
  create(body: Record<string, unknown>): Promise<unknown>;
  update(id: string, body: Record<string, unknown>): Promise<unknown>;
  softDelete(id: string): Promise<void>;
}
