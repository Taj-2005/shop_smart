"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductCard } from "@/components/shop/product-card";
import { Container } from "@/components/layout/container";
import { useStorefrontCatalog } from "@/context/storefront-catalog-context";

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-border bg-surface p-4 animate-pulse ${className ?? ""}`}
    >
      <div className="aspect-square rounded-[var(--radius)] bg-muted" />
      <div className="mt-4 h-4 w-[75%] rounded bg-muted" />
      <div className="mt-2 h-3 w-[50%] rounded bg-muted" />
    </div>
  );
}

export function DealsSection() {
  const { getDeals, loading, error } = useStorefrontCatalog();
  const products = getDeals(6);

  return (
    <section
      id="deals"
      className="scroll-mt-20 py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-muted"
      aria-labelledby="deals-heading"
    >
      {/* Distinct promotional background — premium tint, not flat */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-accent/10 via-accent/5 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-30"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h8v8H0V0zm8 8h8v8H8V8zm8-8h8v8h-8V0zm8 8h8v8h-8V8z' fill='%2300C2B2' fill-opacity='0.04' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />
      <Container as="div" className="relative">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              Limited time
            </span>
            <h2
              id="deals-heading"
              className="mt-3 font-heading text-2xl font-bold tracking-tight text-primary sm:text-3xl lg:text-4xl"
            >
              Deals & offers
            </h2>
            <p className="mt-1.5 text-muted-foreground sm:max-w-sm">
              Limited-time savings on quality products. Clear pricing, no gimmicks.
            </p>
          </div>
          <Link
            href="/shop?deal=1"
            className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
          >
            View all deals →
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
          <ul className="grid grid-cols-1 gap-6 sm:gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3" role="list">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <CardSkeleton />
              </li>
            ))}
          </ul>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No deals listed yet.{" "}
            <Link href="/shop?deal=1" className="text-accent underline">
              View the shop
            </Link>
          </p>
        ) : (
          <ul
            className="grid grid-cols-1 gap-6 sm:gap-6 md:grid-cols-2 md:gap-6 lg:grid-cols-3"
            role="list"
          >
            {products.map((p, i) => (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
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
