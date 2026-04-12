"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/product-card";
import { Container } from "@/components/layout/container";
import { useStorefrontCatalog } from "@/context/storefront-catalog-context";

function CardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 animate-pulse">
      <div className="aspect-square rounded-[var(--radius)] bg-muted" />
      <div className="mt-4 h-4 w-[75%] rounded bg-muted" />
      <div className="mt-2 h-3 w-[50%] rounded bg-muted" />
    </div>
  );
}

export function TrendingGrid() {
  const { getTrending, loading, error } = useStorefrontCatalog();
  const products = getTrending(8);

  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-surface"
      aria-labelledby="trending-heading"
    >
      <Container as="div">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Community favourites
            </p>
            <h2
              id="trending-heading"
              className="font-heading text-2xl font-bold tracking-tight text-primary sm:text-3xl lg:text-4xl"
            >
              Trending now
            </h2>
            <p className="mt-1.5 text-muted-foreground sm:max-w-sm">
              Popular picks across categories. High ratings, real reviews.
            </p>
          </div>
          <Link
            href="/shop"
            className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
          >
            Shop all →
          </Link>
        </div>
        {error ? (
          <p className="text-center text-muted-foreground">
            Products could not be loaded.{" "}
            <Link href="/shop" className="text-accent underline">
              Browse the shop
            </Link>
          </p>
        ) : loading && products.length === 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4" role="list">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i}>
                <CardSkeleton />
              </li>
            ))}
          </ul>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No products to show yet.{" "}
            <Link href="/shop" className="text-accent underline">
              Open the shop
            </Link>
          </p>
        ) : (
          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
            role="list"
          >
            {products.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <ProductCard product={p} index={i} />
              </motion.li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
