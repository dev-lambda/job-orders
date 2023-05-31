import swaggerJsdoc from 'swagger-jsdoc';
import project from 'src/../package.json';
import config from 'config';
import { Router, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import logger from 'src/logger';

const { name: title, version, description } = project;
const port = config.get<string>('restApi.port');
const baseUrl = config.get<string>('restApi.baseUrl');
const docOverrides = config.get<object>('openAPI');
let url = new URL(baseUrl);
url.port = port;
url.protocol = 'http';

const options: swaggerJsdoc.Options = {
  failOnErrors: true,
  definition: {
    openapi: '3.0.0',
    info: {
      description,
      title,
      version,
      ...docOverrides,
    },
    servers: [
      {
        url: '/',
        description: 'This server',
      },
      {
        url: 'http://localhost:3000/',
        description: 'Development server',
        // crossOriginIsolated: true,
      },
    ],
  },
  apis: ['./src/**/*.ts'],
};

logger.debug('Resolved OpenAPI options', options);

export const uiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
};

export const openapiSpecification = swaggerJsdoc(options);

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Integration
 *     description: Integration support resources
 */

/**
 * @openapi
 * /openAPI:
 *   get:
 *     summary: API specs file
 *     description: Get the OpenAPI json description for this API
 *     tags:
 *      - Integration
 *     responses:
 *       200:
 *         description: A json containing the OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *                $ref: 'https://spec.openapis.org/oas/3.1/dialect/base'
 */
router.get('/openAPI', (req: Request, res: Response) => {
  res.json(openapiSpecification);
});

router.use(
  '/doc',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpecification, uiOptions)
);

export default router;
