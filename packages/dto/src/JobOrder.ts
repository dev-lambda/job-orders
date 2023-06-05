import z from 'zod';

/**
 * The payload is dependent on the job type. As such, no type assumptions can be made at this level.
 * However, it is expected to be in an object form.
 */
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GenericPayloadSchema = z.record(x.string(), z.any());

export type GenericPayload = z.infer<typeof GenericPayloadSchema>;

export const JobParamsSchema = z.object({
  maxRetry: z.number().int().nonnegative(),
  schedule: z.date().optional(),
  expiresAt: z.date().optional(),
  timeout: z.number().optional(), // in seconds
});

export type JobParams = z.infer<typeof JobParamsSchema>;

export const JobStatusSchema = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled',
]);

export type JobStatus = z.infer<typeof JobStatusSchema>;

export const JobErrorTypeSchema = z.enum(['unprocessable', 'error']);

export type JobErrorType = z.infer<typeof JobErrorTypeSchema>;

export const JobErrorSchema = z.object({
  type: JobErrorTypeSchema,
  payload: GenericPayloadSchema.optional(),
});

export type JobError = z.infer<typeof JobErrorSchema>;

export const JobRunSchema = z.object({
  result: GenericPayloadSchema.optional(),
  error: JobErrorSchema.optional(),
});

export type JobRun = z.infer<typeof JobRunSchema>;

// export interface JobRun {
//   result?: GenericPayload;
//   error?: JobError;
// }

export const JobOrderSchemaGenerator = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    type: z.string(),
    payload: schema,
    params: JobParamsSchema,
    status: JobStatusSchema,
    runs: z.array(JobRunSchema),
  });

export const GenericJobOrderSchema =
  JobOrderSchemaGenerator(GenericPayloadSchema);

export type GenericJobOrder = z.infer<typeof GenericJobOrderSchema>;

export interface JobOrder<T> {
  type: string;
  payload: T;
  params: JobParams;
  status: JobStatus;
  runs: JobRun[];
}
