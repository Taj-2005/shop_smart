export interface OrderInput {
  id: string;
  userId: string;
  status: string;
  subtotal: unknown; // Decimal
  discount: unknown; // Decimal
  shipping: unknown; // Decimal
  total: unknown; // Decimal
  addressId: string | null;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: unknown;
}

export class OrderAdapter {
  /**
   * Converts a raw order model from the database into a clean DTO for API responses.
   * Converts Decimal fields to numbers.
   * Formats dates to ISO strings.
   *
   * @param order - Raw order model
   * @returns Clean order DTO
   */
  static toDTO(order: OrderInput) {
    if (!order) return null;

    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      // Safely convert decimals to numbers
      subtotal: order.subtotal ? Number(order.subtotal) : 0,
      discount: order.discount ? Number(order.discount) : 0,
      shipping: order.shipping ? Number(order.shipping) : 0,
      total: order.total ? Number(order.total) : 0,
      addressId: order.addressId,
      createdAt: order.createdAt ? order.createdAt.toISOString() : null,
      updatedAt: order.updatedAt ? order.updatedAt.toISOString() : null,
    };
  }
}

/*
Example Usage:

import { OrderAdapter } from './adapters/OrderAdapter';

const rawOrder = await prisma.order.findUnique({ where: { id: "123" } });
const orderDTO = OrderAdapter.toDTO(rawOrder);

// orderDTO.total is now a JS number instead of a Prisma Decimal.
// orderDTO.createdAt is an ISO string.
res.json({ success: true, data: orderDTO });
*/
