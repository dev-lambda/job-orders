export interface JobParams {
  maxRetry: number;
  schedule?: Date;
  expiresAt?: Date;
  timeout?: number; // seconds
}

export enum JobStatus {
  pending = 'pending',
  processing = 'processing',
  completed = 'completed',
  failed = 'failed',
  cancelled = 'cancelled',
}
export enum JobErrorType {
  unprocessable = 'unprocessable',
  error = 'error',
}

export interface JobError {
  type: JobErrorType;
  payload: GenericPayload;
}

export interface JobRun {
  result?: GenericPayload;
  error?: JobError;
}

export interface JobOrder<T> {
  type: string;
  payload: T;
  params: JobParams;
  status: JobStatus;
  runs: JobRun[];
}

export type GenericJobOrder = JobOrder<GenericPayload>;

/**
 * The payload is dependent on the job type. As such, no type assumptions can be made at this level.
 * However, it is expected to be in an object form.
 */
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericPayload = Record<string, any>;
