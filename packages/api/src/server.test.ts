import express from 'express';
import request from 'supertest';
import { explode, explodeAfterResponse } from './base/error';
import init, { setupServer } from './server';
const server = setupServer();

describe('server', () => {
  test('server initializes', async () => {
    return init(null)
      .then((instance) => {
        expect(instance.address).not.toBeNull();
        instance.close();
      })
      .catch((error) => {
        fail(error);
      });
  });

  it('should be alive', () => {
    return request(server).get('/').expect(200);
  });

  it('should handle not found', () => {
    return request(server)
      .get('/unknownPath')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404);
  });

  it('should handle errors', () => {
    const router = express.Router();
    const errorMessage = 'Simulated unhandled error';
    router.use('/fail', explode(errorMessage));

    const server = setupServer(router);
    return request(server)
      .get('/fail')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        let { message } = res.body;
        expect(message).toEqual(errorMessage);
      });
  });

  // TODO check that the error has been logged
  it('should not attempt to send response twice on unhandled errors', () => {
    const router = express.Router();
    const errorMessage = 'Simulated unhandled error';

    router.use('/failOk', explodeAfterResponse(errorMessage));
    const server = setupServer(router);
    return request(server).get('/failOk').expect(200);
  });
});
