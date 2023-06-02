export enum JobEvents {
  started = 'jobStarted',
  success = 'jobSuccess',
  unprocessable = 'jobUnprocessable',
  error = 'jobError',
  maxErrors = 'jobMaxErrorReached',
  expired = 'jobExpired',
  requested = 'jobRequested',
  cancelled = 'jobCancelled',
  resumed = 'jobResumed',
}
