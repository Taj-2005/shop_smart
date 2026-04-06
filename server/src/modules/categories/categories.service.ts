import type { ICategoryRepository } from "../../interfaces/ICategoryRepository";

export class CategoriesService {
  constructor(private readonly categories: ICategoryRepository) {}

  list() {
    return this.categories.listActive();
  }

  create(body: { name: string; slug?: string; description?: string | null }) {
    return this.categories.create(body);
  }
}
