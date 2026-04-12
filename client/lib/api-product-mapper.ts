import type { ApiProduct } from "@/api/product.api";
import type { Product } from "@/data/products";

const SLUG_TO_CATEGORY: Record<string, Product["category"]> = {
  electronics: "Electronics",
  fashion: "Fashion",
  home: "Home",
  sports: "Sports",
};

export function apiProductToShopProduct(p: ApiProduct): Product {
  const slug = p.category?.slug ?? "electronics";
  const category = SLUG_TO_CATEGORY[slug] ?? "Electronics";
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? undefined,
    image: p.image,
    alt: p.name,
    category,
    rating: 4.5,
    reviewCount: 0,
    inStock: p.inStock,
    isNew: p.isNew,
    isDeal: p.isDeal,
    createdAt: p.createdAt,
  };
}
