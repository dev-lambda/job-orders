import axios from 'axios';
import { message, healtStatus } from '@dev-lambda/api-template-dto';
import { errorLogInterceptor } from './errorLogInterceptor';
import { SDKError, ErrorType } from './SDKError';
import { responseLogInterceptor } from './responseLogInterceptor';
import { Logger, defaultLogger } from './LoggerInterface';

interface ClientOptions {
  logger?: Logger;
  authToken?: string;
}

export const ClientName = 'api-template client';

export class Client {
  private axios: axios.AxiosInstance;
  private logger: Logger;

  constructor(host = 'http://localhost:3000', options: ClientOptions = {}) {
    let { logger, authToken } = options;
    // prettier-ignore
    this.axios = axios.create({
      baseURL: host,
      headers: {
        Accept: 'application/json',         // default expected response content type
        'Content-Type': 'application/json', // default content type for post/put data
      },
    });
    if (logger) {
      this.logger = logger;
    } else {
      this.logger = defaultLogger;
    }
    this.axios.interceptors.response.use(
      responseLogInterceptor(this.logger),
      errorLogInterceptor(this.logger)
    );
    if (authToken) {
      this.authenticate(authToken);
    }
  }

  authenticate(authToken: string) {
    this.axios.defaults.headers.common['Authorization'] = authToken;
  }

  /**
   * Request for the ok response.
   * @returns the ok message object
   * @throws on any error or unexpected response.
   */
  async ok(): Promise<message> {
    let path = '/';

    return this.axios.get<message>(path).then((response) => {
      // Handle expected cases
      if (response.status === 200) {
        return response.data;
      }
      // Throw on anything else
      throw new Error(
        `Unexpected response ${response.status}, ${response.statusText}`
      );
    });
  }

  /**
   * Verifies the server health status
   * @returns server health status report
   * @throws on any error or unexpected responses
   */
  async health() {
    let path = '/health';

    return this.axios
      .get<healtStatus>(path, {
        validateStatus: () => true, // accept all status codes, including 500
      })
      .then((response) => {
        // Handle expected cases
        if ([200, 500].includes(response.status)) {
          return response.data;
        }
        // Throw on anything else
        throw new SDKError(ErrorType.UnexpectedResponse);
      });
  }
}

export default Client;
