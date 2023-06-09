import { Request, Response, Router } from 'express';
import Prometheus from 'prom-client';
import project from 'src/../package.json';
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

const router = Router();

router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await Prometheus.register.metrics();
    res.contentType(Prometheus.register.contentType);

    res.send(metrics);
  } catch (error) {
    logger.error('Failed retrieving metrics', error);
    res.sendStatus(500);
  }
});

export default router;
