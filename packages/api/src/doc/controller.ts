import { Router, Request, Response } from 'express';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';
import registry, { openapiSpecification } from './openApi';
import project from 'src/../package.json';
import { z } from '@dev-lambda/job-orders-dto';
const { name } = project;

// API dpcumentation
registry.registerPath({
  path: '/openAPI',
  summary: 'Get the OpenAPI json description for this API',
  method: 'get',
  tags: ['Integration'],
  responses: {
    200: {
      description: 'A json containing the OpenAPI specification',
      content: {
        'application/json': {
          schema: z.object({}),
          exemple: openapiSpecification(),
        },
      },
    },
  },
});

const router = Router();

router.get('/openAPI', (req: Request, res: Response) => {
  const specs = openapiSpecification();
  res.json(specs);
});

const uiOptions: SwaggerUiOptions = {
  customSiteTitle: `${name} API documentation`,
  customCss: '.swagger-ui .topbar { display: none }',
  explorer: false,
};

router.use(
  '/doc',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpecification(), uiOptions)
);

export default router;
