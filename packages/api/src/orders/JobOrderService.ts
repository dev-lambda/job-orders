import {
  GenericJobOrder,
  GenericPayload,
  JobError,
  JobErrorType,
  JobParams,
  JobStatus,
} from '@dev-lambda/job-orders-dto';
import { JobOrderRepository } from './JobOrderRepository';
import { JobQueuer } from './JobQueuer';
import { EmitterService } from './EmitterService';
import { JobEvents } from './JobEvents';

// TODO use lock to make all operations atomic (concurrency safe)

export class JobOrderService {
  private static defaultParams: JobParams = {
    maxRetry: 3,
    timeout: 300, // 5 minutes
  };

  constructor(
    private repository: JobOrderRepository,
    private queuer: JobQueuer,
    private emitter: EmitterService
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
      status: JobStatus.pending,
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
    let event = await this.emitter.shout(JobEvents.requested, {
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
    if (status !== JobStatus.pending) {
      throw new Error(`Invalid order status, expecting pending, got ${status}`);
    }
    await this.queuer.unqueue(id);
    let event = await this.emitter.shout(JobEvents.cancelled, { id, type });
    if (!event) {
      // await this.repository.delete(id);
      // await this.queuer.unqueue(id);
      throw new Error(`Unabled to notify job event ${id}`);
    }
    return this.repository.setStatus(id, JobStatus.cancelled);
  }

  async startOrder(id: string) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    if (status !== JobStatus.pending) {
      throw new Error(`Invalid order status, expecting pending, got ${status}`);
    }
    let event = await this.emitter.shout(JobEvents.started, { id, type });
    if (!event) {
      throw new Error(`Unabled to notify job event ${id}`);
    }
    return await this.repository.setStatus(id, JobStatus.processing);
  }

  async errorProcessingOrder(id: string, error: JobError) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    if (status !== JobStatus.processing) {
      throw new Error(
        `Invalid order status, expecting processing, got ${status}`
      );
    }
    let { maxRetry } = order.params;
    let currentRetries = order.runs.length;

    let newStatus: JobStatus;
    if (error.type === JobErrorType.unprocessable) {
      let event = await this.emitter.shout(JobEvents.unprocessable, {
        id,
        type,
        error,
      });
      if (!event) {
        throw new Error(`Unabled to notify job event ${id}`);
      }
      newStatus = JobStatus.failed;
    } else if (currentRetries + 1 >= maxRetry) {
      let event = await this.emitter.shout(JobEvents.maxErrors, {
        id,
        type,
        error,
      });
      if (!event) {
        throw new Error(`Unabled to notify job event ${id}`);
      }
      newStatus = JobStatus.failed;
    } else {
      let event = await this.emitter.shout(JobEvents.error, {
        id,
        type,
        error,
      });
      if (!event) {
        throw new Error(`Unabled to notify job event ${id}`);
      }
      newStatus = JobStatus.pending;
    }
    await this.repository.addRun(id, { error });
    return this.repository.setStatus(id, newStatus);
  }

  async resumeOrder(id: string) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    if (![JobStatus.cancelled, JobStatus.failed].includes(status)) {
      throw new Error(
        `Invalid order status, expecting cancelled or failed, got ${status}`
      );
    }
    let event = await this.emitter.shout(JobEvents.resumed, {
      id,
      type,
    });
    if (!event) {
      throw new Error(`Unabled to notify job event ${id}`);
    }
    return await this.repository.setStatus(id, JobStatus.pending);
  }

  async completeOrder(id: string, result: GenericPayload) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    if (status !== JobStatus.processing) {
      throw new Error(
        `Invalid order status, expecting processing, got ${status}`
      );
    }
    let event = await this.emitter.shout(JobEvents.success, {
      id,
      type,
      result,
    });
    if (!event) {
      throw new Error(`Unabled to notify job event ${id}`);
    }
    /*let updatedOrder =*/ await this.repository.addRun(id, { result });
    return this.repository.setStatus(id, JobStatus.completed);
  }

  async expireOrder(id: string, asOf: Date = new Date()) {
    let order = await this.repository.find(id);
    let { status, type } = order;
    let { expiresAt } = order.params;
    if (status !== JobStatus.pending) {
      throw new Error(`Invalid order status, expecting pending, got ${status}`);
    }
    if (expiresAt && expiresAt <= asOf) {
      await this.queuer.unqueue(id);
      let event = await this.emitter.shout(JobEvents.expired, {
        id,
        type,
        asOf,
      });
      if (!event) {
        throw new Error(`Unabled to notify job event ${id}`);
      }
      return this.repository.setStatus(id, JobStatus.cancelled);
    }
    return false;
  }

  async get(id: string) {
    return this.repository.find(id);
  }
}
