"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/container";
import { FiltersSidebar, type ShopFilters } from "@/components/shop/filters-sidebar";
import { SortBar, type SortOption } from "@/components/shop/sort-bar";
import { ProductGrid } from "@/components/shop/product-grid";
import { productApi } from "@/api/product.api";
import { apiProductToShopProduct } from "@/lib/api-product-mapper";
import { setApiCatalog } from "@/data/catalog-resolver";
import type { Product } from "@/data/products";

function getDefaultFilters(searchParams: ReturnType<typeof useSearchParams>): ShopFilters {
  const cat = searchParams.get("cat") ?? "all";
  const category =
    cat === "electronics"
      ? "Electronics"
      : cat === "fashion"
        ? "Fashion"
        : cat === "home"
          ? "Home"
          : cat === "sports"
            ? "Sports"
            : "all";
  return {
    category,
    priceRange: "any",
    rating: "any",
    inStockOnly: false,
  };
}

function useFilteredAndSortedProducts(
  source: Product[],
  filters: ShopFilters,
  sortBy: SortOption,
  dealOnly: boolean
) {
  return useMemo(() => {
    let list: Product[] = [...source];

    if (dealOnly) {
      list = list.filter((p) => p.isDeal);
    }

    if (filters.category !== "all") {
      list = list.filter((p) => p.category === filters.category);
    }

    if (filters.priceRange !== "any") {
      if (filters.priceRange === "under-2000") list = list.filter((p) => p.price < 2000);
      else if (filters.priceRange === "2000-10000")
        list = list.filter((p) => p.price >= 2000 && p.price <= 10000);
      else if (filters.priceRange === "above-10000") list = list.filter((p) => p.price > 10000);
    }

    if (filters.rating !== "any") {
      const min = parseFloat(filters.rating);
      list = list.filter((p) => p.rating >= min);
    }

    if (filters.inStockOnly) {
      list = list.filter((p) => p.inStock);
    }

    if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "newest")
      list.sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      );

    return list;
  }, [source, filters, sortBy, dealOnly]);
}

function ShopContent() {
  const searchParams = useSearchParams();
  const dealOnly = searchParams.get("deal") === "1";

  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [filters, setFilters] = useState<ShopFilters>(() =>
    getDefaultFilters(searchParams)
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setFilters(getDefaultFilters(searchParams));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setCatalogLoading(true);
    setCatalogError(null);
    productApi
      .list()
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          const mapped = res.data.filter((p) => p.active).map(apiProductToShopProduct);
          setCatalog(mapped);
          setApiCatalog(mapped);
        } else {
          setCatalogError("Could not load products.");
        }
      })
      .catch(() => {
        if (!cancelled) setCatalogError("Could not load products.");
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const products = useFilteredAndSortedProducts(catalog, filters, sortBy, dealOnly);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-muted min-h-screen"
    >
      <Container as="div" className="py-8 lg:py-12">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {dealOnly ? "Deals & offers" : "Shop"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {dealOnly
              ? "Limited-time savings on quality products."
              : "Discover quality products across categories."}
          </p>
        </div>

        {catalogError && (
          <div
            className="mb-6 rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error)]/10 p-4 text-[var(--color-error)]"
            role="alert"
          >
            {catalogError}
          </div>
        )}

        <div className="flex gap-8">
          <FiltersSidebar filters={filters} onFiltersChange={setFilters} />
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 lg:mb-0">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen((v) => !v)}
                className="lg:hidden inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-surface px-4 py-2 text-sm font-medium text-primary hover:bg-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
                aria-expanded={mobileFiltersOpen}
                aria-controls="mobile-filters"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filters
              </button>
              <div className="flex-1 min-w-0">
                <SortBar count={products.length} sortBy={sortBy} onSortChange={setSortBy} />
              </div>
            </div>
            {mobileFiltersOpen && (
              <div id="mobile-filters" className="mb-6 lg:hidden">
                <FiltersSidebar filters={filters} onFiltersChange={setFilters} inline />
              </div>
            )}
            <div className="mt-6">
              {catalogLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"
                    aria-hidden
                  />
                </div>
              ) : (
                <ProductGrid products={products} />
              )}
            </div>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-muted min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
