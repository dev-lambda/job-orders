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
  shout(type: JobEvents, payload: GenericPayload): Promise<Event<JobEvents, GenericPayload>> {
    if (!this.success) {
      return Promise.reject(new Error('Event emission unavailable'));
    }
    const event: Event<JobEvents, GenericPayload> = { type, payload };
    this.events.push(event);
    return Promise.resolve(event);
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
