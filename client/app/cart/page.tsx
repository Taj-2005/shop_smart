"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useShop } from "@/context/shop-context";
import { useAuth } from "@/context/auth-context";
import { useApiCart } from "@/hooks/use-api-cart";
import { getProductById, getFormattedPrice } from "@/data/products";
import { Container } from "@/components/layout/container";

function formatPrice(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
}: {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-[var(--radius-sm)] border border-border bg-surface">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= min}
        className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className="flex h-9 min-w-[2.5rem] items-center justify-center text-sm font-medium text-primary"
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function GuestCartContent() {
  const { cart, removeFromCart, updateQuantity } = useShop();
  const entries = Object.entries(cart).filter(([, q]) => q > 0);
  const subtotal = entries.reduce((sum, [id, qty]) => {
    const p = getProductById(id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
  const couponApplied = false;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  if (entries.length === 0) {
    return (
      <div className="mt-12 rounded-[var(--radius-lg)] border border-border bg-surface py-16 text-center">
        <p className="text-muted-foreground">Add items from the shop to get started.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-on-accent transition-colors hover:bg-accent/90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <ul className="space-y-4" role="list">
        {entries.map(([id, qty]) => {
          const p = getProductById(id);
          if (!p) return null;
          const { current } = getFormattedPrice(p);
          return (
            <motion.li
              key={id}
              layout
              className="flex gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4"
            >
              <Link href={`/shop?p=${id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius)] bg-muted">
                <Image src={p.image} alt={p.alt} fill sizes="96px" className="object-cover" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/shop?p=${id}`} className="font-heading font-semibold text-primary hover:underline line-clamp-2">
                  {p.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted-foreground">{current}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <QuantityStepper
                    quantity={qty}
                    onIncrease={() => updateQuantity(id, qty + 1)}
                    onDecrease={() => updateQuantity(id, qty - 1)}
                  />
                  <button type="button" onClick={() => removeFromCart(id)} className="text-sm text-muted-foreground hover:text-primary underline">
                    Remove
                  </button>
                </div>
              </div>
              <p className="shrink-0 text-right font-medium text-primary">{formatPrice(p.price * qty)}</p>
            </motion.li>
          );
        })}
      </ul>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold text-primary">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 font-semibold text-primary">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link
            href="/login?redirect=/cart"
            className="mt-6 block w-full rounded-[var(--radius)] bg-accent py-3 text-center text-base font-medium text-on-accent hover:bg-accent/90"
          >
            Sign in to checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}

function ApiCartContent() {
  const { cart, loading, error, updateQuantity, removeItem } = useApiCart();
  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);
  const total = subtotal;

  if (loading) {
    return (
      <div className="mt-12 flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[var(--color-error)]/10 p-6 text-[var(--color-error)]">
        {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-12 rounded-[var(--radius-lg)] border border-border bg-surface py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-on-accent hover:bg-accent/90"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
      <ul className="space-y-4" role="list">
        {items.map((item) => {
          const p = item.product;
          const price = p?.price ?? 0;
          return (
            <motion.li key={item.id} layout className="flex gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
              {p?.image && (
                <Link href={`/shop?p=${item.productId}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius)] bg-muted">
                  <Image src={p.image} alt={p.name} fill sizes="96px" className="object-cover" />
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <Link href={`/shop?p=${item.productId}`} className="font-heading font-semibold text-primary hover:underline line-clamp-2">
                  {p?.name ?? "Product"}
                </Link>
                <p className="mt-0.5 text-sm text-muted-foreground">₹{price.toLocaleString("en-IN")}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <QuantityStepper
                    quantity={item.quantity}
                    onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                    onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  />
                  <button type="button" onClick={() => removeItem(item.id)} className="text-sm text-muted-foreground hover:text-primary underline">
                    Remove
                  </button>
                </div>
              </div>
              <p className="shrink-0 text-right font-medium text-primary">{formatPrice(price * item.quantity)}</p>
            </motion.li>
          );
        })}
      </ul>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
          <h2 className="font-heading text-lg font-semibold text-primary">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between border-t border-border pt-3 font-semibold text-primary">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-[var(--radius)] bg-accent py-3 text-center text-base font-medium text-on-accent hover:bg-accent/90"
          >
            Proceed to Checkout
          </Link>
        </div>
      </aside>
    </div>
  );
}

export default function CartPage() {
  const { isAuthenticated } = useAuth();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="min-h-screen bg-muted">
      <Container as="div" className="py-8 lg:py-12">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Your Cart
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isAuthenticated ? "Your saved cart." : "Add items from the shop or sign in to sync your cart."}
        </p>

        {isAuthenticated ? <ApiCartContent /> : <GuestCartContent />}
      </Container>
    </motion.div>
  );
}
