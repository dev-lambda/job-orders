---
sidebar_position: 8
---

# Monitoring

## Logs

Logs are timestamped and output in json format to the standard output.

Example:
```json
{"level":"info","message":"Starting server","timestamp":"2023-05-09T14:02:03.995Z"}
{"address":"::","family":"IPv6","level":"info","message":"Server started","port":3000,"timestamp":"2023-05-09T14:02:04.010Z"}
{"level":"info","message":"Connected to db","timestamp":"2023-05-09T14:02:04.010Z"}
{"httpVersion":"1.1","length":"9260","level":"info","message":"GET /metrics 200","method":"GET","remoteAddr":"::ffff:127.0.0.1","responseTime":5,"status":"200","timestamp":"2023-05-09T14:02:05.490Z","url":"/metrics"}
```

### API logs

All api calls are logged using the following informations extracted from morgan library:
```ts title="src/logger.ts"
  const info = {
    remoteAddr,
    user,
    method,
    url,
    httpVersion,
    status,
    length,
    responseTime,
  };
```

### Using logs

:::tip
Describe as much as possible the message in terms of the actual work that your function is responsible for. You can add details as long as they are pertinent for the situation you are handling.
:::

```ts
import logger from 'src/logger';

logger.debug('configuration used', resolvedConfigObject);

logger.info('application started');

logger.warn('something is fishy while doing [work]. The expected [invariant] is not in an expected state', {myInvariantStatus})

logger.error('[my function] failed to execute', err);
```

In order to locally force a given debug level:
```sh
logLevel=debug npm run watch
```

### Log collection

Not set up yet. Depends on deployment.

## Application metrics

Prometheus metrics are exposed at `/metrics` endpoint.

### Default metrics

Default exposed metrics:
- `http_request_duration_milliseconds`
- `http_request_count`
- prometheus default metrics

The first two track the same information used for API logging. The last is the standard metrics provided by the `prom-client` library.

### Custom metrics

Example:

```ts title="Define a custom counter"
import Prometheus from 'prom-client';

// Register a custom counter to keep track of application activity.
// In this example the `type` label is used to track a counter per specific activity type for the application activity being followed.
const activityCounter = new Prometheus.Counter({
  name: 'myCounter',
  help: 'Count of HTTP requests made to my app',
  labelNames: ['type'],
});

Prometheus.register.registerMetric(activityCounter);

// [...]

// use the counter at the appropriate level (controller, service, ...)
activityCounter
  .labels({
    type: 'userMessage' // this could be anything: fileGeneration, message type, ...
  })
  .inc();
```

For more metric types check the [`prom-client` library documentation](https://github.com/siimon/prom-client#custom-metrics).

### Dashboard

Not set up yet. Depends on deployment.