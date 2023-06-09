import z from 'zod';

export const ServiceHealthReportSchema = z.object({
  healthy: z.boolean(),
  name: z.string(),
});

export const HealthReportSchema = z.object({
  healthy: z.boolean(),
  report: z.array(ServiceHealthReportSchema),
});

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
