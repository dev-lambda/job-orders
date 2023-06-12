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
  })
  .openapi('NotFoundMessage');

export type notFoundMessage = z.infer<typeof notFoundMessageSchema>;
