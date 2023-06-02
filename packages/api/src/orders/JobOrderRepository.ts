import { GenericJobOrder, JobRun, JobStatus } from '@dev-lambda/job-orders-dto';

export interface JobOrderRepository {
  create(order: GenericJobOrder): Promise<PersistedJobOrder>;
  setStatus(id: string, status: JobStatus): Promise<boolean>;
  addRun(id: string, run: JobRun): Promise<GenericJobOrder>;
  find(id: string): Promise<GenericJobOrder>;
  delete(id: string): Promise<boolean>;
}

export interface PersistedJobOrder extends GenericJobOrder {
  id: string;
}

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

  setStatus(id: string, status: JobStatus): Promise<boolean> {
    let order = this.orders.get(id);
    if (!order) {
      return Promise.reject(`Job order not found ${id}`);
    }
    order.status = status;
    return Promise.resolve(true);
  }

  addRun(id: string, run: JobRun): Promise<GenericJobOrder> {
    let order = this.orders.get(id);
    if (!order) {
      return Promise.reject(`Job order not found ${id}`);
    }
    order.runs.push(run);
    return Promise.resolve(order);
  }

  find(id: string): Promise<GenericJobOrder> {
    return new Promise((resolve, reject) => {
      let order = this.orders.get(id);
      if (!order) {
        throw new Error(`Job order not found ${id}`);
      }
      return resolve(order);
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
