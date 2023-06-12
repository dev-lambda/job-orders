import { Request, Response, Router } from 'express';
import healthProbe from './HealthProbe';
import registry from 'src/doc/openApi';
import { HealthReportSchema } from '@dev-lambda/job-orders-dto';

registry.registerPath({
  path: '/health',
  method: 'get',
  tags: ['Monitoring'],
  summary: 'Health probe',
  description: 'Health probe for liveness and readiness check',
  responses: {
    200: {
      description: 'Returns `ok` status',
      content: {
        'application/json': {
          schema: HealthReportSchema,
          example: {
            healthy: true,
            report: [
              {
                name: 'APIServer',
                healthy: true,
              },
              {
                name: 'Database',
                healthy: true,
              },
              {
                name: 'MessageQueue',
                healthy: true,
              },
            ],
          },
        },
      },
    },
    500: {
      description:
        'Either one of the required sub-services is not working as expected',
      content: {
        'application/json': {
          schema: HealthReportSchema,
          example: {
            healthy: false,
            report: [
              {
                name: 'APIServer',
                healthy: true,
              },
              {
                name: 'Database',
                healthy: true,
              },
              {
                name: 'MessageQueue',
                healthy: false,
              },
            ],
          },
        },
      },
    },
  },
});

export const health = async (_: Request, res: Response) => {
  return healthProbe.isAlive().then((report) => {
    if (report.healthy) {
      res.status(200);
    } else {
      res.status(500);
    }
    return res.json(report);
  });
};

const router = Router();

router.get('/health', health);

export default router;
