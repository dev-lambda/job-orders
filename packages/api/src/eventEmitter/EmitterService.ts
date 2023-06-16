export interface EmitterService<T, U> {
  shout(type: T, payload: U): Promise<Event<T, U>>;
}

export interface Event<T, U> {
  type: T;
  payload: U;
}
