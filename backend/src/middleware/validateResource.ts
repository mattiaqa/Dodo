import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodEffects } from "zod";

export const validateBody =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (e: any) {
      res.status(400).send(e.errors);
    }
  };

export const validateParams =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (e: any) {
      res.status(400).send(e.errors);
    }
  };

export const validateQuery =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.query);
      next();
    } catch (e: any) {
      res.status(400).send(e.errors);
    }
  };

//export default validate;