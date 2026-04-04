export interface ICategoryRepository {
  listActive(): Promise<unknown[]>;
  create(data: { name: string; slug?: string; description?: string | null }): Promise<unknown>;
}
