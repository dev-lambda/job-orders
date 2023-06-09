import request from 'supertest';
import health from './healthController';
import { setupServer } from 'src/server';
import healthProbe from './HealthProbe';
import { FakeService } from './HealthProbe.test';
import { HealthReportSchema } from '@dev-lambda/job-orders-dto';

describe('Health check', () => {
  it('should give ok on healty services', async () => {
    const server = setupServer(health);

    healthProbe.register(new FakeService('server', true));
    healthProbe.register(new FakeService('db', true));

    return request(server)
      .get('/health')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toMatchObject({ healthy: true });
      })
      .finally(() => {
        healthProbe.unregister('server');
        healthProbe.unregister('db');
      });
  });

  it('should give server error on unhealty services', async () => {
    const server = setupServer(health);

    healthProbe.register(new FakeService('failing', false));

    return request(server)
      .get('/health')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        expect(res.body).toMatchObject({ healthy: false });
      })
      .finally(() => {
        healthProbe.unregister('failing');
      });
  });

  it('should return a valid health response', async () => {
    const server = setupServer(health);

    healthProbe.register(new FakeService('server', true));
    healthProbe.register(new FakeService('db', true));

    return request(server)
      .get('/health')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        const parsedReport = HealthReportSchema.safeParse(res.body);
        expect(parsedReport.success).toBeTruthy();
      })
      .finally(() => {
        healthProbe.unregister('server');
        healthProbe.unregister('db');
      });
  });
});
