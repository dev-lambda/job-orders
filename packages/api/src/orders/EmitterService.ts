import { GenericPayload } from '@dev-lambda/job-orders-dto';

export interface EmitterService {
  shout(type: string, payload: GenericPayload): Promise<boolean>;
}

export interface Event {
  type: string;
  payload: GenericPayload;
}

export class TestEmitterService implements EmitterService {
  private events: Array<Event>;
  private success: boolean;
  constructor() {
    this.events = [];
    this.success = true;
  }

  shout(type: string, payload: GenericPayload): Promise<boolean> {
    if (!this.success) {
      return Promise.resolve(false);
    }
    this.events.push({ type, payload });
    return Promise.resolve(true);
  }

  toggleFail(fail: boolean) {
    this.success = !fail;
  }

  findByType(type: string): Array<Event> {
    return this.events.filter((event) => {
      return event.type === type;
    });
  }
}
