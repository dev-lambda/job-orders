import logger from './logger';
import serverManager from './server';
import dbManager from './db';
import queueManager from 'src/messageQueue';
import healthProbe from 'src/health/HealthProbe';
import app from './app';

const startTime = Date.now();

process.on('exit', () => {
  const endTime = Date.now();
  logger.info(`Total uptime ${endTime - startTime} ms`);
});

process.on('SIGINT', async () => {
  logger.info('Exit requested by user');
  await cleanup();
  process.exit(0);
});

logger.info('Starting service');

healthProbe.register(serverManager);
healthProbe.register(dbManager);
healthProbe.register(queueManager);

Promise.all([
  serverManager.init({ router: app }),
  dbManager.init(),
  queueManager.init(),
]).catch(async (error) => {
  logger.error('Unable to initialize services', error);
  await cleanup();
  process.exit(1);
});

const cleanup = async () => {
  // TODO attempt to stop services: server, dbconnection, rabbitmq
  logger.info('Attempt to clean state before exit');
  await serverManager.close();
  await dbManager.close();
  await queueManager.close();
  logger.info('All services closed');
};
