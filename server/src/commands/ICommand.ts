/**
 * The standard interface for the Command pattern.
 * All commands must implement an `execute` method that isolates business logic execution.
 */
export interface ICommand<TResult = unknown> {
  execute(): Promise<TResult>;
}
