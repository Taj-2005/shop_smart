"use client";

import { useState, useCallback, useEffect } from "react";
import { cartApi, type ApiCart } from "@/api/cart.api";

export function useApiCart() {
  const [cart, setCart] = useState<ApiCart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    cartApi
      .get()
      .then((res) => {
        if (res.success && res.data) setCart(res.data);
        else setCart({ id: null, items: [] });
      })
      .catch(() => setError("Failed to load cart"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      refetch();
    });
  }, [refetch]);

  const addToCart = useCallback(
    async (productId: string, quantity = 1) => {
      try {
        const res = await cartApi.add(productId, quantity);
        if (res.success && res.data) setCart(res.data);
      } catch {
        setError("Failed to add to cart");
      }
    },
    []
  );

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await cartApi.removeItem(itemId);
        refetch();
        return;
      }
      await cartApi.updateItem(itemId, quantity);
      refetch();
    } catch {
      setError("Failed to update quantity");
    }
  }, [refetch]);

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        await cartApi.removeItem(itemId);
        refetch();
      } catch {
        setError("Failed to remove item");
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
