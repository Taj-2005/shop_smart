import type { AppEventMap, AppEventName } from "./events.types";

type AnyAppEventHandler = (payload: AppEventMap[AppEventName]) => void;

export class EventBus {
  private static instance: EventBus | undefined;

  private readonly handlers = new Map<AppEventName, Set<AnyAppEventHandler>>();

  private constructor() {}

  private static getBus(): EventBus {
    EventBus.instance ??= new EventBus();
    return EventBus.instance;
  }

  static emit<K extends AppEventName>(event: K, payload: AppEventMap[K]): void {
    const subs = EventBus.getBus().handlers.get(event);
    if (!subs) return;
    for (const handler of subs) {
      handler(payload);
    }
  }

  static subscribe<K extends AppEventName>(event: K, handler: (payload: AppEventMap[K]) => void): void {
    const bus = EventBus.getBus();
    let subs = bus.handlers.get(event);
    if (!subs) {
      subs = new Set();
      bus.handlers.set(event, subs);
    }
    subs.add(handler as AnyAppEventHandler);
  }
}
