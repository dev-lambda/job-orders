import config from 'config';
import amqp from 'amqplib';
import logger from 'src/logger';
import { ServiceManager } from 'src/ServiceManager';
import { ServiceHealthReport } from '@dev-lambda/job-orders-dto';

let connectionUrl = config.get<string>('rabbitMq.url');
let jobQueue = config.get<string>('rabbitMq.queue');

const queueSettings: amqp.Options.AssertQueue = {
  exclusive: false,
  durable: true,
  autoDelete: false,
  // arguments?: any;
  // messageTtl?: number | undefined;
  // expires?: number | undefined;
  // deadLetterExchange?: string | undefined;
  // deadLetterRoutingKey?: string | undefined;
  // maxLength?: number | undefined;
  // maxPriority?: number | undefined;
};

export type QueueOptions = {
  url?: string | undefined;
  queue?: string | undefined;
};

// prettier-ignore
export class QueueManager implements ServiceManager<QueueOptions, amqp.Channel> {
  private channel: amqp.Channel | undefined;
  private queue: string;

  name = 'MessageQueue';

  constructor() {
    this.queue = '';
  }

  init({
    url = connectionUrl,
    queue = jobQueue,
  }: QueueOptions = {}): Promise<amqp.Channel> {
    this.queue = queue;
    if (this.channel !== undefined) {
      return Promise.resolve(this.channel);
    }

    return amqp
      .connect(url)
      .catch(error => {
        logger.error('RabbitMq failed to connect');
        throw error;
      })
      .then((connection) => connection.createChannel())
      .then(async (resolvedChannel) => {
        let reply = await resolvedChannel.assertQueue(this.queue, {
          // ...queueOptions,
          ...queueSettings,
        });

        logger.info('RabbitMQ connection successfully initialised', reply);

        this.channel = resolvedChannel;

        this.channel.on('close', () =>
          logger.warn('RabbitMQ connection closed')
        );

        this.channel.on('error', (error) => {
          logger.error('RabbitMQ connection error', error);
          throw error;
        });

        this.channel.on('return', (message) =>
          logger.warn('RabbitMQ routing problem', message)
        );

        this.channel.on('drain', () => logger.info('RabbitMQ queue drained'));

        return this.channel;
      });
  }

  close(): Promise<void> {
    if (this.channel === undefined) {
      logger.info('RabbitMQ connection already closed');
      return Promise.resolve();
    }
    return this.channel.close().catch((error) => {
      logger.error('RabbitMQ connection failed to close', error);
    });
  }

  isAlive(): Promise<ServiceHealthReport> {
    if (this.channel === undefined) {
      return Promise.resolve({healthy: false, name: this.name});
    }
    return this.channel
      .checkQueue(this.queue)
      .catch(() => ({ healthy: false, name: this.name }))
      .then(() => ({ healthy: true, name: this.name }));
  }

  getInstance(): amqp.Channel | undefined {
    return this.channel;
  }
}

const singleton = new QueueManager();

export default singleton;
