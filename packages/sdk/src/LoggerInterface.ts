// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoggerFn = (message: string, ...extra: any[]) => void;

export interface Logger {
  info: LoggerFn;
  warn: LoggerFn;
  error: LoggerFn;
}
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopLog = () => {};
export const defaultLogger = {
  info: noopLog,
  warn: noopLog,
  error: noopLog,
};
