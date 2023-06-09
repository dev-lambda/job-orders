import { EmitterService } from './EmitterService';

export class StdOutEmitterService<T, U> implements EmitterService<T, U> {
  shout(type: T, payload: U): Promise<boolean> {
    console.log({ type, payload });
    return Promise.resolve(true);
  }
}
