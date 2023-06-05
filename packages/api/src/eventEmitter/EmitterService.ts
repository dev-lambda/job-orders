export interface EmitterService<T, U> {
  shout(type: T, payload: U): Promise<boolean>;
}

export interface Event<T, U> {
  type: T;
  payload: U;
}
