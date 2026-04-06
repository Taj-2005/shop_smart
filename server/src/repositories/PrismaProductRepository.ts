import type { PrismaClient } from "@prisma/client";
import type { IProductRepository } from "../interfaces/IProductRepository";

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listActive() {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null, active: true },
      include: { category: true },
      take: 100,
    });
    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
      subtotal: null,
      total: null,
    }));
  }

  listApprovedReviews(productId: string) {
    return this.prisma.review.findMany({
      where: { productId, status: "approved" },
      include: { user: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
    if (!product) return null;
    return {
      ...product,
      price: Number(product.price),
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
    };
  }

  async getAnalyticsSnapshot(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, slug: true },
    });
    if (!product) return null;
    const [orderItems, reviews] = await Promise.all([
      this.prisma.orderItem.aggregate({ where: { productId: product.id }, _sum: { quantity: true }, _count: true }),
      this.prisma.review.aggregate({ where: { productId: product.id }, _avg: { rating: true }, _count: true }),
    ]);
    return {
      ...product,
      unitsSold: orderItems._sum.quantity ?? 0,
      orderCount: orderItems._count,
      avgRating: reviews._avg.rating ? Number(reviews._avg.rating) : null,
      reviewCount: reviews._count,
    };
  }

  create(body: Record<string, unknown>) {
    const b = body as {
      name: string;
      slug?: string;
      description?: string | null;
      price: number | string;
      originalPrice?: number | string | null;
      image?: string;
      categoryId: string;
      inStock?: boolean;
      stockQty?: number;
      active?: boolean;
      isNew?: boolean;
      isDeal?: boolean;
    };
    return this.prisma.product.create({
      data: {
        name: b.name,
        slug: b.slug ?? b.name.toLowerCase().replace(/\s+/g, "-"),
        description: b.description,
        price: b.price,
        originalPrice: b.originalPrice,
        image: b.image ?? "",
        categoryId: b.categoryId,
        inStock: b.inStock ?? true,
        stockQty: b.stockQty ?? 0,
        active: b.active ?? true,
        isNew: b.isNew ?? false,
        isDeal: b.isDeal ?? false,
      },
    });
  }

  update(id: string, body: Record<string, unknown>) {
    const b = body as Partial<{
      name: string;
      slug: string;
      description: string | null;
      price: number | string;
      originalPrice: number | string | null;
      image: string;
      categoryId: string;
      inStock: boolean;
      stockQty: number;
      active: boolean;
      isNew: boolean;
      isDeal: boolean;
    }>;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(b.name != null && { name: b.name }),
        ...(b.slug != null && { slug: b.slug }),
        ...(b.description != null && { description: b.description }),
        ...(b.price != null && { price: b.price }),
        ...(b.originalPrice != null && { originalPrice: b.originalPrice }),
        ...(b.image != null && { image: b.image }),
        ...(b.categoryId != null && { categoryId: b.categoryId }),
        ...(b.inStock != null && { inStock: b.inStock }),
        ...(b.stockQty != null && { stockQty: b.stockQty }),
        ...(b.active != null && { active: b.active }),
        ...(b.isNew != null && { isNew: b.isNew }),
        ...(b.isDeal != null && { isDeal: b.isDeal }),
      },
    });
  }

  async softDelete(id: string) {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
