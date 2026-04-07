/** Stateless discount applied to order subtotal (currency units). */
export interface IDiscountStrategy {
  amountOff(subtotal: number): number;
}
