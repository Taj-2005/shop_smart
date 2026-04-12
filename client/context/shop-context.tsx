"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useAuth } from "@/context/auth-context";
import { cartApi, type ApiCart } from "@/api/cart.api";

export type CartState = Record<string, number>;

export type WishlistState = Set<string>;

type ShopContextValue = {
  cart: CartState;
  wishlist: WishlistState;
  cartCount: number;
  wishlistCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (productId: string) => Promise<void>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

function applyApiCartToRefs(
  data: ApiCart,
  setCart: Dispatch<SetStateAction<CartState>>,
  cartRef: MutableRefObject<CartState>,
  lineIdsRef: MutableRefObject<Record<string, string>>
) {
  const next: CartState = {};
  const lines: Record<string, string> = {};
  for (const item of data.items) {
    next[item.productId] = item.quantity;
    lines[item.productId] = item.id;
  }
  lineIdsRef.current = lines;
  cartRef.current = next;
  setCart(next);
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const [cart, setCart] = useState<CartState>({});
  const [wishlist, setWishlist] = useState<WishlistState>(new Set());
  const cartRef = useRef<CartState>(cart);
  const lineIdsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((s, q) => s + q, 0),
    [cart]
  );
  const wishlistCount = wishlist.size;

  useEffect(() => {
    if (!isInitialized || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await cartApi.get();
        if (cancelled) return;
        if (res.success && res.data) {
          applyApiCartToRefs(res.data, setCart, cartRef, lineIdsRef);
        }
      } catch {
        /* keep existing cart state */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isInitialized]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      if (!isAuthenticated) {
        setCart((prev) => {
          const next = {
            ...prev,
            [productId]: (prev[productId] ?? 0) + quantity,
          };
          cartRef.current = next;
          return next;
        });
        return;
      }
      const nextQty = (cartRef.current[productId] ?? 0) + quantity;
      try {
        const res = await cartApi.add(productId, nextQty);
        if (res.success && res.data) {
          applyApiCartToRefs(res.data, setCart, cartRef, lineIdsRef);
        }
      } catch {
        /* failed — do not update UI */
      }
    },
    [isAuthenticated]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        setCart((prev) => {
          const next = { ...prev };
          delete next[productId];
          cartRef.current = next;
          return next;
        });
        return;
      }
      const lineId = lineIdsRef.current[productId];
      if (!lineId) return;
      try {
        await cartApi.removeItem(lineId);
        const res = await cartApi.get();
        if (res.success && res.data) {
          applyApiCartToRefs(res.data, setCart, cartRef, lineIdsRef);
        }
      } catch {
        /* */
      }
    },
    [isAuthenticated]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!isAuthenticated) {
        if (quantity < 1) {
          setCart((prev) => {
            const next = { ...prev };
            delete next[productId];
            cartRef.current = next;
            return next;
          });
          return;
        }
        setCart((prev) => {
          const next = { ...prev, [productId]: quantity };
          cartRef.current = next;
          return next;
        });
        return;
      }

      let lineId = lineIdsRef.current[productId];
      if (!lineId) {
        try {
          const r = await cartApi.get();
          if (r.success && r.data) {
            applyApiCartToRefs(r.data, setCart, cartRef, lineIdsRef);
            lineId = lineIdsRef.current[productId];
          }
        } catch {
          return;
        }
      }

      try {
        if (quantity < 1) {
          if (lineId) await cartApi.removeItem(lineId);
        } else if (lineId) {
          await cartApi.updateItem(lineId, quantity);
        }
        const res = await cartApi.get();
        if (res.success && res.data) {
          applyApiCartToRefs(res.data, setCart, cartRef, lineIdsRef);
        }
      } catch {
        /* */
      }
    },
    [isAuthenticated]
  );

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.has(productId),
    [wishlist]
  );

  const moveToCart = useCallback(
    async (productId: string) => {
      await addToCart(productId, 1);
      setWishlist((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    },
    [addToCart]
  );

  const value = useMemo<ShopContextValue>(
    () => ({
      cart,
      wishlist,
      cartCount,
      wishlistCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleWishlist,
      isInWishlist,
      moveToCart,
    }),
    [
      cart,
      wishlist,
      cartCount,
      wishlistCount,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleWishlist,
      isInWishlist,
      moveToCart,
    ]
  );

  return (
    <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
