import {
  GenericJobOrder,
  GenericPayload,
  JobError,
  JobParams,
  JobEvents,
  JobStatus,
} from '@dev-lambda/job-orders-dto';
import {
  JobOrderRepository,
  PersistedJobOrder,
} from '../repository/JobOrderRepository';
import { JobQueuer } from '../queuer/JobQueuer';
import { EmitterService } from '../eventEmitter/EmitterService';

// TODO use lock to make all operations atomic (concurrency safe)

export class JobOrderUnableToNotify extends Error {
  constructor(
    message: string,
    readonly type: JobEvents,
    readonly payload: GenericPayload,
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}

export class JobOrderUnableToQueue extends Error {}

export class JobOrderNotFound extends Error {
  constructor(message: string, readonly id: string, options?: ErrorOptions) {
    super(message, options);
  }
}

export class JobOrderInvalidTransition extends Error {
  constructor(
    message: string,
    readonly from: JobStatus,
    readonly to: JobStatus,
    readonly expected: JobStatus[],
    options?: ErrorOptions
  ) {
    super(message, options);
  }
}

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

  private async transitionIf(
    id: string,
    to: JobStatus | ((order: GenericJobOrder) => JobStatus),
    from: JobStatus[],
    callback: (order: GenericJobOrder, to: JobStatus) => Promise<boolean>
  ): Promise<PersistedJobOrder> {
    let order = await this.get(id);
    let { status } = order;

    let resolvedTo: JobStatus;
    if (typeof to === 'string') {
      resolvedTo = to;
    } else {
      resolvedTo = to(order);
    }

    if (!from.includes(status)) {
      throw new JobOrderInvalidTransition(
        'Invalid order status',
        status, // actual from
        resolvedTo,
        from // expected from
      );
    }

    return callback(order, resolvedTo).then((success) => {
      if (success) {
        return this.repository.setStatus(id, resolvedTo);
      }
      return order;
    });
  }

  private async notify(
    eventType: JobEvents,
    payload: GenericPayload
  ): Promise<boolean> {
    return this.emitter
      .shout(eventType, payload)
      .catch((cause) => {
        throw new JobOrderUnableToNotify(
          'Unable to notify job event',
          eventType,
          payload,
          { cause }
        );
      })
      .then(() => true);
  }

  async requestOrder(
    type: string,
    payload: GenericPayload,
    params: Partial<JobParams> = {}
  ): Promise<PersistedJobOrder> {
    let resolvedParams = { ...JobOrderService.defaultParams, ...params };
    let order: GenericJobOrder = {
      type,
      payload,
      params: resolvedParams,
      status: 'creating',
      runs: [],
    };
    let persistedJob = await this.repository.create(order);
    let { id } = persistedJob;

    return this.transitionIf(
      id,
      'pending',
      ['creating'],
      async ({ type, params }) => {
        await this.queuer.queue(id, params.schedule).catch((cause) => {
          throw new JobOrderUnableToQueue(`Unable to queue job ${id}`, {
            cause,
          });
        });
        return this.notify('jobRequested', { id, type }).catch((error) => {
          this.queuer.unqueue(id); // attempt to clean queue
          throw error;
        });
      }
    );
  }

  // prettier-ignore
  cancelOrder(id: string): Promise<PersistedJobOrder> {
    return this.transitionIf(
      id,
      'cancelled',
      ['pending'],
      ({type}) => this.notify('jobCancelled', { id, type })
    );
  }

  // prettier-ignore
  startOrder(id: string): Promise<PersistedJobOrder> {
    return this.transitionIf(
      id,
      'processing',
      ['pending'],
      ({type}) => this.notify('jobStarted', { id, type })
    );
  }

  // prettier-ignore
  errorProcessingOrder(id: string, error: JobError): Promise<PersistedJobOrder> {
    const transitionStatus = ({ runs, params }: GenericJobOrder): JobStatus => {
      let { maxRetry } = params;
      let currentRetries = runs.length;
      if (error.type === 'unprocessable' || currentRetries + 1 >= maxRetry) {
        return 'failed';
      }
      return 'pending';
    };

    return this.transitionIf(
      id,
      transitionStatus,
      ['processing'],
      async ({ type, runs, params }): Promise<boolean> => {
        let { maxRetry } = params;
        let currentRetries = runs.length;
        let event: JobEvents = 'jobError';
        if (error.type === 'unprocessable') {
          event = 'jobUnprocessable';
        }
        else if (currentRetries + 1 >= maxRetry) {
          event = 'jobMaxErrorReached';
        }
        await this.notify(event, { id, type, error });
        await this.repository.addRun(id, { error });
        return true;
      }
    );
  }

  // prettier-ignore
  resumeOrder(id: string): Promise<PersistedJobOrder> {
    return this.transitionIf(
      id,
      'pending',
      ['cancelled', 'failed'],
      ({ type }) => this.notify('jobResumed', { id, type })
    );
  }

  // prettier-ignore
  completeOrder(id: string, result: GenericPayload): Promise<PersistedJobOrder> {
    return this.transitionIf(
      id,
      'completed',
      ['processing'],
      async ({type}): Promise<boolean> => {
        await this.notify('jobSuccess', { id, type, result });
        await this.repository.addRun(id, { result });
        return true;
      }
    );
  }

  // prettier-ignore
  expireOrder(id: string, asOf: Date = new Date()): Promise<PersistedJobOrder> {
    return this.transitionIf(
      id,
      'cancelled',
      ['pending'],
      async ({ type, params }): Promise<boolean> => {
        let { expiresAt } = params;
        if (expiresAt && expiresAt <= asOf) {
          return this.notify('jobExpired', { id, type });
        }
        return Promise.resolve(false);
      }
    );
  }

  async get(id: string): Promise<PersistedJobOrder> {
    return this.repository.find(id).catch((cause) => {
      throw new JobOrderNotFound('Not found', id, { cause });
    });
  }
}
