import api from './apiDoc';
import { setupServer } from 'src/server';
import request from 'supertest';

describe('licence api', () => {
  const server = setupServer(api);

  it('should get OpenAPI json specs', async () => {
    return request(server)
      .get('/openAPI')
      .expect(200)
      .expect('Content-Type', /json/);
  });
});
