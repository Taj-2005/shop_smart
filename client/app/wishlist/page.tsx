"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useShop } from "@/context/shop-context";
import { resolveShopProduct } from "@/data/catalog-resolver";
import type { Product } from "@/data/products";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/shop/product-card";

export default function WishlistPage() {
  const { wishlist } = useShop();
  const productIds = Array.from(wishlist);
  const products = productIds
    .map((id) => resolveShopProduct(id))
    .filter((p): p is Product => !!p);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-muted"
    >
      <Container as="div" className="py-8 lg:py-12">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Your Wishlist
        </h1>
        <p className="mt-2 text-muted-foreground">
          {products.length === 0
            ? "Your wishlist is empty."
            : `${products.length} item${products.length === 1 ? "" : "s"} saved.`}
        </p>

        {products.length === 0 ? (
          <div className="mt-12 rounded-[var(--radius-lg)] border border-border bg-surface py-16 text-center">
            <p className="text-muted-foreground">Save items you like for later.</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <ul
            className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
            role="list"
          >
            {products.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <ProductCard product={p} index={i} variant="wishlist" />
              </motion.li>
            ))}
          </ul>
        )}
      </Container>
    </motion.div>
  );
}
