import { ICommand } from "./ICommand";

/**
 * Command to encapsulate the action of updating an order's status.
 */
export class UpdateOrderStatusCommand implements ICommand {
  /**
   * @param orderService Mock or real service injected by the runtime environment
   * @param orderId Target order ID
   * @param status New order status payload
   */
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly orderService: any,
    private readonly orderId: string,
    private readonly status: string
  ) {}

  public async execute(): Promise<unknown> {
    return await this.orderService.updateStatus(this.orderId, this.status);
  }
}
