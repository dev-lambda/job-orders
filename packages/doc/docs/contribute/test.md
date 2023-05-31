---
sidebar_position: 4
---

# Test guidelines and tooling

:::tip
## Test functionality not implementation

Implementation should change, tests should warn you when the functionality is broken.
:::

### Unit tests

- `jest`

```ts title="foo.ts"
export const bar = (value: number) => {
  return value+1;
}
```

```ts title="foo.test.ts"
import {bar} from './foo';

describe('foo module', () => {
  it('should work as expected', () => {
    expect(bar(0)).toBe(1);
  });
});
```

### API tests

- `supertest`

```ts title="myRouter.ts"
import express from 'express';
import doc from './base/apiDoc';
import license from './base/licence';

const router = express.Router();

router.get('/foo', (req, res) => {
  res.status(200).send({value: 42})
});

export default router;
```

```ts title="myRouter.test.ts"
import request from 'supertest';
import router from './myRouter';
import { setupServer } from 'src/server';

const server = setupServer(app);

describe('My router', () => {
  it('should give the correct response', () => {
    return request(server).get('/foo')
      .expect(200)
      .then(res => {
        expect(res.body).toMatchObject({value: 42})
      })
  });
});
```

### Persistency tests

- `mongodb-memory-server`

```ts title="someRepository.ts"
import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name: 'string' });
export const User = mongoose.model('User', schema);
```

```ts title="someRepository.test.ts"
import initdb from 'src/db';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from './someRepository';

describe('db connection', () => {
  let dbServer: MongoMemoryServer;
  let connection: mongoose.Connection;
  
  beforeAll(async () => {
    dbServer = await MongoMemoryServer.create();
    connection = await initdb(dbServer.getUri());
  });

  afterAll(() => {
    connection.close();
    dbServer.stop();
  });

  it('should insert a doc into collection', async () => {
    const mockUser = { name: 'John' };
    const user = new User(mockUser);
    const { _id } = await user.save();

    const insertedUser = await User.findOne({ _id });
    expect(insertedUser).toMatchObject(mockUser);
  });
});
```

## Test setup

See `jest.config.ts` for test settings.

Test configuration options are defined in `config/test.yaml` and can be optionally overriden in `config/local-test.yaml`.

## Coverage and Qualimetry

Coverage report is generated when running tests and it's available under the `coverage` folder (see `coverage/lcov-report/index.html` for a comprehensive report)

TODO setup sonarqube