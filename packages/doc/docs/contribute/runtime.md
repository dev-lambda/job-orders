---
sidebar_position: 3
---

# API Runtime settings

:::note
The following configuration settings apply for the API server sub-project located at `packages/api`. Configuration files refer to the contents of `packages/api/config` folder.
:::

This projects uses the [`config` library](https://www.npmjs.com/package/config). In a nutshell, configuration variables are defined in environment specific files under the `config` folder and certain values can be overriden using environment variables.

See the official documentation on [Configuration files](https://github.com/node-config/node-config/wiki/Configuration-Files) for more detals on configuration override logic and config files interpretation ordering.

Example usage:

```ts title="somecode.ts"
import config from 'config';

// config get can either be used to retrieve a single value
const port = config.get<string>('restApi.port');

// ...or a full object
const dbOptions = config.get<object>('mongodb.options');
```

## Configuration files

:::tip
In order to quiclky override settings while developping you can use `config/local-development.yaml`.

Note: This file **should not be versionned** as it may be different for each developper and can possibly contain secrets for debugging purposes (it is already gitignored, but it's worth being aware of that).
:::

The following files are used:

- `config/`
  - `default.yaml`: base configuration.
  - `development.yaml`: overrides config values for development.
  - `production.yaml`: overrides config values for production. Don't put any sensitive data here. Prever environment variables instead.
  - `test.yaml`: used when running tests.
  - `local-development.yaml`: (optional) use this to override values for your local development enviromnent. This file should not be commited.
  - `local-test.yaml`: (optional) use this to override values for your local test enviromnent. This file should not be commited.

These files follow the following tree structure:

```yaml title="config/default.yaml"
restApi:
  # The api server port
  port: '3000'
  # The base url that will be used to form absolute urls
  baseUrl: 'http://localhost'
# The least significant level of logs that should be emitted.
logLevel: 'info'
# OpenAPI base documentation infos
openAPI:
  # You application title.
  # If absent uses package.json contents (preferred).
  title: Sample Pet Store App
  # API version. You can use semantic versioning like 1.0.0,
  # or an arbitrary string like 0.99-beta.
  # If absent uses package.json contents (preferred).
  version: 1.0.0
  # API description. Arbitrary text in CommonMark or HTML.
  # If absent uses package.json contents (preferred).
  description: This is a sample server for a pet store.
  # Link to the page that describes the terms of service.
  # Must be in the URL format.
  termsOfService: http://example.com/terms/
  # Contact information: name, email, URL.
  contact:
    name: API Support
    email: support@example.com
    url: http://example.com/support
  # Name of the license and a URL to the license description.
  license:
    name: ISC
    url: https://opensource.org/license/isc-license-txt/
  # Link to the external documentation (if any).
  # Code or documentation generation tools can use description as the text of the link.
  externalDocs:
    description: Find out more
    url: http://example.com
# Db connection settings, see https://mongoosejs.com/docs/connections.html#options for more details.
mongodb:
  host: mongodb://localhost:27017/default
  options:
    useUnifiedTopology: 'true'
    connectTimeoutMS: 1000
    serverSelectionTimeoutMS: 5000
    keepAlive: true
```

## Environment variables

### Available environment variables

| varialbe      | development defaults          | overrides         | description                                                                                        |
| ------------- | ----------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| `PORT`        | 3000                          | `restApi.port`    | The port that the server will listen to.                                                           |
| `baseUrl`     | http://localhost              | `restApi.baseUrl` | Base url to be used when building absolute Urls`                                                   |
| `logLevel`    | info                          | `logLevel`        | Defines the [log level](https://github.com/winstonjs/winston#logging-levels) that will be emitted. |
| `mongoDbHost` | mongodb://localhost:27017/dev | `mongodb.host`    | MongoDb connection string                                                                          |

Examples:

Increase the log verbosity for a development run

```sh
logLevel=debug npm run watch
```

Runs the production server on the 4242 port

```sh
PORT=4242 npm run prod
```

### Exposing environment variables

Accepted environment variables are defined in `config/custom-envirnment-variables.yaml`. For every path in the configuration tree structure you can specify the environment variable that will be used as input.

```yaml title="config/custom-envirnment-variables.yaml"
restApi:
  port: 'PORT'
  baseUrl: 'baseUrl'
logLevel: 'logLevel'
mongodb:
  host: 'mongoDbHost'
```
