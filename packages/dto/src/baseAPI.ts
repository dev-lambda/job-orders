import z from './zod';

export const messageSchema = z
  .object({
    message: z
      .string()
      .openapi({ description: 'A human readable message of the response' }),
  })
  .openapi('Message');

export type message = z.infer<typeof messageSchema>;

export const notFoundMessageSchema = messageSchema
  .extend({
    path: z.string().openapi({ description: 'The requested not found path' }),
    params: z.record(z.string(), z.any()).openapi({
      description: 'The parameters identified from the request path',
    }),
  })
  .openapi('NotFoundMessage');

export type notFoundMessage = z.infer<typeof notFoundMessageSchema>;

export const IssueCodeSchema = z.nativeEnum(z.ZodIssueCode);

export const IssueSchema = z.object({
  code: IssueCodeSchema.openapi({ example: 'invalid_type' }),
  expected: z.string().optional().openapi({
    description: 'The type of the expected value',
    example: 'number',
  }),
  received: z.string().optional().openapi({
    description: 'The type of the received value',
    example: 'nan',
  }),
  path: z.array(z.string()).openapi({
    description:
      'An array representing the path to the value originating the error',
    example: ['query', 'maxRetry'],
  }),
  message: z.string().openapi({ example: 'Expected number, received nan' }),
});

export const ErrorSchema = z.array(IssueSchema).openapi('InvalidRequestError', {
  description:
    'a list of all issues found, either on the body, the query params or the path params',
});
