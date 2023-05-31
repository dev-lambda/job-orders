import { Request, Response } from 'express';
import { message } from '@dev-lambda/api-template-dto';
/**
 * @openapi
 * /:
 *   get:
 *     summary: Base response
 *     description: The default `200 OK` response at the root
 *     tags:
 *       - API
 *     responses:
 *       200:
 *         description: The `ok` response
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/message'
 *             example:
 *               message: "ok"
 */
export const ok = (_: Request, res: Response) => {
  const result: message = { message: 'ok' };
  return res.status(200).json(result);
};

/**
 * @openapi
 * components:
 *   schemas:
 *     message:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @openapi
 * tags:
 *   - name: API
 *     description: API specific routes
 *     externalDocs:
 *       url: https://dev-lambda.github.io/api-template/
 */
