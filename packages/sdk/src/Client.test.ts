import { Client } from './Client';

describe('Api Client', () => {
  let baseURL = 'http://localhost:3000';

  it.skip('should get ok response', async () => {
    let client = new Client(baseURL /*{ logger }*/);
    let message = await client.ok();
    expect(message).toMatchObject({ message: 'ok' });
  });

  it.skip('should get health response', async () => {
    let client = new Client(baseURL /*{ logger }*/);
    let message = await client.health();
    expect(message).toMatchObject({ server: true, db: true });
  });
});
