import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

import ApiError from '../utils/ApiError';

export const validate =
  (schema: ZodTypeAny, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(new ApiError(400, 'Validation failed', result.error.flatten()));
    }

    req[source] = result.data;
    return next();
  };

export default validate;

