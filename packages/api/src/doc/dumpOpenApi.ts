import { openapiSpecification } from './openApi';
import fs from 'fs';
import { join } from 'path';
import app from 'src/app';
import { setupServer } from 'src/server';

// make sur all routes have been initialized, so all documentation could be registered
setupServer(app);

const OpenAPISpecPath = join('..', 'doc', 'openapi.json');

const apiSpec = openapiSpecification();

fs.writeFileSync(OpenAPISpecPath, JSON.stringify(apiSpec, null, 2));
