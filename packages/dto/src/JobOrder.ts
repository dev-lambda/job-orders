import z from './zod';

/**
 * The payload is dependent on the job type. As such, no type assumptions can be made at this level.
 * However, it is expected to be in an object form.
 */
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GenericPayloadSchema = z.record(z.string(), z.any());

export type GenericPayload = z.infer<typeof GenericPayloadSchema>;

export const JobParamsSchema = z.object({
  maxRetry: z.coerce
    .number()
    .int()
    .nonnegative()
    .openapi({ description: 'Max job retry count', example: 1, default: 3 }),
  schedule: z.coerce.date().optional().openapi({
    description: 'Schedule job date',
    // example: new Date('2023-01-01').toISOString(),
  }),
  expiresAt: z.coerce.date().optional().openapi({
    description: 'Expiration date',
    // example: new Date('2023-31-12').toISOString(),
  }),
  timeout: z.coerce.number().optional().openapi({
    description: 'Indicative job order timeout (in seconds)',
    example: 10,
    default: 300,
  }),
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
    type: z.string().openapi({ description: 'The job order type' }),
    payload: schema.openapi({
      description:
        'The payload to be transmitted to the job processing process',
    }),
    params: JobParamsSchema.openapi({
      description: 'The resolved parameters for the job',
    }),
    status: JobStatusSchema.openapi({
      description: 'The lifecycle status of the job order',
    }),
    runs: z
      .array(JobRunSchema)
      .openapi({ description: 'A log of the processing outcomes' }),
  });

export const GenericJobOrderSchema =
  JobOrderSchemaGenerator(GenericPayloadSchema).openapi('JobOrder');

export type GenericJobOrder = z.infer<typeof GenericJobOrderSchema>;

export interface JobOrder<T> {
  type: string;
  payload: T;
  params: JobParams;
  status: JobStatus;
  runs: JobRun[];
}
