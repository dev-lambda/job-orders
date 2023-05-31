import mongoose from 'mongoose';
import logger from './logger';
import config from 'config';

const dbHost = config.get<string>('mongodb.host');
const dbOptions = config.get<object>('mongodb.options');

const initdb = (
  useHost: string = dbHost,
  options: mongoose.ConnectOptions = dbOptions
): Promise<mongoose.Connection> => {
  const dbUrlDebugInfo = new URL(useHost);
  const { protocol, host, pathname } = dbUrlDebugInfo;

  logger.debug(`Using db host ${protocol}//${host}${pathname}`); // strip user:password

  return mongoose.connect(useHost, options).then((instance) => {
    const connection = instance.connection;

    // Force process to exit if connection lost
    connection.on('error', (err) => {
      throw err;
    });

    connection.on('disconnected', () => {
      logger.warn('Disconnected from db');
    });

    connection.on('connected', () => {
      logger.warn('Reconnected to db');
    });

    connection.on('close', () => {
      logger.warn('Db connection closed');
    });

    return connection;
  });
};

export const isAlive = () => {
  let state = mongoose.connection.readyState;
  return [
    mongoose.ConnectionStates.connected,
    mongoose.ConnectionStates.connecting,
  ].includes(state);
};

export default initdb;
