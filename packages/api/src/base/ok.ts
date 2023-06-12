import { Request, Response } from 'express';
import { message, messageSchema } from '@dev-lambda/job-orders-dto';
import registry from 'src/doc/openApi';

registry.registerPath({
  method: 'get',
  path: '/',
  summary: 'Base response',
  description: 'The default `200 OK` response at the root',
  tags: ['Base'],
  responses: {
    200: {
      description: 'The `ok` response',
      content: {
        'application/json': {
          schema: messageSchema,
          example: {
            message: 'ok',
          },
        },
      },
    },
  },
});

export const ok = (_: Request, res: Response) => {
  const result: message = { message: 'ok' };
  return res.status(200).json(result);
};
