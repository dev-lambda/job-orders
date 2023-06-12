import z from './zod';

export const JobEventsSchema = z.enum([
  'jobStarted',
  'jobSuccess',
  'jobUnprocessable',
  'jobError',
  'jobMaxErrorReached',
  'jobExpired',
  'jobRequested',
  'jobCancelled',
  'jobResumed',
]);

export type JobEvents = z.infer<typeof JobEventsSchema>;
