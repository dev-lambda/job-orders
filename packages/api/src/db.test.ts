import initdb from './db';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('db connection', () => {
  let dbServer: MongoMemoryServer;
  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
  });

  afterAll(() => {
    dbServer.stop();
  });

  it('should connect to a running db', async () => {
    const dbHost: string = dbServer.getUri();
    const connection = await initdb(dbHost);
    expect(connection.readyState).toBe(mongoose.ConnectionStates.connected);
    connection.close();
  });
});
