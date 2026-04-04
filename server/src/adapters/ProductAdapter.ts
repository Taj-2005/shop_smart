export interface ProductInput {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: unknown; // Decimal
  originalPrice: unknown | null; // Decimal
  image: string;
  images: unknown; // Json
  categoryId: string;
  inStock: boolean;
  stockQty: number;
  active: boolean;
  isNew: boolean;
  isDeal: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  [key: string]: unknown;
}

export class ProductAdapter {
  /**
   * Converts a raw product model from the database into a clean DTO for API responses.
   * Converts Decimal fields to numbers.
   * Formats dates to ISO strings.
   *
   * @param product - Raw product model
   * @returns Clean product DTO
   */
  static toDTO(product: ProductInput) {
    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      // Safely convert decimal to number
      price: product.price ? Number(product.price) : 0,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      image: product.image,
      images: product.images,
      categoryId: product.categoryId,
      inStock: product.inStock,
      stockQty: product.stockQty,
      active: product.active,
      isNew: product.isNew,
      isDeal: product.isDeal,
      createdAt: product.createdAt ? product.createdAt.toISOString() : null,
      updatedAt: product.updatedAt ? product.updatedAt.toISOString() : null,
      deletedAt: product.deletedAt ? product.deletedAt.toISOString() : null,
    };
  }
}

/*
Example Usage:

import { ProductAdapter } from './adapters/ProductAdapter';

const rawProduct = await prisma.product.findUnique({ where: { id: "123" } });
const productDTO = ProductAdapter.toDTO(rawProduct);

// productDTO.price is now a plain JS number instead of a Prisma Decimal object.
// productDTO.createdAt is an ISO string.
res.json({ success: true, data: productDTO });
*/
