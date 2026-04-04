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

export interface IOrderPricingStrategy {
  compute(lines: OrderLineInput[]): OrderPricingBreakdown;
}
