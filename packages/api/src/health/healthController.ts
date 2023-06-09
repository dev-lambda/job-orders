import { Request, Response, Router } from 'express';
import healthProbe from './HealthProbe';

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

export const health = async (_: Request, res: Response) => {
  return healthProbe.isAlive().then((report) => {
    if (report.healthy) {
      res.status(200);
    } else {
      res.status(500);
    }
    return res.json(report);
  });
};

const router = Router();

router.get('/health', health);

export default router;
