import type { PrismaClient } from "@prisma/client";
import type { ICategoryRepository } from "../interfaces/ICategoryRepository";

export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listActive() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
    });
  }

  create(data: { name: string; slug?: string; description?: string | null }) {
    const { name, slug, description } = data;
    return this.prisma.category.create({
      data: {
        name,
        slug: slug ?? name.toLowerCase().replace(/\s+/g, "-"),
        description,
      },
    });
  }
}
