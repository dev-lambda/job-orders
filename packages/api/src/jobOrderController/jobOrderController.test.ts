import request from 'supertest';
import jobOrderController from './jobOrderController';
import { setupServer } from 'src/server';
import { MemoryJobQueuer } from 'src/queuer/MemoryJobQueuer';
import { TestEmitterService } from 'src/eventEmitter/TestEmitterService';
import { MemoryJobOrderRepository } from 'src/repository/MemoryJobOrderRepository';
import { JobOrderService } from 'src/jobOrderService/JobOrderService';
import {
  JobParams,
  ValidationError,
  ValidationErrorSchema,
  Message,
  MessageSchema,
  notFoundMessage,
  notFoundMessageSchema,
  JobOrderInvalidTransitionSchema,
  JobOrderInvalidTransition,
  JobStatus,
} from '@dev-lambda/job-orders-dto';
import {
  PersistedJobOrder,
  PersistedJobOrderSchema,
} from 'src/repository/JobOrderRepository';

describe('Job order controller: creation', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const basePath = '';
  const server = setupServer(jobOrderController({ basePath, service }));

  it('should create a job order', async () => {
    let type = 'dummyJob';
    await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        expect(jobOrder).toHaveProperty('id');
      });
  });

  it('should create a job order with a valid payload', async () => {
    let type = 'dummyJob';
    let payload = { dummyInfo: 'some value' };
    await request(server)
      .post(`/${type}`)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        expect(jobOrder.payload).toMatchObject(payload);
      });
  });

  it('should fail creating a job order with an invalid payload', async () => {
    let type = 'dummyJob';
    let payload = [{ dummyInfo: 'some value' }];
    await request(server)
      .post(`/${type}`)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        let errorList: ValidationError = ValidationErrorSchema.parse(res.body);
        expect(errorList).toMatchObject([
          {
            // message: 'Expected object, received array',
            message: /.*/,
            code: 'invalid_type',
            expected: 'object',
            path: ['body'],
            received: 'array',
          },
        ]);
      });
  });

  it('should create a job order with custom parameters', async () => {
    let type = 'dummyJob';
    let params: JobParams = {
      maxRetry: 2,
      timeout: 200,
      expiresAt: new Date('2023-12-31'),
      schedule: new Date('2023-01-01'),
    };
    await request(server)
      .post(`/${type}`)
      .query(params)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        expect(jobOrder.params).toMatchObject(params);
      });
  });

  it('should fail creating a job order with invalid parameters', async () => {
    let type = 'dummyJob';
    let params = {
      maxRetry: 'toto', // invalid parameter
      timeout: 200,
      expiresAt: new Date('2023-12-31'),
      schedule: new Date('2023-01-01'),
    };
    await request(server)
      .post(`/${type}`)
      .query(params)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(400)
      .then((res) => {
        let errorList: ValidationError = ValidationErrorSchema.parse(res.body);
        expect(errorList).toMatchObject([
          {
            // message: 'Expected number, received nan',
            message: /.*/,
            code: 'invalid_type',
            expected: 'number',
            path: ['query', 'maxRetry'],
            received: 'nan',
          },
        ]);
      });
  });
});

describe('Job order controller: find', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const basePath = '';
  const server = setupServer(jobOrderController({ basePath, service }));
  it('should find an existing job order', async () => {
    let type = 'dummyJob';

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server)
      .get(`/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        expect(jobOrder).toMatchObject({
          id,
          type,
        });
      });
  });

  it('should not find a missing job order', async () => {
    let id = 'notAJob';
    await request(server)
      .get(`/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        let error: notFoundMessage = notFoundMessageSchema.parse(res.body);
        expect(error).toMatchObject({
          params: { id },
        });
      });
  });
});

describe('Job order controller: cancel', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const basePath = '';
  const server = setupServer(jobOrderController({ basePath, service }));
  it('should cancel an pending job order', async () => {
    let type = 'dummyJob';

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server)
      .put(`/${id}/cancel`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        expect(jobOrder).toMatchObject({
          id,
          type,
          status: 'cancelled',
        });
      });
  });

  it('should fail cancelling a missing job order', async () => {
    let id = 'notAJob';
    await request(server)
      .put(`/${id}/cancel`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        let error: notFoundMessage = notFoundMessageSchema.parse(res.body);
        expect(error).toMatchObject({
          params: { id },
        });
      });
  });

  it('should fail cancelling a started job order', async () => {
    let type = 'dummyJob';
    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    let status: JobStatus = await request(server)
      .put(`/${id}/start`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.status;
      });

    await request(server)
      .put(`/${id}/cancel`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(409)
      .then((res) => {
        let error: JobOrderInvalidTransition =
          JobOrderInvalidTransitionSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Invalid job status transition',
          message: /.*/,
          from: status, // 'processing'
          to: 'cancelled',
          expectingFrom: ['pending'],
        });
      });
  });
});

describe('Job order controller: resume', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const basePath = '';
  const server = setupServer(jobOrderController({ basePath, service }));
  it('should resume an cancelled job order', async () => {
    let type = 'dummyJob';

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server)
      .put(`/${id}/cancel`)
      .set('Accept', 'application/json');

    await request(server)
      .put(`/${id}/resume`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        expect(jobOrder).toMatchObject({
          id,
          type,
          status: 'pending',
        });
      });
  });

  it('should fail resuming a missing job order', async () => {
    let id = 'notAJob';
    await request(server)
      .put(`/${id}/resume`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        let error: notFoundMessage = notFoundMessageSchema.parse(res.body);
        expect(error).toMatchObject({
          params: { id },
        });
      });
  });

  it('should fail resuming a started job order', async () => {
    let type = 'dummyJob';
    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    let status: JobStatus = await request(server)
      .put(`/${id}/start`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.status;
      });

    await request(server)
      .put(`/${id}/resume`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(409)
      .then((res) => {
        let error: JobOrderInvalidTransition =
          JobOrderInvalidTransitionSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Invalid job status transition',
          message: /.*/,
          from: status,
          to: 'pending',
          expectingFrom: ['cancelled', 'failed'],
        });
      });
  });
});

describe('Job order controller: start', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const basePath = '';
  const server = setupServer(jobOrderController({ basePath, service }));
  it('should start a pending job order', async () => {
    let type = 'dummyJob';

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server)
      .put(`/${id}/start`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        expect(jobOrder).toMatchObject({
          id,
          type,
          status: 'processing',
        });
      });
  });

  it('should fail starting a missing job order', async () => {
    let id = 'notAJob';
    await request(server)
      .put(`/${id}/start`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        let error: notFoundMessage = notFoundMessageSchema.parse(res.body);
        expect(error).toMatchObject({
          params: { id },
        });
      });
  });

  it('should fail starting a cancelled job order', async () => {
    let type = 'dummyJob';
    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    let status: JobStatus = await request(server)
      .put(`/${id}/cancel`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.status;
      });

    await request(server)
      .put(`/${id}/start`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(409)
      .then((res) => {
        let error: JobOrderInvalidTransition =
          JobOrderInvalidTransitionSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Invalid job status transition',
          message: /.*/,
          from: status, // 'cancelled'
          to: 'processing',
          expectingFrom: ['pending'],
        });
      });
  });
});

describe('Job order controller: complete', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const basePath = '';
  const server = setupServer(jobOrderController({ basePath, service }));
  it('should complete a started job order', async () => {
    let type = 'dummyJob';
    let payload = { result: 'some value' };

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server).put(`/${id}/start`).set('Accept', 'application/json');

    await request(server)
      .put(`/${id}/complete`)
      .set('Accept', 'application/json')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        expect(jobOrder).toMatchObject({
          id,
          type,
          status: 'completed',
        });
      });
  });

  it('should fail completing a job order with an invalid payload', async () => {
    let type = 'dummyJob';
    let payload = [{ result: 'some value' }];

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server).put(`/${id}/start`).set('Accept', 'application/json');

    await request(server)
      .put(`/${id}/complete`)
      .set('Accept', 'application/json')
      .send(payload)
      .expect(400)
      .then((res) => {
        let errorList: ValidationError = ValidationErrorSchema.parse(res.body);
        expect(errorList).toMatchObject([
          {
            // message: 'Expected object, received array',
            message: /.*/,
            code: 'invalid_type',
            expected: 'object',
            path: ['body'],
            received: 'array',
          },
        ]);
      });
  });

  it('should fail completing a missing job order', async () => {
    let id = 'notAJob';
    let payload = { result: 'some value' };

    await request(server)
      .put(`/${id}/complete`)
      .set('Accept', 'application/json')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        let error: notFoundMessage = notFoundMessageSchema.parse(res.body);
        expect(error).toMatchObject({
          params: { id },
        });
      });
  });

  it('should fail completing a cancelled job order', async () => {
    let type = 'dummyJob';
    let payload = { result: 'some value' };

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    let status: JobStatus = await request(server)
      .put(`/${id}/cancel`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.status;
      });

    await request(server)
      .put(`/${id}/complete`)
      .set('Accept', 'application/json')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(409)
      .then((res) => {
        let error: JobOrderInvalidTransition =
          JobOrderInvalidTransitionSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Invalid job status transition',
          message: /.*/,
          from: status, // 'cancelled'
          to: 'completed',
          expectingFrom: ['processing'],
        });
      });
  });
});

describe('Job order controller: error', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const basePath = '';
  const server = setupServer(jobOrderController({ basePath, service }));
  it('should error a started job order', async () => {
    let type = 'dummyJob';
    let error = {
      type: 'unprocessable',
      payload: { reason: 'something went wrong' },
    };

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server).put(`/${id}/start`).set('Accept', 'application/json');

    await request(server)
      .put(`/${id}/error`)
      .set('Accept', 'application/json')
      .send(error)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        expect(jobOrder).toMatchObject({
          id,
          type,
          status: 'failed',
        });
      });
  });

  it('should fail erroring a job order with an invalid payload', async () => {
    let type = 'dummyJob';
    let error = [
      {
        type: 'unprocessable',
        payload: { reason: 'something went wrong' },
      },
    ];

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server).put(`/${id}/start`).set('Accept', 'application/json');

    await request(server)
      .put(`/${id}/error`)
      .set('Accept', 'application/json')
      .send(error)
      .expect(400)
      .then((res) => {
        let errorList: ValidationError = ValidationErrorSchema.parse(res.body);
        expect(errorList).toMatchObject([
          {
            // message: 'Expected object, received array',
            message: /.*/,
            code: 'invalid_type',
            expected: 'object',
            path: ['body'],
            received: 'array',
          },
        ]);
      });
  });

  it('should fail erroring a missing job order', async () => {
    let id = 'notAJob';
    let error = {
      type: 'unprocessable',
      payload: { reason: 'something went wrong' },
    };

    await request(server)
      .put(`/${id}/error`)
      .set('Accept', 'application/json')
      .send(error)
      .expect('Content-Type', /json/)
      .expect(404)
      .then((res) => {
        let error: notFoundMessage = notFoundMessageSchema.parse(res.body);
        expect(error).toMatchObject({
          params: { id },
        });
      });
  });

  it('should fail erroring a cancelled job order', async () => {
    let type = 'dummyJob';
    let error = {
      type: 'unprocessable',
      payload: { reason: 'something went wrong' },
    };

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    let status: JobStatus = await request(server)
      .put(`/${id}/cancel`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.status;
      });

    await request(server)
      .put(`/${id}/error`)
      .set('Accept', 'application/json')
      .send(error)
      .expect('Content-Type', /json/)
      .expect(409)
      .then((res) => {
        let error: JobOrderInvalidTransition =
          JobOrderInvalidTransitionSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Invalid job status transition',
          message: /.*/,
          from: status, // 'cancelled'
          to: 'failed',
          expectingFrom: ['processing'],
        });
      });
  });
});

describe('Job order controller: failing events', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const basePath = '';
  const server = setupServer(jobOrderController({ basePath, service }));

  beforeEach(() => {
    emitter.toggleFail(false);
  });

  it('should report job order creation server error', async () => {
    let type = 'dummyJob';
    emitter.toggleFail(true);
    await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        let error: Message = MessageSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Unable to notify job event',
          message: /.*/,
        });
      });
  });

  it('should report job order cancelling server error', async () => {
    let type = 'dummyJob';

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    emitter.toggleFail(true);
    await request(server)
      .put(`/${id}/cancel`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        let error: Message = MessageSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Unable to notify job event',
          message: /.*/,
        });
      });
  });

  it('should report job order resume server error', async () => {
    let type = 'dummyJob';

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server)
      .put(`/${id}/cancel`)
      .set('Accept', 'application/json');

    emitter.toggleFail(true);
    await request(server)
      .put(`/${id}/resume`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        let error: Message = MessageSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Unable to notify job event',
          message: /.*/,
        });
      });
  });

  it('should report job order start server error', async () => {
    let type = 'dummyJob';

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    emitter.toggleFail(true);
    await request(server)
      .put(`/${id}/start`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        let error: Message = MessageSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Unable to notify job event',
          message: /.*/,
        });
      });
  });

  it('should report job order complete server error', async () => {
    let type = 'dummyJob';
    let payload = { result: 'some value' };

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server).put(`/${id}/start`).set('Accept', 'application/json');

    emitter.toggleFail(true);
    await request(server)
      .put(`/${id}/complete`)
      .set('Accept', 'application/json')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        let error: Message = MessageSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Unable to notify job event',
          message: /.*/,
        });
      });
  });

  it('should report job order complete server error', async () => {
    let type = 'dummyJob';
    let error = {
      type: 'unprocessable',
      payload: { reason: 'something went wrong' },
    };

    let id: string = await request(server)
      .post(`/${type}`)
      .set('Accept', 'application/json')
      .then((res) => {
        let jobOrder: PersistedJobOrder = PersistedJobOrderSchema.parse(
          res.body
        );
        return jobOrder.id;
      });

    await request(server).put(`/${id}/start`).set('Accept', 'application/json');

    emitter.toggleFail(true);
    await request(server)
      .put(`/${id}/error`)
      .set('Accept', 'application/json')
      .send(error)
      .expect('Content-Type', /json/)
      .expect(500)
      .then((res) => {
        let error: Message = MessageSchema.parse(res.body);
        expect(error).toMatchObject({
          // message: 'Unable to notify job event',
          message: /.*/,
        });
      });
  });
});
