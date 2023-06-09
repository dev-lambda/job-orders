import { ServiceManager } from 'src/ServiceManager';
import logger from 'src/logger';
import { HealthReport } from '@dev-lambda/job-orders-dto';

export class HealthProbe {
  private monitoredServices: Map<string, ServiceManager<any, any>> = new Map();

  register(
    service: ServiceManager<any, any>,
    name: string = service.name
  ): boolean {
    if (!this.monitoredServices.has(name)) {
      logger.info(`Monitoring health on service ${name}`, name);
      this.monitoredServices.set(name, service);
      return true;
    } else {
      logger.warn(
        `Already monitoring health on a service named ${name}, ignoring duplicate service registration`,
        {
          current: this.monitoredServices.get(name)?.name,
          ignored: service.name,
          monitoredAs: name,
        }
      );
      return false;
    }
  }

  unregister(name: string) {
    let unregistered = this.monitoredServices.delete(name);
    if (unregistered) {
      logger.info(`No longer monitoring health on service ${name}`, {
        name,
        unregistered,
      });
    } else {
      logger.warn(
        `Failed attempt to unregister health moniroting on service ${name}`,
        { name, unregistered }
      );
    }
    return unregistered;
  }

  async isAlive(): Promise<HealthReport> {
    let servicesList = Array.from(this.monitoredServices.entries());

    return Promise.all(
      servicesList.map(([name, service]) =>
        service.isAlive().then((serviceHealth) => ({ ...serviceHealth, name }))
      )
    ).then((report) => {
      let healthy = report.reduce(
        (prev, current) => prev && current.healthy,
        true
      );
      return { healthy, report };
    });
  }
}

const singleton = new HealthProbe();
export default singleton;
