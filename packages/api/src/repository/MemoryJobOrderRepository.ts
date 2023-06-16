import { GenericJobOrder, JobRun, JobStatus } from '@dev-lambda/job-orders-dto';
import { JobOrderRepository, PersistedJobOrder } from './JobOrderRepository';

export class MemoryJobOrderRepository implements JobOrderRepository {
  orders: Map<string, GenericJobOrder>;
  private currentId: number;

  constructor() {
    this.currentId = 0;
    this.orders = new Map<string, GenericJobOrder>();
  }

  create(order: GenericJobOrder): Promise<PersistedJobOrder> {
    let id = `${this.currentId}`;
    this.currentId++;
    this.orders.set(id, order);
    return Promise.resolve({ id, ...order });
  }

  setStatus(id: string, status: JobStatus): Promise<PersistedJobOrder> {
    let order = this.orders.get(id);
    if (!order) {
      return Promise.reject(`Job order not found ${id}`);
    }
    order.status = status;
    return Promise.resolve({ id, ...order });
  }

  addRun(id: string, run: JobRun): Promise<PersistedJobOrder> {
    let order = this.orders.get(id);
    if (!order) {
      return Promise.reject(`Job order not found ${id}`);
    }
    order.runs.push(run);
    return Promise.resolve({ id, ...order });
  }

  find(id: string): Promise<PersistedJobOrder> {
    return new Promise((resolve) => {
      let order = this.orders.get(id);
      if (!order) {
        throw new Error(`Job order not found ${id}`);
      }
      return resolve({ id, ...order });
    });
  }

  delete(id: string): Promise<boolean> {
    let order = this.orders.get(id);
    if (!order) {
      return Promise.resolve(false);
    }
    this.orders.delete(id);
    return Promise.resolve(true);
  }
}
