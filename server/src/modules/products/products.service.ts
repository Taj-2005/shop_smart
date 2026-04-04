import { prisma } from "../../config/prisma";

export class ProductService {
  async listActive() {
    const products = await prisma.product.findMany({
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

  async listReviews(productId: string) {
    return prisma.review.findMany({
      where: { productId, status: "approved" },
      include: { user: { select: { id: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getById(id: string) {
    const product = await prisma.product.findFirst({
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

  async getAnalytics(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, slug: true },
    });
    if (!product) return null;
    const [orderItems, reviews] = await Promise.all([
      prisma.orderItem.aggregate({ where: { productId: product.id }, _sum: { quantity: true }, _count: true }),
      prisma.review.aggregate({ where: { productId: product.id }, _avg: { rating: true }, _count: true }),
    ]);
    return {
      ...product,
      unitsSold: orderItems._sum.quantity ?? 0,
      orderCount: orderItems._count,
      avgRating: reviews._avg.rating ? Number(reviews._avg.rating) : null,
      reviewCount: reviews._count,
    };
  }

  async create(body: {
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
  }) {
    return prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug ?? body.name.toLowerCase().replace(/\s+/g, "-"),
        description: body.description,
        price: body.price,
        originalPrice: body.originalPrice,
        image: body.image ?? "",
        categoryId: body.categoryId,
        inStock: body.inStock ?? true,
        stockQty: body.stockQty ?? 0,
        active: body.active ?? true,
        isNew: body.isNew ?? false,
        isDeal: body.isDeal ?? false,
      },
    });
  }

  async update(
    id: string,
    body: Partial<{
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
    }>
  ) {
    return prisma.product.update({
      where: { id },
      data: {
        ...(body.name != null && { name: body.name }),
        ...(body.slug != null && { slug: body.slug }),
        ...(body.description != null && { description: body.description }),
        ...(body.price != null && { price: body.price }),
        ...(body.originalPrice != null && { originalPrice: body.originalPrice }),
        ...(body.image != null && { image: body.image }),
        ...(body.categoryId != null && { categoryId: body.categoryId }),
        ...(body.inStock != null && { inStock: body.inStock }),
        ...(body.stockQty != null && { stockQty: body.stockQty }),
        ...(body.active != null && { active: body.active }),
        ...(body.isNew != null && { isNew: body.isNew }),
        ...(body.isDeal != null && { isDeal: body.isDeal }),
      },
    });
  }

  async softDelete(id: string) {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const productService = new ProductService();
