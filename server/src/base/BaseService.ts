export abstract class BaseService {
  /**
   * Hook executed before the main processing logic.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onBeforeExecute(data?: unknown): Promise<void> {
     // Placeholder for logging, metrics, etc.
  }
  
  /**
   * Hook executed after main processing logic.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async onAfterExecute(result?: unknown): Promise<void> {
    // Placeholder for post-processing updates
  }

  /**
   * Implement specific business logic per service command here.
   */
  protected abstract executeImpl(data?: unknown): Promise<unknown>;

  /**
   * The Template Method that orchestrates business logic execution hooks.
   */
  public async execute(data?: unknown): Promise<unknown> {
    await this.onBeforeExecute(data);
    const result = await this.executeImpl(data);
    await this.onAfterExecute(result);
    return result;
  }
}
