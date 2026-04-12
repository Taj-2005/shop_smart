import type { Product } from "./products";
import { getProductById } from "./products";

let apiCatalog: Product[] = [];

/** Called when /shop loads API products so cart/wishlist can resolve UUID ids. */
export function setApiCatalog(products: Product[]) {
  apiCatalog = products;
}

export function resolveShopProduct(id: string): Product | undefined {
  return getProductById(id) ?? apiCatalog.find((p) => p.id === id);
}
