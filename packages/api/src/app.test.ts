import request from 'supertest';
import app from './app';
import { setupServer } from './server';

const server = setupServer(app);

describe('app server', () => {
  it('does nothing for now', () => {
    return request(server).get('/').expect(200);
  });
});
