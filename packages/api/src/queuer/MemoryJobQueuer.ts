import { JobQueuer } from './JobQueuer';

export class MemoryJobQueuer implements JobQueuer {
  private orders: Set<string>;

  constructor() {
    this.orders = new Set<string>();
  }

  queue(id: string): Promise<boolean> {
    this.orders.add(id);
    return Promise.resolve(true);
  }

  unqueue(id: string): Promise<boolean> {
    return Promise.resolve(this.orders.delete(id));
  }

  hasMessage(id: string) {
    return this.orders.has(id);
  }
}
