"use client";

import { useState, useCallback, useEffect } from "react";
import { cartApi, type ApiCart } from "@/api/cart.api";

function optimisticSetQuantity(cart: ApiCart | null, itemId: string, quantity: number): ApiCart | null {
  if (!cart) return cart;
  if (quantity < 1) {
    return { ...cart, items: cart.items.filter((i) => i.id !== itemId) };
  }
  return {
    ...cart,
    items: cart.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
  };
}

function optimisticRemoveItem(cart: ApiCart | null, itemId: string): ApiCart | null {
  if (!cart) return cart;
  return { ...cart, items: cart.items.filter((i) => i.id !== itemId) };
}

export function useApiCart() {
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback((options?: { withSpinner?: boolean }) => {
    const withSpinner = options?.withSpinner ?? false;
    if (withSpinner) setLoading(true);
    setError(null);
    cartApi
      .get()
      .then((res) => {
        if (res.success && res.data) setCart(res.data);
        else setCart({ id: null, items: [] });
      })
      .catch(() => setError("Failed to load cart"))
      .finally(() => {
        if (withSpinner) setLoading(false);
      });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      refetch({ withSpinner: true });
    });
  }, [refetch]);

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    try {
      const res = await cartApi.add(productId, quantity);
      if (res.success && res.data) setCart(res.data);
    } catch {
      setError("Failed to add to cart");
    }
  }, []);

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      setCart((c) => optimisticSetQuantity(c, itemId, quantity));
      try {
        if (quantity < 1) {
          await cartApi.removeItem(itemId);
        } else {
          await cartApi.updateItem(itemId, quantity);
        }
        void refetch();
      } catch {
        setError("Failed to update quantity");
        void refetch();
      }
    },
    [refetch]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      setCart((c) => optimisticRemoveItem(c, itemId));
      try {
        await cartApi.removeItem(itemId);
        void refetch();
      } catch {
        setError("Failed to remove item");
        void refetch();
      }
    },
    [refetch]
  );

  return {
    cart,
    loading,
    error,
    refetch,
    addToCart,
    updateQuantity,
    removeItem,
  };
}
