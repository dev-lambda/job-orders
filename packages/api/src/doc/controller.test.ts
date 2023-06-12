import api from './controller';
import { setupServer } from 'src/server';
import request from 'supertest';

describe('api doc', () => {
  const server = setupServer(api);

  it('should get OpenAPI json specs', async () => {
    return request(server)
      .get('/openAPI')
      .expect(200)
      .expect('Content-Type', /json/);
  });
});
