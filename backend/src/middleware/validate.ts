import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Generic Zod validation middleware factory.
 * Usage: router.post('/', validate(MyZodSchema), controller.handler)
 *
 * Validates req.body against the schema. On failure, returns 400 with
 * structured field-level errors. On success, replaces req.body with
 * the parsed (and coerced) output so downstream handlers get clean types.
 */
const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formatted = (result.error as ZodError).flatten();
      res.status(400).json({
        error: 'Validation failed',
        fields: formatted.fieldErrors,
      });
      return;
    }

    req.body = result.data;
    next();
  };

export default validate;
