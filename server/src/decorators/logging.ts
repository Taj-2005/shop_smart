/**
 * Method decorator that implements the Decorator pattern.
 * Dynamically wraps a service method to inject logging and timing mechanisms
 * without altering the underlying business logic.
 */
export function LogExecutionTime() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      
      console.log(`[DECORATOR LOG] Executing ${propertyKey} with inputs:`, JSON.stringify(args));

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        console.log(`[DECORATOR LOG] Finished ${propertyKey} successfully in ${duration}ms`);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`[DECORATOR ERROR] Execution of ${propertyKey} failed after ${duration}ms`);
        throw error; // Re-throw the error to bubble up correctly
      }
    };

    return descriptor;
  };
}
