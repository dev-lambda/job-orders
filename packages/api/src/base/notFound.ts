import { notFoundMessage } from '@dev-lambda/api-template-dto';
import { Request, Response } from 'express';

/**
 * @openapi
 * /wrongPath:
 *   get:
 *     summary: Not found
 *     description: The response given on any unknown path
 *     tags:
 *       - API
 *     responses:
 *       404:
 *         description: The `not found` response
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/notFoundMessage'
 *             example:
 *               message: "not found"
 *               path: "/wrongPath"
 *
 */
export const notFound = (req: Request, res: Response) => {
  const { path } = req;
  const result: Partial<notFoundMessage> = { message: 'not found', path };
  return res.status(404).json(result);
};

/**
 * @openapi
 * components:
 *   schemas:
 *     notFoundMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         path:
 *           type: string
 */
