import { EmitterService, Event } from './EmitterService';

export class StdOutEmitterService<T, U> implements EmitterService<T, U> {
  shout(type: T, payload: U): Promise<Event<T, U>> {
    let event: Event<T, U> = { type, payload };
    console.log();
    return Promise.resolve(event);
  }
}
