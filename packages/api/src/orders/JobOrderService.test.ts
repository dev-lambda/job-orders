import { JobErrorType, JobParams, JobStatus } from '@dev-lambda/job-orders-dto';
import { TestEmitterService } from './EmitterService';
import { JobEvents } from './JobEvents';
import { MemoryJobOrderRepository } from './JobOrderRepository';
import { JobOrderService } from './JobOrderService';
import { MemoryJobQueuer } from './JobQueuer';

describe('Job order request', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  it('Should create new orders', async () => {
    let type = 'MyJobType';
    let persistedJobOrder = await service.requestOrder(type, {});
    let { id } = persistedJobOrder;
    expect(id).not.toBeNull();
  });

  it(`Should create job orders on ${JobStatus.pending} status`, async () => {
    let type = 'MyJobType';
    let persistedJobOrder = await service.requestOrder(type, {});
    expect(persistedJobOrder.status).toEqual(JobStatus.pending);
  });

  it('Should honor params on job orders creation', async () => {
    let type = 'MyJobType';

    let params: JobParams = {
      maxRetry: 1,
      timeout: Math.floor(Math.random() * 1000),
      schedule: today,
      expiresAt: tomorrow,
    };
    let persistedJobOrder = await service.requestOrder(type, {}, params);
    expect(persistedJobOrder.params).toMatchObject(params);
  });

  it('Should persist new orders on creation', async () => {
    let type = 'MyJobType';
    let persistedJobOrder = await service.requestOrder(type, {});
    let { id, ...order } = persistedJobOrder;
    expect(id).not.toBeNull();

    let job = await repository.find(id);
    expect(job).toMatchObject(order);
  });

  it('Should queue job on new orders', async () => {
    let type = 'MyJobType';
    let persistedJobOrder = await service.requestOrder(type, {});
    let { id } = persistedJobOrder;

    expect(queuer.hasMessage(id)).toBeTruthy();
  });
});

describe('Job event emmission', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  let id: string;

  beforeEach(async () => {
    let type = 'MyJobType';
    let params: Partial<JobParams> = {
      expiresAt: tomorrow,
    };

    let persistedJobOrder = await service.requestOrder(type, {}, params);
    id = persistedJobOrder.id;
  });

  it(`Should emmit a ${JobEvents.requested} event on new orders`, async () => {
    expect(
      emitter
        .findByType(JobEvents.requested)
        .filter((event) => event.payload.id === id)
    ).toMatchObject([{ payload: { id } }]);
  });

  it(`Should emmit a ${JobEvents.cancelled} event on cancelled orders`, async () => {
    await service.cancelOrder(id);
    expect(
      emitter
        .findByType(JobEvents.cancelled)
        .filter((event) => event.payload.id === id)
    ).toMatchObject([{ payload: { id } }]);
  });

  it(`Should emmit a ${JobEvents.expired} event on cancelled orders`, async () => {
    await service.expireOrder(id, tomorrow);
    expect(
      emitter
        .findByType(JobEvents.expired)
        .filter((event) => event.payload.id === id)
    ).toMatchObject([{ payload: { id } }]);
  });

  it(`Should emmit a ${JobEvents.resumed} event on cancelled orders`, async () => {
    await service.cancelOrder(id);
    await service.resumeOrder(id);
    expect(
      emitter
        .findByType(JobEvents.resumed)
        .filter((event) => event.payload.id === id)
    ).toMatchObject([{ payload: { id } }]);
  });

  it(`Should emmit a ${JobEvents.started} event on started orders`, async () => {
    await service.startOrder(id);
    expect(
      emitter
        .findByType(JobEvents.started)
        .filter((event) => event.payload.id === id)
    ).toMatchObject([{ payload: { id } }]);
  });

  it(`Should emmit a ${JobEvents.success} event on completed orders`, async () => {
    await service.startOrder(id);
    await service.completeOrder(id, { message: 'done' });
    expect(
      emitter
        .findByType(JobEvents.success)
        .filter((event) => event.payload.id === id)
    ).toMatchObject([{ payload: { id } }]);
  });

  it(`Should emmit a ${JobEvents.error} event on errored orders`, async () => {
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: { message: 'oups' },
    });
    expect(
      emitter
        .findByType(JobEvents.error)
        .filter((event) => event.payload.id === id)
    ).toMatchObject([{ payload: { id } }]);
  });

  it(`Should emmit a ${JobEvents.unprocessable} event on unprocessable orders`, async () => {
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.unprocessable,
      payload: { message: 'oups' },
    });
    expect(
      emitter
        .findByType(JobEvents.unprocessable)
        .filter((event) => event.payload.id === id)
    ).toMatchObject([{ payload: { id } }]);
  });

  it(`Should emmit a ${JobEvents.maxErrors} event when too many errors`, async () => {
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: { message: 'oups' },
    });
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: { message: 'oups' },
    });
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: { message: 'oups' },
    });
    expect(
      emitter
        .findByType(JobEvents.maxErrors)
        .filter((event) => event.payload.id === id)
    ).toMatchObject([{ payload: { id } }]);
  });
});

describe('Job order transitions', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  let id: string;

  beforeEach(async () => {
    let type = 'MyJobType';
    let params: Partial<JobParams> = {
      expiresAt: tomorrow,
    };

    let persistedJobOrder = await service.requestOrder(type, {}, params);
    id = persistedJobOrder.id;
  });

  it('Should cancel a job order', async () => {
    let cancel = await service.cancelOrder(id);
    expect(cancel).toBe(true);
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.cancelled);
  });

  it('Should fail cancelling a cancelled job order', async () => {
    await service.cancelOrder(id);
    await expect(service.cancelOrder(id)).rejects.toThrow();
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.cancelled);
  });

  it('Should expire a job order', async () => {
    let expired = await service.expireOrder(id, tomorrow);
    expect(expired).toBe(true);
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.cancelled);
  });

  it('Should not expire a job order if expiration not reached', async () => {
    let expired = await service.expireOrder(id, today);
    expect(expired).toBe(false);
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.pending);
  });

  it('Should fail expiring a cancelled job order', async () => {
    await service.cancelOrder(id);
    await expect(service.expireOrder(id, tomorrow)).rejects.toThrow();
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.cancelled);
  });

  it('Should resume a cancelled job order', async () => {
    await service.cancelOrder(id);
    let resumed = await service.resumeOrder(id);
    expect(resumed).toBe(true);
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.pending);
  });

  it('Should fail resuming a pending job order', async () => {
    await expect(service.resumeOrder(id)).rejects.toThrow();
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.pending);
  });

  it('Should start a pending job order', async () => {
    let started = await service.startOrder(id);
    expect(started).toBe(true);
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.processing);
  });

  it('Should fail starting a cancelled job order', async () => {
    await service.cancelOrder(id);
    await expect(service.startOrder(id)).rejects.toThrow();
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.cancelled);
  });

  it('Should complete a processing job order', async () => {
    await service.startOrder(id);
    let completed = await service.completeOrder(id, { message: 'youhou !!' });
    expect(completed).toBe(true);
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.completed);
    expect(result.runs).toMatchObject([{ result: { message: 'youhou !!' } }]);
  });

  it('Should fail completing a cancelled job order', async () => {
    await service.cancelOrder(id);
    await expect(
      service.completeOrder(id, { message: 'youhou !!' })
    ).rejects.toThrow();
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.cancelled);
    expect(result.runs).toHaveLength(0);
  });

  it('Should fail completing a completed job order', async () => {
    await service.startOrder(id);
    await service.completeOrder(id, { message: 'youhou !!' });
    await expect(
      service.completeOrder(id, { message: 'youhou again ?!' })
    ).rejects.toThrow();
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.completed);
    expect(result.runs).toMatchObject([{ result: { message: 'youhou !!' } }]);
  });

  it('Should fail resuming a completed job order', async () => {
    await service.startOrder(id);
    await service.completeOrder(id, { message: 'youhou !!' });
    await expect(service.resumeOrder(id)).rejects.toThrow();
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.completed);
  });

  it('Should error a processing job order', async () => {
    await service.startOrder(id);
    let errored = await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: { message: 'oh no !!' },
    });
    expect(errored).toBe(true);
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.pending);
    expect(result.runs).toMatchObject([
      {
        error: {
          type: JobErrorType.error,
          payload: { message: 'oh no !!' },
        },
      },
    ]);
  });

  it('Should fail to error a pending job order', async () => {
    await expect(
      service.errorProcessingOrder(id, {
        type: JobErrorType.error,
        payload: { message: 'oh no !!' },
      })
    ).rejects.toThrow();
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.pending);
  });

  it('Should fail a job order on max retries', async () => {
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: { message: 'oh no !!' },
    });
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: { message: 'oh no 2 !!' },
    });
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: { message: 'oh no 3 !!' },
    });
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.failed);
    expect(result.runs).toMatchObject([
      {
        error: {
          type: JobErrorType.error,
          payload: { message: 'oh no !!' },
        },
      },
      {
        error: {
          type: JobErrorType.error,
          payload: { message: 'oh no 2 !!' },
        },
      },
      {
        error: {
          type: JobErrorType.error,
          payload: { message: 'oh no 3 !!' },
        },
      },
    ]);
  });

  it('Should fail an unprocessable job order', async () => {
    await service.startOrder(id);
    let errored = await service.errorProcessingOrder(id, {
      type: JobErrorType.unprocessable,
      payload: { message: 'oh no !!' },
    });
    expect(errored).toBe(true);
    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.failed);
    expect(result.runs).toMatchObject([
      {
        error: {
          type: JobErrorType.unprocessable,
          payload: { message: 'oh no !!' },
        },
      },
    ]);
  });

  it('Should resume a failed job order', async () => {
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.unprocessable,
      payload: { message: 'oh no !!' },
    });
    let resumed = await service.resumeOrder(id);
    expect(resumed).toBe(true);

    let result = await service.get(id);
    expect(result.status).toBe(JobStatus.pending);
  });
});

describe('Job order with failing queuer', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should not create new orders', async () => {
    queuer.queue = jest.fn(() => Promise.resolve(false));
    let type = 'MyJobType';
    await expect(service.requestOrder(type, {})).rejects.toThrow();
  });

  it('Should avoid persisting orders on queue fail', async () => {
    queuer.queue = jest.fn(() => Promise.resolve(false));
    let type = 'MyJobType';
    let createMock = jest.spyOn(repository, 'create');
    let deleteMock = jest.spyOn(repository, 'delete');
    await expect(service.requestOrder(type, {})).rejects.toThrow();
    expect(createMock).toHaveBeenCalledTimes(1);
    let createResult = await createMock.mock.results[0].value;
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toBeCalledWith(createResult.id);
    await expect(repository.find(createResult.id)).rejects.toThrow();
  });
});

describe('Job order with failing emitter', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  beforeEach(() => {
    emitter.toggleFail(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should not create new orders', async () => {
    let type = 'MyJobType';

    emitter.toggleFail(true); // Simulate emitter failure

    await expect(service.requestOrder(type, {})).rejects.toThrow();
  });

  it('Should avoid persisting orders on event fail', async () => {
    let type = 'MyJobType';
    let createMock = jest.spyOn(repository, 'create');
    let deleteMock = jest.spyOn(repository, 'delete');

    emitter.toggleFail(true); // Simulate emitter failure

    await expect(service.requestOrder(type, {})).rejects.toThrow();
    expect(createMock).toHaveBeenCalledTimes(1);
    let createResult = await createMock.mock.results[0].value;
    expect(deleteMock).toHaveBeenCalledTimes(1);
    expect(deleteMock).toBeCalledWith(createResult.id);
    await expect(repository.find(createResult.id)).rejects.toThrow();
  });

  it('Should avoid queuing orders on event fail', async () => {
    let type = 'MyJobType';
    let queueMock = jest.spyOn(queuer, 'queue');
    let unqueueMock = jest.spyOn(queuer, 'unqueue');

    emitter.toggleFail(true); // Simulate emitter failure

    await expect(service.requestOrder(type, {})).rejects.toThrow();
    expect(queueMock).toHaveBeenCalledTimes(1);
    let queueArgs = queueMock.mock.calls[0];
    expect(unqueueMock).toHaveBeenCalledTimes(1);
    expect(unqueueMock).toBeCalledWith(queueArgs[0]);
    expect(queuer.hasMessage(queueArgs[0])).toBe(false);
  });

  it('Should avoid cancelling orders on event fail', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {});

    emitter.toggleFail(true); // Simulate emitter failure

    await expect(service.cancelOrder(id)).rejects.toThrow();
    let order = await repository.find(id);
    expect(order.status).toBe(JobStatus.pending);
  });

  it('Should avoid expiring orders on event fail', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {}, { expiresAt: tomorrow });

    emitter.toggleFail(true); // Simulate emitter failure

    await expect(service.expireOrder(id, tomorrow)).rejects.toThrow();
    let order = await repository.find(id);
    expect(order.status).toBe(JobStatus.pending);
  });

  it('Should avoid expiring orders on event fail', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {}, { expiresAt: tomorrow });

    emitter.toggleFail(true); // Simulate emitter failure

    let initialOrder = structuredClone(await repository.find(id));
    await expect(service.expireOrder(id, tomorrow)).rejects.toThrow();
    let finalOrder = structuredClone(await repository.find(id));
    expect(finalOrder).toMatchObject(initialOrder);
  });

  it('Should avoid resuming orders on event fail', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {});
    await service.cancelOrder(id);

    emitter.toggleFail(true); // Simulate emitter failure

    let initialOrder = structuredClone(await repository.find(id));
    await expect(service.resumeOrder(id)).rejects.toThrow();
    let finalOrder = structuredClone(await repository.find(id));
    expect(finalOrder).toMatchObject(initialOrder);
  });

  it('Should avoid starting orders on event fail', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {});

    emitter.toggleFail(true); // Simulate emitter failure

    let initialOrder = structuredClone(await repository.find(id));
    await expect(service.startOrder(id)).rejects.toThrow();
    let finalOrder = structuredClone(await repository.find(id));
    expect(finalOrder).toMatchObject(initialOrder);
  });

  it('Should avoid completing orders on event fail', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {});
    await service.startOrder(id);

    emitter.toggleFail(true); // Simulate emitter failure

    let initialOrder = structuredClone(await repository.find(id));
    await expect(
      service.completeOrder(id, { message: 'success' })
    ).rejects.toThrow();
    let finalOrder = structuredClone(await repository.find(id));
    expect(finalOrder).toMatchObject(initialOrder);
  });

  it('Should avoid adding runs on completed orders if event fail', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {});
    await service.startOrder(id);

    emitter.toggleFail(true); // Simulate emitter failure

    let initialOrder = structuredClone(await repository.find(id));
    await expect(
      service.completeOrder(id, { message: 'success' })
    ).rejects.toThrow();
    let finalOrder = structuredClone(await repository.find(id));
    expect(finalOrder).toMatchObject(initialOrder);
  });

  it('Should avoid erroring orders on event fail', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {});
    await service.startOrder(id);

    emitter.toggleFail(true); // Simulate emitter failure

    let initialOrder = structuredClone(await repository.find(id));
    await expect(
      service.errorProcessingOrder(id, {
        type: JobErrorType.error,
        payload: {},
      })
    ).rejects.toThrow();
    let finalOrder = structuredClone(await repository.find(id));
    expect(finalOrder).toMatchObject(initialOrder);
  });

  it('Should avoid failing orders on event fail', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {});
    await service.startOrder(id);

    emitter.toggleFail(true); // Simulate emitter failure

    let initialOrder = structuredClone(await repository.find(id));
    await expect(
      service.errorProcessingOrder(id, {
        type: JobErrorType.unprocessable,
        payload: {},
      })
    ).rejects.toThrow();
    let finalOrder = structuredClone(await repository.find(id));
    expect(finalOrder).toMatchObject(initialOrder);
  });

  it('Should avoid failing orders on event fail (max retries)', async () => {
    let type = 'MyJobType';
    let { id } = await service.requestOrder(type, {});
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: {},
    });
    await service.startOrder(id);
    await service.errorProcessingOrder(id, {
      type: JobErrorType.error,
      payload: {},
    });
    await service.startOrder(id);

    emitter.toggleFail(true); // Simulate emitter failure

    let initialOrder = structuredClone(await repository.find(id));
    await expect(
      service.errorProcessingOrder(id, {
        type: JobErrorType.error,
        payload: {},
      })
    ).rejects.toThrow();
    let finalOrder = structuredClone(await repository.find(id));
    expect(finalOrder).toMatchObject(initialOrder);
  });
});

describe('Job not found', () => {
  const queuer = new MemoryJobQueuer();
  const emitter = new TestEmitterService();
  const repository = new MemoryJobOrderRepository();
  const service = new JobOrderService(repository, queuer, emitter);

  it('should fail cancelling', async () => {
    await expect(service.cancelOrder('42')).rejects.toThrow();
  });

  it('should fail expiring', async () => {
    await expect(service.expireOrder('42')).rejects.toThrow();
  });

  it('should fail resuming', async () => {
    await expect(service.resumeOrder('42')).rejects.toThrow();
  });

  it('should fail starting', async () => {
    await expect(service.startOrder('42')).rejects.toThrow();
  });

  it('should fail erroring', async () => {
    await expect(
      service.errorProcessingOrder('42', {
        type: JobErrorType.error,
        payload: {},
      })
    ).rejects.toThrow();
  });

  it('should fail completing', async () => {
    await expect(service.completeOrder('42', {})).rejects.toThrow();
  });

  it('should fail getting', async () => {
    await expect(service.get('42')).rejects.toThrow();
  });
});
