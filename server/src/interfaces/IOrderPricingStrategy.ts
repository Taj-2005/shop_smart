export interface OrderLineInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface PricedOrderLine {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderPricingBreakdown {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  lines: PricedOrderLine[];
}

/**
 * Order totals from line inputs. Implementations are substitutable: `compute` must return
 * finite numeric fields for any input array (including empty); invalid inputs are normalized
 * by callers via shared sanitization, not by throwing from individual strategies.
 */
export interface IOrderPricingStrategy {
  compute(lines: OrderLineInput[]): OrderPricingBreakdown;
}
