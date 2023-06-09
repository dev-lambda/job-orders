import { ServiceHealthReport } from '@dev-lambda/job-orders-dto';

export interface ServiceManager<InitOptions, InstanceType> {
  name: string;
  init(params: InitOptions): Promise<InstanceType>;
  close(): Promise<void>;
  isAlive(): Promise<ServiceHealthReport>;
  getInstance(): InstanceType | undefined;
}
