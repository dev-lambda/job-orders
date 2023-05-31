import { Request, Response } from 'express';
import { isAlive as serverOK } from 'src/server';
import { isAlive as dbOk } from 'src/db';
import { healtStatus } from '@dev-lambda/api-template-dto';

/**
 * @openapi
 * tags:
 *   - name: Monitoring
 *     description: Monitoring and health check features
 */

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health probe
 *     description: Health probe for liveness and readiness check
 *     tags:
 *      - Monitoring
 *     responses:
 *       200:
 *         description: Returns `ok` status
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/healtStatus'
 *             example:
 *               server: true
 *               db: true
 *       500:
 *         description: Either the db or the server is not working as expected
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/healtStatus'
 *             examples:
 *               dbFail:
 *                 summary: the db connexion is faulty
 *                 value:
 *                   server: true
 *                   db: false
 *               serverFail:
 *                 summary: the api server is faulty
 *                 value:
 *                   server: false
 *                   db: true
 *               chaos:
 *                 summary: pure chaos
 *                 value:
 *                   server: false
 *                   db: false
 */

export const health = (_: Request, res: Response) => {
  let server = serverOK();
  let db = dbOk();
  if (server && db) {
    res.status(200);
  } else {
    res.status(500);
  }
  const result: healtStatus = { server, db };
  return res.json(result);
};

/**
 * @openapi
 * components:
 *   schemas:
 *     healtStatus:
 *       type: object
 *       properties:
 *         server:
 *           type: boolean
 *         db:
 *           type: boolean
 *
 */
