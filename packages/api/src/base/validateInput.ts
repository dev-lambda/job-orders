import { ErrorSchema, z } from '@dev-lambda/job-orders-dto';
import { NextFunction, Request, Response } from 'express';

type InputValidation = {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
};

export const InvaidRequestResponse = {
  400: {
    description:
      'Either the body, the query params or the path params is not able to be casted to the expected type',
    summary: 'Invalid request',
    content: {
      'application/json': {
        schema: ErrorSchema,
      },
    },
  },
};

// prettier-ignore
export const validateInput = ({ body, query, params }: InputValidation) => (req: Request, res: Response, next: NextFunction) => {
  let issues: z.ZodIssue[] = [];
  // Body
  if (body) {
    let parsedBody = body.safeParse(req.body, {
      path: ['body'],
    });
    if (!parsedBody.success) {
      issues = [...issues, ...parsedBody.error.issues];
    } else {
      req.body = parsedBody.data;
    }
  }
  // query
  if (query) {
    let parsedQuery = query.safeParse(req.query, {
      path: ['query'],
    });
    if (!parsedQuery.success) {
      issues = [...issues, ...parsedQuery.error.issues];
    } else {
      req.query = parsedQuery.data;
    }
  }
  // params
  if (params) {
    let parsedParams = params.safeParse(req.params, {
      path: ['params'],
    });
    if (!parsedParams.success) {
      issues = [...issues, ...parsedParams.error.issues];
    } else {
      req.params = parsedParams.data;
    }
  }
  if (issues.length > 0) {
    return res.status(400).json(issues);
  }

  return next();
};
