export interface IProduct {
  id: string;
  name: string;
  price: unknown;
  categoryId: string;
  [key: string]: unknown;
}

export interface IProductRepository {
  findById(id: string): Promise<IProduct | null>;
  create(data: Record<string, unknown>): Promise<IProduct>;
  update(id: string, data: Record<string, unknown>): Promise<IProduct | null>;
  delete(id: string): Promise<boolean>;
  findMany(filters?: Record<string, unknown>): Promise<IProduct[]>;
}
