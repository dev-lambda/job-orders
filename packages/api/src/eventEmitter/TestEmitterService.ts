import { EmitterService, Event } from './EmitterService';
import { GenericPayload, JobEvents } from '@dev-lambda/job-orders-dto';

// prettier-ignore
export class TestEmitterService implements EmitterService<JobEvents, GenericPayload> {
  private events: Array<Event<JobEvents, GenericPayload>>;
  private success: boolean;
  constructor() {
    this.events = [];
    this.success = true;
  }
  shout(type: JobEvents, payload: GenericPayload): Promise<boolean> {
    if (!this.success) {
      return Promise.resolve(false);
    }
    this.events.push({ type, payload });
    return Promise.resolve(true);
  }

  toggleFail(fail: boolean) {
    this.success = !fail;
  }

  findByType(type: JobEvents): Array<Event<JobEvents, GenericPayload>> {
    return this.events.filter((event) => {
      return event.type === type;
    });
  }
}
