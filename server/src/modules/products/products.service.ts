import type { IProductRepository } from "../../interfaces/IProductRepository";

export class ProductService {
  constructor(private readonly products: IProductRepository) {}

  listActive() {
    return this.products.listActive();
  }

  listReviews(productId: string) {
    return this.products.listApprovedReviews(productId);
  }

  getById(id: string) {
    return this.products.findById(id);
  }

  getAnalytics(id: string) {
    return this.products.getAnalyticsSnapshot(id);
  }

  create(body: Parameters<IProductRepository["create"]>[0]) {
    return this.products.create(body);
  }

  update(id: string, body: Parameters<IProductRepository["update"]>[1]) {
    return this.products.update(id, body);
  }

  softDelete(id: string) {
    return this.products.softDelete(id);
  }
}
