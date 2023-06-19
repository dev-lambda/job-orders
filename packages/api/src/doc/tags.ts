import { OpenAPIV3 } from '@asteasolutions/zod-to-openapi';

// export interface TagObject extends ISpecificationExtension {
//   name: string;
//   description?: string;
//   externalDocs?: ExternalDocumentationObject;
//   [extension: string]: any;
// }

const tags: OpenAPIV3.TagObject[] = [
  {
    name: 'JobOrder',
    description: 'Job order requests and status updates',
    externalDocs: { url: 'https://dev-lambda.github.io/job-orders/' },
  },
  {
    name: 'Base',
    description: 'Base API responses',
  },
  {
    name: 'Monitoring',
    description: ' Monitoring and health check features',
  },
  {
    name: 'Integration',
    description: 'Integration support resources',
  },
];

export default tags;
