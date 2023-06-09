import {
  GenericPayloadSchema,
  JobParams,
  JobParamsSchema,
} from '@dev-lambda/job-orders-dto';
import { Router } from 'express';
import service from 'src/jobOrderService';

const router = Router();

router.post('/:type', async (req, res) => {
  let payload = GenericPayloadSchema.parse(req.body);
  let params: Partial<JobParams>;
  try {
    params = JobParamsSchema.partial().parse(req.query);
  } catch (e) {
    return res.status(401).json({ maessage: e });
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
