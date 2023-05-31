import { Request, Response, NextFunction } from 'express';
import logger from 'src/logger';

export const error = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { path, method, query } = req;
  const { message } = error;
  if (res.headersSent) {
    let status = res.statusCode;
    logger.error(
      `${status} Silent Internal Server Error ${method} ${path} ${JSON.stringify(
        query
      )}`,
      error
    );
    return next();
  }
  logger.error(
    `500 Internal Server Error ${method} ${path} ${JSON.stringify(query)}`,
    error
  );
  return res.status(500).json({ message });
};

export const explode =
  // prettier-ignore
  (message = 'Intentional unhandled error') => () => {
    throw new Error(message);
  };

export const explodeAfterResponse =
  // prettier-ignore
  (message = 'Intentional unhandled error') => (_: Request, res: Response) => {
    res.sendStatus(200);
    throw new Error(message);
  };
