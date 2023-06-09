import api from './metrics';
import { setupServer } from 'src/server';
import request from 'supertest';

describe('Metrics endpoint', () => {
  const server = setupServer(api);

  it('should get application metrics', async () => {
    return request(server)
      .get('/metrics')
      .expect(200)
      .expect('Content-Type', /text\/plain/);
  });
});
