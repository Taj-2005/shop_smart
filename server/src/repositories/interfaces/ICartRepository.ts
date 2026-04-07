export interface ICart {
  id: string;
  userId: string;
  [key: string]: unknown;
}

export interface ICartRepository {
  findById(id: string): Promise<ICart | null>;
  findByUserId(userId: string): Promise<ICart | null>;
  create(data: Record<string, unknown>): Promise<ICart>;
  update(id: string, data: Record<string, unknown>): Promise<ICart | null>;
  delete(id: string): Promise<boolean>;
}
