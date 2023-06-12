import z from './zod';

export const ServiceHealthReportSchema = z.object({
  healthy: z
    .boolean()
    .openapi({ description: 'The specific service health status' }),
  name: z.string().openapi({ description: 'The specific service name' }),
});

export const HealthReportSchema = z
  .object({
    healthy: z
      .boolean()
      .openapi({ description: 'The overall health status of the service' }),
    report: z
      .array(ServiceHealthReportSchema)
      .openapi({ description: 'A status report per sub-sevice' }),
  })
  .openapi('HealthReport');

/**
 * @openapi
 * components:
 *   schemas:
 *     healtStatus:
 *       type: object
 *       properties:
 *         healthy:
 *           type: boolean
 *         report:
 *           type: array
 *
 */

export type HealthReport = z.infer<typeof HealthReportSchema>;

export type ServiceHealthReport = z.infer<typeof ServiceHealthReportSchema>;
