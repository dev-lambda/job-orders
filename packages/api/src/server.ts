import express from 'express';
import config from 'config';
import { apiLogger } from './logger';
import cors from 'cors';
import { Server } from 'http';
import { notFound } from './base/notFound';
import { ok } from './base/ok';
import { error } from './base/error';
import { health } from './base/health';
import metrics from './base/metrics';

const port = config.get('restApi.port');

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
  server.get('/health', health);
  server.use(metrics);
  server.use(notFound);
  server.use(error);
  return server;
};

let instance: Server;

const init = (
  router: express.Router | null,
  options = { port }
): Promise<Server> => {
  let routers = [];
  if (router) {
    routers.push(router);
  }
  const server = setupServer(...routers);
  return new Promise((accept) => {
    instance = server
      .listen(options.port, () => {
        accept(instance);
      })
      .on('error', (error) => {
        throw new Error(`Unable to launch server: Shutting down. ${error}`);
      });
  });
};

export const isAlive = () => {
  return instance !== null && instance.listening;
};

export default init;
