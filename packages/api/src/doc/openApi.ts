import project from 'src/../package.json';
import config from 'config';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  OpenAPIV3,
} from '@asteasolutions/zod-to-openapi';
import { OpenAPIObjectConfig } from '@asteasolutions/zod-to-openapi/dist/v3.0/openapi-generator';
import tags from './tags';

const registry = new OpenAPIRegistry();
export default registry;

const { name: title, version, description } = project;

const infoOverrides = config.get<Partial<OpenAPIV3.InfoObject>>('openAPI.info');
const externalDocs = config.get<OpenAPIV3.ExternalDocumentationObject>(
  'openAPI.externalDocs'
);
const servers = config.get<OpenAPIV3.ServerObject[]>('openAPI.servers');

const definition: OpenAPIObjectConfig = {
  openapi: '3.0.0',
  info: {
    description,
    title,
    version,
    ...infoOverrides,
  },
  servers,
  tags,
  externalDocs,
};

export const openapiSpecification = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument(definition);
};
