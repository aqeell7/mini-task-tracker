import type { Request, Response, NextFunction } from "express";
import type { AnyZodObject } from "zod";
import { ZodError } from "zod";

const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (e: unknown) {
      if (e instanceof ZodError) {
        return res.status(400).json(e.errors);
      }
      return res.status(400).send("Invalid request");
    }
  };

export default validate;
