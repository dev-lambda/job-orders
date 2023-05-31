import axios from 'axios';
import { ClientName } from './Client';
import { Logger } from './LoggerInterface';

export const responseLogInterceptor =
  (logger: Logger) => (response: axios.AxiosResponse) => {
    let { status } = response;
    if (status < 300) {
      logger.info(
        `[${ClientName}] Request success: ${response.config.url} ${status}`
      );
    } else {
      // useful when error status need to be interpreted by the client
      logger.warn(
        `[${ClientName}] Expected error response: ${response.config.url} ${status}`
      );
    }

    return response;
  };
