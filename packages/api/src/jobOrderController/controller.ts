import {
  GenericPayloadSchema,
  JobParams,
  JobParamsSchema,
  z,
} from '@dev-lambda/job-orders-dto';
import { Router } from 'express';
import service from 'src/jobOrderService';
import registry from 'src/doc/openApi';
import { PersistedJobOrderSchema } from 'src/repository/JobOrderRepository';
const router = Router();

// API Documentation
registry.registerPath({
  method: 'post',
  path: '/job/{type}',
  summary: 'Create a new job',
  tags: ['JobOrder'],
  request: {
    params: z.object({
      type: z.string().openapi({
        description: 'The job order type',
        // example: 'compileFileArchive',
      }),
    }),
    query: JobParamsSchema.partial(),
    body: {
      description:
        'The payload to be transmitted to the job processing process',
      content: {
        'application/json': {
          schema: GenericPayloadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Generated job order',
      content: {
        'application/json': {
          schema: PersistedJobOrderSchema,
        },
      },
    },
  },
});

router.post('/:type', async (req, res) => {
  let payload = GenericPayloadSchema.parse(req.body);
  let params: Partial<JobParams>;
  try {
    params = JobParamsSchema.partial().parse(req.query);
  } catch (e) {
    return res.status(400).json({ maessage: e });
  }
  let { type } = req.params;
  let order = await service.requestOrder(type, payload, params);
  return res.json(order);
});

router.get('/:id', async (req, res) => {
  let { id } = req.params;
  let jobOrder = await service.get(id).catch(() => null);
  if (jobOrder === null) {
    return res.sendStatus(404);
  }
  return res.json(jobOrder);
});

export default router;
