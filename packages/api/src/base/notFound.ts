import {
  notFoundMessage,
  notFoundMessageSchema,
} from '@dev-lambda/job-orders-dto';
import { Request, Response } from 'express';
import registry from 'src/doc/openApi';

registry.registerPath({
  method: 'get',
  path: '/wrongPath',
  summary: 'Not found',
  description: 'The response given on any unknown path',
  tags: ['Base'],
  responses: {
    404: {
      description: 'The `not found` response',
      content: {
        'application/json': {
          schema: notFoundMessageSchema,
          example: {
            message: 'not found',
            path: '/wrongPath',
          },
        },
      },
    },
  },
});

export const notFound = (req: Request, res: Response) => {
  const { path } = req;
  const result: Partial<notFoundMessage> = { message: 'not found', path };
  return res.status(404).json(result);
};
