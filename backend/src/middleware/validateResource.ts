import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodEffects } from "zod";

export const validateBody =
  (schema: AnyZodObject | ZodEffects<AnyZodObject>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      // Usa safeParse per validare e preprocessare i dati
      const result = schema.safeParse(req.body);
      if (!result.success) {
          res.status(400).json(result.error.errors);
          return;
      }
      req.body = result.data; // Aggiorna il body con i dati preprocessati
      next();
      /*
      schema.parse(req.body);
      next();
      */
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