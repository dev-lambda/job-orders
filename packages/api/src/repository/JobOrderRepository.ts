import {
  GenericJobOrder,
  GenericJobOrderSchema,
  JobRun,
  JobStatus,
  z,
} from '@dev-lambda/job-orders-dto';

export const PersistedJobOrderSchema = GenericJobOrderSchema.extend({
  id: z.string().openapi({ description: 'The id assigned to the job order.' }),
}).openapi('PersistedJobOrder');

export type PersistedJobOrder = z.infer<typeof PersistedJobOrderSchema>;

export interface JobOrderRepository {
  create(order: GenericJobOrder): Promise<PersistedJobOrder>;
  setStatus(id: string, status: JobStatus): Promise<PersistedJobOrder>;
  addRun(id: string, run: JobRun): Promise<PersistedJobOrder>;
  find(id: string): Promise<PersistedJobOrder>;
  delete(id: string): Promise<boolean>;
}
