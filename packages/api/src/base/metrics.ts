import { z } from '@dev-lambda/job-orders-dto';
import { Request, Response, Router } from 'express';
import Prometheus from 'prom-client';
import project from 'src/../package.json';
import registry from 'src/doc/openApi';
import logger from 'src/logger';

const { NODE_APP_INSTANCE } = process.env;

Prometheus.register.setDefaultLabels({
  app: project.name,
  instance: NODE_APP_INSTANCE, // Note: this should be set at deployment
});

Prometheus.collectDefaultMetrics({
  // prefix,
  // labels: { NODE_APP_INSTANCE },
});

// API dpcumentation
registry.registerPath({
  path: '/metrics',
  method: 'get',
  tags: ['Monitoring'],
  description: 'Default and applicative metrics for use with Prometheus',
  summary: 'Prometheus application metrics',
  responses: {
    200: {
      description: '',
      content: {
        [Prometheus.register.contentType]: {
          schema: z
            .string()
            .openapi({ description: 'A prometheus formatted metrics report' }),
        },
      },
    },
  },
});

const metrics = async (req: Request, res: Response) => {
  try {
    const metrics = await Prometheus.register.metrics();
    res.contentType(Prometheus.register.contentType);

    res.send(metrics);
  } catch (error) {
    logger.error('Failed retrieving metrics', error);
    res.sendStatus(500);
  }
};

const router = Router();

router.get('/metrics', metrics);

export default router;
