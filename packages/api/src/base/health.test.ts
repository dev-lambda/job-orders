import { Router } from 'express';
import request from 'supertest';
import { health } from './health';
import { setupServer } from 'src/server';
import initdb from 'src/db';
import init from 'src/server';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Health check', () => {
  let dbServer: MongoMemoryServer;
  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
  });

  afterAll(() => {
    dbServer.stop();
  });

  it('should give ok for a running server', async () => {
    const router = Router();
    router.use('/health', health);

    const server = setupServer(router);

    // make sure db is running
    const dbHost: string = dbServer.getUri();
    const connection = await initdb(dbHost);
    expect(connection.readyState).toBe(mongoose.ConnectionStates.connected);

    // make sure server has been initialized
    const instance = await init(null, { port: 3501 });
    expect(instance.address).not.toBeUndefined();

    return request(server)
      .get('/health')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toMatchObject({ server: true, db: true });
      })
      .finally(() => {
        instance.close();
        connection.close();
      });
  });

  it('should detect missing db', async () => {
    const router = Router();
    router.use('/health', health);

    const server = setupServer(router);

    // make sure server has been initialized
    const instance = await init(null, { port: 3501 });
    expect(instance.address).not.toBeUndefined();

    return request(server)
      .get('/health')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        expect(res.body).toMatchObject({ server: true, db: false });
      })
      .finally(() => {
        instance.close();
      });
  });
});
