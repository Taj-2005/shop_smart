/** Stateless shipping cost from order subtotal (currency units). */
export interface IShippingStrategy {
  cost(subtotal: number): number;
}
