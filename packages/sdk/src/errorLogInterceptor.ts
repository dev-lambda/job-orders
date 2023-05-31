import axios from 'axios';
import { ClientName } from './Client';
import { Logger } from './LoggerInterface';
import { SDKError, ErrorType } from './SDKError';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorLogInterceptor = (logger: Logger) => (error: any) => {
  if (error.response) {
    let response = error.response as axios.AxiosResponse;
    let { status } = response;
    if (status < 500) {
      // 4xx
      logger.warn(
        `[${ClientName}] Unexpected error response: ${response.config.url} ${status}`
      );
      switch (status) {
        case 400:
          throw new SDKError(ErrorType.BadRequest, error);
        case 401:
          throw new SDKError(ErrorType.Unauthenticated, error);
        case 403:
          throw new SDKError(ErrorType.Forbidden, error);
        case 404:
          throw new SDKError(ErrorType.NotFound, error);
        case 429:
          throw new SDKError(ErrorType.QuotaExceeded, error);
        default:
          throw new SDKError(ErrorType.UnexpectedResponse, error);
      }
    } else {
      // 5xx
      logger.error(
        `[${ClientName}] Server error: ${response.config.url} ${status}`
      );
      throw new SDKError(ErrorType.ServerError, error);
    }
  } else if (error.config) {
    let config = error.config as axios.AxiosRequestConfig;
    logger.error(`[${ClientName}] Connection error: ${config.url}`, error);
    throw new SDKError(ErrorType.ConnectionError, error);
  } else {
    logger.error(`[${ClientName}] Internal client error`, error);
    throw new SDKError(ErrorType.ClientError, error);
  }
};
