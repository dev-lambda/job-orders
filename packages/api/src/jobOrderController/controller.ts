import {
  GenericJobOrderSchema,
  GenericPayload,
  GenericPayloadSchema,
  JobParams,
  JobParamsSchema,
  z,
} from '@dev-lambda/job-orders-dto';
import { NextFunction, Request, Response, Router } from 'express';
import service from 'src/jobOrderService';
import registry from 'src/doc/openApi';
import { PersistedJobOrderSchema } from 'src/repository/JobOrderRepository';
import { notFound, notFoundResponse } from 'src/base/notFound';
import { InvaidRequestResponse, validateInput } from '../base/validateInput';
// import logger from 'src/logger';

const defaultBasePath = '/api/jobs';

export default (basePath: string = defaultBasePath): Router => {
  const router = Router();

  // API Documentation
  registry.registerPath({
    method: 'post',
    path: `${basePath}/{type}`,
    summary: 'Create a new job',
    tags: ['JobOrder'],
    request: {
      params: z.object({
        type: z.string().openapi({
          description: 'The job order type',
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
      ...InvaidRequestResponse,
    },
  });

  const requestJob = async (req: Request, res: Response) => {
    let { body, query } = req;
    let { type } = req.params;
    let order = await service.requestOrder(
      type,
      body as GenericPayload,
      query as Partial<JobParams>
    );
    return res.json(order);
  };

  router.post(
    `${basePath}/:type`,
    validateInput({
      body: GenericPayloadSchema,
      query: JobParamsSchema.partial(),
    }),
    requestJob
  );

  // API Documentation
  registry.registerPath({
    method: 'get',
    path: `${basePath}/{id}`,
    summary: 'Find by id',
    description: 'Retrieve infos and status for a job order from its id',
    tags: ['JobOrder'],
    request: {
      params: z.object({
        type: z.string().openapi({
          description: 'The job order id',
        }),
      }),
    },
    responses: {
      200: {
        description: 'Job order description',
        content: {
          'application/json': {
            schema: GenericJobOrderSchema,
          },
        },
      },
      ...notFoundResponse,
    },
  });

  const findJob = async (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.params;
    let jobOrder = await service.get(id).catch(() => null);
    if (jobOrder === null) {
      return next();
    }
    return res.json(jobOrder);
  };

  router.get(`${basePath}/:id`, findJob, notFound);

  const completeJob = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    let { id } = req.params;

    return service
      .completeOrder(id, req.body as GenericPayload)
      .catch(next)
      .then((jobOrder) => {
        if (!jobOrder) return next();
        return res.status(200).send(jobOrder);
      });

    // .catch((error) => {
    //   logger.error(`Failed to complete job order ${id}`, { id, error });
    //   throw new Error(`Failed to complete job order ${id}`);
    // });
    // TODO handle errors
  };

  router.put(
    `${basePath}/:id/complete`,
    validateInput({
      body: GenericPayloadSchema,
    }),
    completeJob,
    notFound
  );

  return router;
};
