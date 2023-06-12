import {
  GenericJobOrder,
  GenericJobOrderSchema,
  JobRun,
  JobStatus,
  z,
} from '@dev-lambda/job-orders-dto';

export interface JobOrderRepository {
  create(order: GenericJobOrder): Promise<PersistedJobOrder>;
  setStatus(id: string, status: JobStatus): Promise<boolean>;
  addRun(id: string, run: JobRun): Promise<GenericJobOrder>;
  find(id: string): Promise<GenericJobOrder>;
  delete(id: string): Promise<boolean>;
}

export const PersistedJobOrderSchema = GenericJobOrderSchema.extend({
  id: z.string().openapi({ description: 'The id assigned to the job order.' }),
}).openapi('PersistedJobOrder');

export type PersistedJobOrder = z.infer<typeof PersistedJobOrderSchema>;
