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
