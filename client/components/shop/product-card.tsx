"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Product } from "@/data/products";
import { getFormattedPrice } from "@/data/products";
import { useShop } from "@/context/shop-context";

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: "default" | "compact" | "wishlist";
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-accent" aria-label={`${rating} stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill={i <= full || (i === full + 1 && half) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polygon points="12 2 15 9 22 9 17 14 18 22 12 18 6 22 7 14 2 9 9 9" />
        </svg>
      ))}
    </span>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function QuantityStepper({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  touchFriendly = false,
}: {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  touchFriendly?: boolean;
}) {
  const btnClass = touchFriendly
    ? "flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
    : "flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent";
  return (
    <div className="inline-flex items-center rounded-[var(--radius-sm)] border border-border bg-surface">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDecrease();
        }}
        disabled={quantity <= min}
        className={btnClass}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span
        className={`flex min-w-[2rem] items-center justify-center text-sm font-medium text-primary ${touchFriendly ? "min-h-[44px] px-2" : "h-9"}`}
        aria-live="polite"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onIncrease();
        }}
        className={btnClass}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export function ProductCard({ product, index = 0, variant = "default" }: ProductCardProps) {
  const { current, original } = getFormattedPrice(product);
  const isCompact = variant === "compact";
  const isWishlistView = variant === "wishlist";
  const useMobileHorizontal = !isCompact;
  const { cart, addToCart, updateQuantity, toggleWishlist, isInWishlist, moveToCart } = useShop();
  const qty = cart[product.id] ?? 0;
  const inCart = qty > 0;
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock) void addToCart(product.id, 1);
  };

  const imageArea = (
    <div
      className={
        useMobileHorizontal
          ? "relative flex-[0_0_42%] min-h-0 overflow-hidden rounded-l-[var(--radius-lg)] bg-muted md:flex-none md:min-h-0 md:w-full md:rounded-none md:rounded-t-[var(--radius-lg)] md:aspect-square"
          : "relative aspect-square overflow-hidden bg-muted"
      }
    >
      <Image
        src={product.image}
        alt={product.alt}
        fill
        sizes={isCompact ? "(max-width: 640px) 45vw, 220px" : useMobileHorizontal ? "(max-width: 768px) 42vw, (max-width: 1024px) 33vw, 25vw" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute left-2 top-2 flex flex-wrap gap-1">
        {product.isNew && (
          <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-on-accent">
            New
          </span>
        )}
        {product.isDeal && product.originalPrice && (
          <span className="rounded bg-primary px-2 py-0.5 text-xs font-medium text-on-primary">
            Deal
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={handleWishlistClick}
        className="absolute right-2 top-2 flex h-9 w-9 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-surface/90 text-muted-foreground transition-colors hover:bg-surface hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent md:h-9 md:w-9 md:min-h-0 md:min-w-0"
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <HeartIcon filled={inWishlist} />
      </button>
      {!product.inStock && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/60">
          <span className="rounded bg-primary px-3 py-1 text-sm font-medium text-on-primary">
            Out of stock
          </span>
        </div>
      )}
    </div>
  );

  const contentArea = (
    <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {product.category}
      </p>
      <h3 className="mt-1 font-heading font-semibold text-primary line-clamp-2">
        {product.name}
      </h3>
      <div className="mt-2 flex items-center gap-2">
        <StarRating rating={product.rating} />
        <span className="text-xs text-muted-foreground">
          ({product.reviewCount})
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        <span className="text-sm font-medium text-primary">{current}</span>
        {original && (
          <span className="text-xs text-muted-foreground line-through">
            {original}
          </span>
        )}
      </div>
      <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
        {isWishlistView && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              className="min-h-[44px] min-w-[44px] text-sm text-muted-foreground hover:text-primary underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent md:min-h-0 md:min-w-0"
            >
              Remove from wishlist
            </button>
            {inCart ? (
              <QuantityStepper
                quantity={qty}
                onIncrease={() => void updateQuantity(product.id, qty + 1)}
                onDecrease={() => void updateQuantity(product.id, qty - 1)}
                touchFriendly={useMobileHorizontal}
              />
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (product.inStock) void moveToCart(product.id);
                }}
                disabled={!product.inStock}
                className="min-h-[44px] rounded-[var(--radius-sm)] bg-accent px-3 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 md:min-h-0"
              >
                Move to Cart
              </button>
            )}
          </div>
        )}
        {!isWishlistView &&
          (inCart ? (
            <QuantityStepper
              quantity={qty}
              onIncrease={() => void updateQuantity(product.id, qty + 1)}
              onDecrease={() => void updateQuantity(product.id, qty - 1)}
              touchFriendly={useMobileHorizontal}
            />
          ) : (
            <motion.button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="w-full min-h-[44px] rounded-[var(--radius-sm)] py-2 text-sm font-medium bg-accent text-on-accent transition-colors hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 md:min-h-0"
            >
              Add to cart
            </motion.button>
          ))}
      </div>
    </div>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="group"
    >
      <Link
        href={`/shop?p=${product.id}`}
        className={
          useMobileHorizontal
            ? "flex flex-row overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent md:flex-col"
            : "block overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-accent"
        }
      >
        {imageArea}
        {contentArea}
      </Link>
    </motion.article>
  );
}
