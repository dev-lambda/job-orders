export interface JobQueuer {
  queue(id: string, scheduleAt?: Date): Promise<boolean>;
  unqueue(id: string): Promise<boolean>;
}
