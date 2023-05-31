export enum ErrorType {
  'BadRequest' = 'BadRequest',
  'Unauthenticated' = 'Unauthenticated',
  'Forbidden' = 'Forbidden',
  'NotFound' = 'NotFound',
  'QuotaExceeded' = 'QuotaExceeded',
  'UnexpectedResponse' = 'UnexpectedResponse',
  'ServerError' = 'ServerError',
  'ConnectionError' = 'ConnectionError',
  'ClientError' = 'ClientError',
}

export class SDKError extends Error {
  type: ErrorType;
  constructor(type: ErrorType, cause?: Error) {
    super(type, { cause });
    this.type = type;
  }
}
