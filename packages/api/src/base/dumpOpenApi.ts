import { openapiSpecification } from './apiDoc';
import fs from 'fs';
import { join } from 'path';
const OpenAPISpecPath = join('..', 'doc', 'openapi.json');

fs.writeFileSync(
  OpenAPISpecPath,
  JSON.stringify(openapiSpecification, null, 2)
);
