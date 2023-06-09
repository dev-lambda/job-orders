import {
  GenericJobOrder,
  GenericPayload,
  JobError,
  JobParams,
  JobEvents,
  JobStatus,
} from '@dev-lambda/job-orders-dto';
import { JobOrderRepository } from '../repository/JobOrderRepository';
import { JobQueuer } from '../queuer/JobQueuer';
import { EmitterService } from '../eventEmitter/EmitterService';

// TODO use lock to make all operations atomic (concurrency safe)

export class JobOrderService {
  private static defaultParams: JobParams = {
    maxRetry: 3,
    timeout: 300, // 5 minutes
  };

  constructor(
    private repository: JobOrderRepository,
    private queuer: JobQueuer,
    private emitter: EmitterService<JobEvents, GenericPayload>
  ) {}

  async requestOrder(
    type: string,
    payload: GenericPayload,
    params: Partial<JobParams> = {}
  ) {
    let resolvedParams = { ...JobOrderService.defaultParams, ...params };
    let order: GenericJobOrder = {
      type,
      payload,
      params: resolvedParams,
      status: 'pending',
      runs: [],
    };
    let persistedJob = await this.repository.create(order);
    let { id } = persistedJob;
    let queued = await this.queuer.queue(
      persistedJob.id,
      resolvedParams.schedule
    );
    if (!queued) {
      await this.repository.delete(id);
      throw new Error(`Unabled to queue job ${id}`);
    }
    let event = await this.emitter.shout('jobRequested', {
      id,
      type,
    });
    if (!event) {
      await this.repository.delete(id);
      await this.queuer.unqueue(id);
      throw new Error(`Unabled to notify job event ${id}`);
    }
    return persistedJob;
  }

  async cancelOrder(id: string) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    if (status !== 'pending') {
      throw new Error(`Invalid order status, expecting pending, got ${status}`);
    }
    await this.queuer.unqueue(id);
    let event = await this.emitter.shout('jobCancelled', { id, type });
    if (!event) {
      // await this.repository.delete(id);
      // await this.queuer.unqueue(id);
      throw new Error(`Unabled to notify job event ${id}`);
    }
    return this.repository.setStatus(id, 'cancelled');
  }

  async startOrder(id: string) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    if (status !== 'pending') {
      throw new Error(`Invalid order status, expecting pending, got ${status}`);
    }
    let event = await this.emitter.shout('jobStarted', { id, type });
    if (!event) {
      throw new Error(`Unabled to notify job event ${id}`);
    }
    return await this.repository.setStatus(id, 'processing');
  }

  async errorProcessingOrder(id: string, error: JobError) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    if (status !== 'processing') {
      throw new Error(
        `Invalid order status, expecting processing, got ${status}`
      );
    }
    let { maxRetry } = order.params;
    let currentRetries = order.runs.length;

    let newStatus: JobStatus;
    if (error.type === 'unprocessable') {
      let event = await this.emitter.shout('jobUnprocessable', {
        id,
        type,
        error,
      });
      if (!event) {
        throw new Error(`Unabled to notify job event ${id}`);
      }
      newStatus = 'failed';
    } else if (currentRetries + 1 >= maxRetry) {
      let event = await this.emitter.shout('jobMaxErrorReached', {
        id,
        type,
        error,
      });
      if (!event) {
        throw new Error(`Unabled to notify job event ${id}`);
      }
      newStatus = 'failed';
    } else {
      let event = await this.emitter.shout('jobError', {
        id,
        type,
        error,
      });
      if (!event) {
        throw new Error(`Unabled to notify job event ${id}`);
      }
      newStatus = 'pending';
    }
    await this.repository.addRun(id, { error });
    return this.repository.setStatus(id, newStatus);
  }

  async resumeOrder(id: string) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    if (!['cancelled', 'failed'].includes(status)) {
      throw new Error(
        `Invalid order status, expecting cancelled or failed, got ${status}`
      );
    }
    let event = await this.emitter.shout('jobResumed', {
      id,
      type,
    });
    if (!event) {
      throw new Error(`Unabled to notify job event ${id}`);
    }
    return await this.repository.setStatus(id, 'pending');
  }

  async completeOrder(id: string, result: GenericPayload) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    if (status !== 'processing') {
      throw new Error(
        `Invalid order status, expecting processing, got ${status}`
      );
    }
    let event = await this.emitter.shout('jobSuccess', {
      id,
      type,
      result,
    });
    if (!event) {
      throw new Error(`Unabled to notify job event ${id}`);
    }
    /*let updatedOrder =*/ await this.repository.addRun(id, { result });
    return this.repository.setStatus(id, 'completed');
  }

  async expireOrder(id: string, asOf: Date = new Date()) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    let { expiresAt } = order.params;
    if (status !== 'pending') {
      throw new Error(`Invalid order status, expecting pending, got ${status}`);
    }
    if (expiresAt && expiresAt <= asOf) {
      await this.queuer.unqueue(id);
      let event = await this.emitter.shout('jobExpired', {
        id,
        type,
        asOf,
      });
      if (!event) {
        throw new Error(`Unabled to notify job event ${id}`);
      }
      return this.repository.setStatus(id, 'cancelled');
    }
    return false;
  }

  async get(id: string) {
    return this.repository.find(id).catch((e) => {
      throw new Error('not found', e);
    });
  }
}
