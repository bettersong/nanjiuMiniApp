export default class EventBus {
  private static instance: EventBus
  private listeners: Record<string, Function[]>

  private constructor() {
    this.listeners = {}
  }

  public static getInstance() {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  public on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  public off(event: string, callback: Function) {
    if (!this.listeners[event]) {
      return
    }
    const index = this.listeners[event].findIndex((listener) => listener === callback)
    if (index !== -1) {
      this.listeners[event].splice(index, 1)
    }
  }

  public emit(event: string, ...args: any[]) {
    if (!this.listeners[event]) {
      return
    }
    this.listeners[event].forEach((listener) => listener(...args))
  }
}
