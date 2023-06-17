export type EventEmitterCallback<T> = (args: T) => unknown

export type EventEmitterEvents<T> = Record<keyof T, EventEmitterCallback<any>[]>

export class EventEmitter<T extends Object = Object> {
  constructor(public events = {} as EventEmitterEvents<T>) {}

  on<Key extends keyof T>(event: Key, listener: EventEmitterCallback<T[Key]>) {
    this.events[event] ??= []
    this.events[event].push(listener)
    return () => this.off(event, listener)
  }

  fire<Key extends keyof T>(event: Key, ...args: Parameters<EventEmitterCallback<T[Key]>>) {
    this.events[event]?.forEach((listener) => listener(...args))
  }

  off<Key extends keyof T>(event: Key, listener: EventEmitterCallback<T[Key]>) {
    if (!(event in this.events)) return

    const idx = this.events[event].indexOf(listener)

    if (idx > -1) {
      this.events[event].splice(idx, 1)
    }
  }
}
