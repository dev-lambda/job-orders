import {
  GenericJobOrderSchema,
  GenericPayload,
  GenericPayloadSchema,
  InvalidJobTransition,
  JobError,
  JobErrorSchema,
  JobParams,
  JobParamsSchema,
  z,
} from '@dev-lambda/job-orders-dto';
import { NextFunction, Request, Response, Router } from 'express';
import registry from 'src/doc/openApi';
import { PersistedJobOrderSchema } from 'src/repository/JobOrderRepository';
import { notFound, notFoundResponse } from 'src/base/notFound';
import { InvaidRequestResponse, validateInput } from '../base/validateInput';
import {
  JobOrderInvalidTransition,
  JobOrderNotFound,
  JobOrderService,
  // JobOrderUnableToNotify,
  // JobOrderUnableToQueue,
} from 'src/jobOrderService/JobOrderService';
import logger from 'src/logger';
import { ServerErrorResponse } from 'src/base/error';
import { RouteConfig } from '@asteasolutions/zod-to-openapi';
// import logger from 'src/logger';

const defaultBasePath = '/api/jobs';

export default ({
  basePath = defaultBasePath,
  service,
}: {
  basePath?: string;
  service: JobOrderService;
}): Router => {
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
        description: 'Newly created job order',
        content: {
          'application/json': {
            schema: PersistedJobOrderSchema,
            example: {
              type: 'dummyJob',
              payload: {},
              params: { maxRetry: 3, timeout: 300 },
              status: 'pending',
              runs: [],
              id: '0',
            },
          },
        },
      },
      ...InvaidRequestResponse,
      ...ServerErrorResponse,
    },
  });

  const requestJob = (req: Request, res: Response, next: NextFunction) => {
    let { body, query } = req;
    let { type } = req.params;
    return service
      .requestOrder(type, body as GenericPayload, query as Partial<JobParams>)
      .then((order) => res.json(order), next);
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
        description: 'Job order',
        content: {
          'application/json': {
            schema: GenericJobOrderSchema,
            example: {
              type: 'dummyJob',
              payload: {},
              params: { maxRetry: 3, timeout: 300 },
              status: 'pending',
              runs: [],
              id: '0',
            },
          },
        },
      },
      ...notFoundResponse,
      ...ServerErrorResponse,
    },
  });

  router.get(
    `${basePath}/:id`,
    (req: Request, res: Response, next: NextFunction) => {
      let { id } = req.params;
      return service.get(id).then((order) => res.json(order), next);
    }
  );

  // API Documentation
  registry.registerPath({
    method: 'put',
    path: `${basePath}/{id}/cancel`,
    summary: 'Cancel a job order',
    description: 'Request for job order to be cancelled (before processing).',
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
        description: 'Updated job order',
        content: {
          'application/json': {
            schema: GenericJobOrderSchema,
            example: {
              type: 'dummyJob',
              payload: {},
              params: { maxRetry: 3, timeout: 300 },
              status: 'cancelled',
              runs: [],
              id: '0',
            },
          },
        },
      },
      ...notFoundResponse,
      ...InvalidJobTransition({
        message: 'Invalid job status transition',
        from: 'processing',
        to: 'cancelled',
        expectingFrom: ['pending'],
      }),
      ...ServerErrorResponse,
    },
  });

  router.put(
    `${basePath}/:id/cancel`,
    (req: Request, res: Response, next: NextFunction) => {
      let { id } = req.params;
      return service.cancelOrder(id).then((order) => res.json(order), next);
    }
  );

  // API Documentation
  registry.registerPath({
    method: 'put',
    path: `${basePath}/{id}/resume`,
    summary: 'Resume a job order',
    description: 'Resume a previously cancelled or failed job order',
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
        description: 'Updated job order',
        content: {
          'application/json': {
            schema: GenericJobOrderSchema,
            example: {
              type: 'dummyJob',
              payload: {},
              params: { maxRetry: 3, timeout: 300 },
              status: 'pending',
              runs: [],
              id: '0',
            },
          },
        },
      },
      ...notFoundResponse,
      ...InvalidJobTransition({
        message: 'Invalid job status transition',
        from: 'processing',
        to: 'pending',
        expectingFrom: ['cancelled', 'failed'],
      }),
      ...ServerErrorResponse,
    },
  });

  router.put(
    `${basePath}/:id/resume`,
    (req: Request, res: Response, next: NextFunction) => {
      let { id } = req.params;
      return service.resumeOrder(id).then((order) => res.json(order), next);
    }
  );

  // API Documentation
  registry.registerPath({
    method: 'put',
    path: `${basePath}/{id}/start`,
    summary: 'Start processing a job order',
    description: 'Notify that the job order is being processed',
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
        description: 'Updated job order',
        content: {
          'application/json': {
            schema: GenericJobOrderSchema,
            example: {
              type: 'dummyJob',
              payload: {},
              params: { maxRetry: 3, timeout: 300 },
              status: 'processing',
              runs: [],
              id: '0',
            },
          },
        },
      },
      ...notFoundResponse,
      ...InvalidJobTransition({
        message: 'Invalid job status transition',
        from: 'cancelled',
        to: 'processing',
        expectingFrom: ['pending'],
      }),
      ...ServerErrorResponse,
    },
  });

  router.put(
    `${basePath}/:id/start`,
    (req: Request, res: Response, next: NextFunction) => {
      let { id } = req.params;
      return service.startOrder(id).then((order) => res.json(order), next);
    }
  );

  // API Documentation
  registry.registerPath({
    method: 'put',
    path: `${basePath}/{id}/complete`,
    summary: 'Complete a job order',
    description: 'Mark a processing job ordrer as completed',
    tags: ['JobOrder'],
    request: {
      params: z.object({
        type: z.string().openapi({
          description: 'The job order id',
        }),
      }),
      body: {
        description: 'An arbitrary payload containing the run result',
        content: { 'application/json': { schema: GenericPayloadSchema } },
      },
    },
    responses: {
      200: {
        description: 'Updated job order',
        content: {
          'application/json': {
            schema: GenericJobOrderSchema,
            example: {
              type: 'dummyJob',
              payload: {},
              params: { maxRetry: 3, timeout: 300 },
              status: 'completed',
              runs: [{ result: { returnValue: 'some result' } }],
              id: '0',
            },
          },
        },
      },
      ...notFoundResponse,
      ...InvaidRequestResponse,
      ...InvalidJobTransition({
        message: 'Invalid job status transition',
        from: 'cancelled',
        to: 'completed',
        expectingFrom: ['processing'],
      }),
      ...ServerErrorResponse,
    },
  });

  router.put(
    `${basePath}/:id/complete`,
    validateInput({
      body: GenericPayloadSchema,
    }),
    (req: Request, res: Response, next: NextFunction) => {
      let { id } = req.params;
      return service
        .completeOrder(id, req.body as GenericPayload)
        .then((order) => res.json(order), next);
    }
  );

  // API Documentation
  registry.registerPath({
    method: 'put',
    path: `${basePath}/{id}/error`,
    summary: 'Error processing a job order',
    description: 'Notify a job order processing error',
    tags: ['JobOrder'],
    request: {
      params: z.object({
        type: z.string().openapi({
          description: 'The job order id',
        }),
      }),
      body: {
        description: 'An arbitrary payload containing the run result',
        content: { 'application/json': { schema: JobErrorSchema } },
      },
    },
    responses: {
      200: {
        description: 'Updated job order',
        content: {
          'application/json': {
            schema: GenericJobOrderSchema,
            example: {
              type: 'dummyJob',
              payload: {},
              params: { maxRetry: 3, timeout: 300 },
              status: 'failed',
              runs: [
                {
                  error: {
                    type: 'unprocessable',
                    payload: { reason: 'something went wrong' },
                  },
                },
              ],
              id: '0',
            },
          },
        },
      },
      ...notFoundResponse,
      ...InvaidRequestResponse,
      ...InvalidJobTransition({
        message: 'Invalid job status transition',
        from: 'cancelled',
        to: 'failed',
        expectingFrom: ['processing'],
      }),
      ...ServerErrorResponse,
    },
  });

  router.put(
    `${basePath}/:id/error`,
    validateInput({
      body: JobErrorSchema,
    }),
    (req: Request, res: Response, next: NextFunction) => {
      let { id } = req.params;
      return service
        .errorProcessingOrder(id, req.body as JobError)
        .then((order) => res.json(order), next);
    }
  );

  const handleJobServiceExceptions = (
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.error(error);
    if (error instanceof JobOrderNotFound) {
      return next(); // Will fallback in 404 not found
    }

    if (error instanceof JobOrderInvalidTransition) {
      let { from, to, expected } = error;
      return res.status(409).send({
        message: 'Invalid job status transition',
        from,
        to,
        expectingFrom: expected,
      }); // conflict
    }

    // if (error instanceof JobOrderUnableToNotify || error instanceof JobOrderUnableToQueue) {
    return next(error); // Will fallback in 500 server error
  };

  router.use(basePath, handleJobServiceExceptions);
  router.use(`${basePath}/:id`, notFound);

  return router;
};
