import express from 'express';
import config from 'config';
import logger, { apiLogger } from './logger';
import cors from 'cors';
import { Server } from 'http';
import { notFound } from './base/notFound';
import { ok } from './base/ok';
import { error } from './base/error';
import health from './health/healthController';
import metrics from './base/metrics';
import doc from './doc/controller';
import { ServiceManager } from './ServiceManager';
import { ServiceHealthReport } from '@dev-lambda/job-orders-dto';

const apiPort = config.get<number>('restApi.port');

// allows to instantiate a test-purpose (non listening) server

export const setupServer = (...router: express.Router[]) => {
  const server = express();
  let corsOptions: cors.CorsOptions = {
    origin: '*',
  };
  server.use(cors(corsOptions));
  server.use(apiLogger);

  // Body parser options
  server.use(express.urlencoded({ extended: true }));
  server.use(express.text());
  server.use(express.json());

  if (router.length > 0) {
    server.use(router);
  }

  // Base Routes
  server.get('/', ok);
  server.use(health);
  server.use(metrics);
  server.use(doc);
  server.use(notFound);
  server.use(error);
  return server;
};

export type ServerOptions = {
  router?: express.Router | undefined;
  port?: number | undefined;
};

export class ServerManager implements ServiceManager<ServerOptions, Server> {
  private instance: Server | undefined;

  name = 'APIServer';

  init({ router, port = apiPort }: ServerOptions = {}): Promise<Server> {
    // avoid initializing twice
    if (this.instance !== undefined) {
      logger.info('API Server already started');
      return Promise.resolve(this.instance);
    }

    let routers = [];
    if (router) {
      routers.push(router);
    }
    const server = setupServer(...routers);
    return new Promise((accept, reject) => {
      this.instance = server
        .listen(port, () => {
          if (this.instance === undefined) {
            logger.error('API Server failed to start');
            return reject('API Server not initialized');
          }
          logger.info('API Server started', this.instance.address());
          return accept(this.instance);
        })
        .on('error', (error) => {
          throw new Error(`Unable to launch API server ${error}`);
        });
    });
  }

  close(): Promise<void> {
    return new Promise((accept, reject) => {
      if (this.instance === undefined) {
        logger.info('API Server already closed');
        return accept();
      }
      this.instance.close((error) => {
        if (error !== undefined) {
          logger.error('API Server failed to closed', error);
          return reject();
        }
        this.instance = undefined;
        logger.info('API Server closed');
        return accept();
      });
    });
  }

  isAlive(): Promise<ServiceHealthReport> {
    return Promise.resolve({
      healthy: this.instance !== undefined && this.instance.listening,
      name: this.name,
    });
  }

  getInstance(): Server | undefined {
    return this.instance;
  }
}

const singleton = new ServerManager();
export default singleton;
