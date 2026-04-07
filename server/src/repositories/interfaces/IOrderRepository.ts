export interface IOrder {
  id: string;
  userId: string;
  status: string;
  total: unknown;
  [key: string]: unknown;
}

export interface IOrderRepository {
  findById(id: string): Promise<IOrder | null>;
  create(data: Record<string, unknown>): Promise<IOrder>;
  update(id: string, data: Record<string, unknown>): Promise<IOrder | null>;
  delete(id: string): Promise<boolean>;
  findByUserId(userId: string): Promise<IOrder[]>;
}
