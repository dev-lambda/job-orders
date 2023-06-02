export interface message {
  message: string;
}

export interface notFoundMessage extends message {
  path: string;
}

export interface healtStatus {
  server: boolean;
  db: boolean;
}
