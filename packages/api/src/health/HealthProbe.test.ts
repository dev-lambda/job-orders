import { ServiceManager } from 'src/ServiceManager';
import { HealthProbe } from './HealthProbe';
import { ServiceHealthReport } from '@dev-lambda/job-orders-dto';

export class FakeService implements ServiceManager<any, any> {
  name: string;
  constructor(name: string, private healthy: boolean) {
    this.name = name;
  }

  init(params: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  close(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  isAlive(): Promise<ServiceHealthReport> {
    return Promise.resolve({ healthy: this.healthy, name: this.name });
  }
  getInstance() {
    throw new Error('Method not implemented.');
  }
}

describe('Health probe', () => {
  it('should be alive if no services registered', async () => {
    let healthProbe = new HealthProbe();
    let status = await healthProbe.isAlive();
    expect(status.healthy).toBeTruthy();
    expect(status.report).toMatchObject([]);
    expect(status.report).toHaveLength(0);
  });

  it('should register services', async () => {
    let healthProbe = new HealthProbe();
    let fakeServerManager = new FakeService('APIServer', true);

    healthProbe.register(fakeServerManager);

    let status = await healthProbe.isAlive();
    expect(status.report).toMatchObject([{ healthy: true, name: 'APIServer' }]);
  });

  it('should be healthy if all services are healty', async () => {
    let healthProbe = new HealthProbe();
    let fakeServerManager = new FakeService('APIServer', true);
    let fakeDbManager = new FakeService('DbService', true);

    healthProbe.register(fakeServerManager);
    healthProbe.register(fakeDbManager);
    let status = await healthProbe.isAlive();
    expect(status.healthy).toBeTruthy();
  });

  it('should be unhealthy if any service is unhealthy', async () => {
    let healthProbe = new HealthProbe();
    let fakeServerManager = new FakeService('APIServer', true);
    let fakeDbManager = new FakeService('DbService', false);

    healthProbe.register(fakeServerManager);
    healthProbe.register(fakeDbManager);
    let status = await healthProbe.isAlive();
    expect(status.healthy).toBeFalsy();
  });

  it('should avoid registering a service twice on the same name', async () => {
    let healthProbe = new HealthProbe();
    let fakeServerManager1 = new FakeService('APIServer', true);
    let fakeServerManager2 = new FakeService('APIServer', false);

    expect(healthProbe.register(fakeServerManager1)).toBeTruthy();
    expect(healthProbe.register(fakeServerManager2)).toBeFalsy();
    let status = await healthProbe.isAlive();
    expect(status.report).toMatchObject([{ healthy: true, name: 'APIServer' }]);
  });

  it('should override service name if explicit name provided', async () => {
    let healthProbe = new HealthProbe();
    let fakeServerManager = new FakeService('APIServer', true);

    healthProbe.register(fakeServerManager, 'OverridenName');

    let status = await healthProbe.isAlive();
    expect(status.report).toMatchObject([
      { healthy: true, name: 'OverridenName' },
    ]);
  });
});
