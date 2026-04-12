"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { productApi } from "@/api/product.api";
import { apiProductToShopProduct } from "@/lib/api-product-mapper";
import { setApiCatalog } from "@/data/catalog-resolver";
import type { Product } from "@/data/products";

type StorefrontCatalogValue = {
  /** Full active catalog (same source as /shop). */
  products: Product[];
  loading: boolean;
  error: boolean;
  getDeals: (limit: number) => Product[];
  getTrending: (limit: number) => Product[];
  getNewArrivals: (limit: number) => Product[];
};

const StorefrontCatalogContext = createContext<StorefrontCatalogValue | null>(null);

export function StorefrontCatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(false);
      productApi
        .list()
        .then((res) => {
          if (cancelled) return;
          if (res.success && res.data) {
            const mapped = res.data.filter((p) => p.active).map(apiProductToShopProduct);
            startTransition(() => {
              setProducts(mapped);
              setApiCatalog(mapped);
            });
          } else {
            setError(true);
          }
        })
        .catch(() => {
          if (!cancelled) setError(true);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const getDeals = useCallback(
    (limit: number) =>
      [...products].filter((p) => p.isDeal && p.inStock).slice(0, limit),
    [products]
  );

  const getTrending = useCallback(
    (limit: number) =>
      [...products]
        .filter((p) => p.inStock)
        .sort((a, b) => {
          const sb = b.rating * b.reviewCount;
          const sa = a.rating * a.reviewCount;
          if (sb !== sa) return sb - sa;
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        })
        .slice(0, limit),
    [products]
  );

  const getNewArrivals = useCallback(
    (limit: number) =>
      [...products]
        .filter((p) => p.isNew && p.inStock)
        .sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
        )
        .slice(0, limit),
    [products]
  );

  const value = useMemo<StorefrontCatalogValue>(
    () => ({
      products,
      loading,
      error,
      getDeals,
      getTrending,
      getNewArrivals,
    }),
    [products, loading, error, getDeals, getTrending, getNewArrivals]
  );

  return (
    <StorefrontCatalogContext.Provider value={value}>
      {children}
    </StorefrontCatalogContext.Provider>
  );
}

export function useStorefrontCatalog(): StorefrontCatalogValue {
  const ctx = useContext(StorefrontCatalogContext);
  if (!ctx) {
    throw new Error("useStorefrontCatalog must be used within StorefrontCatalogProvider");
  }
  return ctx;
}
