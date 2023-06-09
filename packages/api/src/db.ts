import mongoose from 'mongoose';
import logger from './logger';
import config from 'config';
import { ServiceManager } from './ServiceManager';
import { ServiceHealthReport } from '@dev-lambda/job-orders-dto';

const dbHost = config.get<string>('mongodb.host');
const dbOptions = config.get<object>('mongodb.options');

export type MongoDbSettings = {
  host?: string | undefined;
  options?: mongoose.ConnectOptions | undefined;
};

// prettier-ignore
export class DbManager implements ServiceManager<MongoDbSettings, mongoose.Connection> {
  private connection: mongoose.Connection | undefined;

  name = 'Database';

  // strip user:password
  private safeUrl(useHost: string): URL {
    const dbUrlDebugInfo = new URL(useHost);
    const { protocol, host, pathname } = dbUrlDebugInfo;
    return new URL(`${protocol}//${host}${pathname}`);
  }

  async init({
    host = dbHost,
    options = dbOptions,
  }: MongoDbSettings = {}): Promise<mongoose.Connection> {
    if (this.connection !== undefined) {
      logger.info('Db connection already initialized');
      return Promise.resolve(this.connection);
    }

    const instance = await mongoose.connect(host, options).catch((error) => {
      logger.error('Failed to connect to db', { host: this.safeUrl(host) });
      throw error;
    });

    logger.info('Connected to db', { host: this.safeUrl(host) });

    this.connection = instance.connection;
    // Force process to exit if connection lost
    this.connection.on('error', (error) => {
      logger.error('Db error', error);
      throw error;
    });

    this.connection.on('disconnected', () => {
      logger.warn('Disconnected from db');
    });

    this.connection.on('connected', () => {
      logger.warn('Reconnected to db');
    });

    this.connection.on('close', () => {
      logger.warn('Db connection closed');
    });

    return this.connection;
  }

  close(): Promise<void> {
    if (this.connection === undefined) {
      logger.info('Db connection already closed');
      return Promise.resolve();
    }
    return this.connection
      .close()
      .catch((error) => {
        logger.error('Db connection failed to close', error);
      })
      .then(() => {
        logger.info('Db connection successfully closed');
        this.connection = undefined;
      });
  }

  isAlive(): Promise<ServiceHealthReport> {
    if (this.connection === undefined) {
      return Promise.resolve({healthy: false, name: this.name});
    }

    let state = this.connection.readyState;
    return Promise.resolve({
      healthy: [
        mongoose.ConnectionStates.connected,
        mongoose.ConnectionStates.connecting,
      ].includes(state),
      name: this.name,
    });
  }

  getInstance(): mongoose.Connection | undefined {
    return this.connection;
  }
}

const singleton = new DbManager();
export default singleton;
