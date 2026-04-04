import { ICommand } from "./ICommand";

/**
 * Command to encapsulate the action of creating an order.
 * Injecting the OrderService interface via dependency injection ensures loose coupling.
 */
export class CreateOrderCommand implements ICommand {
  /**
   * @param orderService Mock or real service injected by the runtime environment
   * @param userId The ID of the acting user
   * @param payload The order payload payload mapping
   */
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly orderService: any,
    private readonly userId: string,
    private readonly payload: Record<string, unknown>
  ) {}

  public async execute(): Promise<unknown> {
    return await this.orderService.create(this.userId, this.payload);
  }
}
