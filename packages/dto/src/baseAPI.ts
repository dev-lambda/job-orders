export interface message {
  message: string;
}

export interface notFoundMessage extends message {
  path: string;
}
