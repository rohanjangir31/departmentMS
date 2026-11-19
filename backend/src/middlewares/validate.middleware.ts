import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendResponse } from "../utils/responseHandler";

interface RequestValidationSchema {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export const validateRequest = (schema: RequestValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        const parsedQuery = await schema.query.parseAsync(req.query);
        req.query = parsedQuery as any;
      }
      if (schema.params) {
        const parsedParams = await schema.params.parseAsync(req.params);
        req.params = parsedParams as any;
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || (error as any).errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join(".") : "",
          message: err.message,
        }));
        sendResponse(res, 400, false, "Validation failed", formattedErrors);
        return;
      }
      sendResponse(res, 500, false, "Internal validation error", null);
      return;
    }
  };
};
