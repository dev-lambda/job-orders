import logger from './logger';
import init from './server';
import initdb from './db';
import app from './app';

const startTime = Date.now();

process.on('exit', () => {
  const endTime = Date.now();
  logger.info(`Total uptime ${endTime - startTime} ms`);
});

process.on('SIGINT', () => {
  logger.info('Exit requested by user');
  process.exit(0);
});

logger.info('Starting server');
Promise.all([init(app), initdb()])
  .then(([instance, connection]) => {
    logger.info('Server started', instance.address());
    logger.info('Connected to db', connection.host);
  })
  .catch((error) => {
    logger.error('Unable to connect to DB', error);
    process.exit(1);
  });
