import { NextFunction, Request, Response } from "express"

import { createPostSchema } from "../lib/zodSchemas.js"
import { zodValidation } from "../lib/zodValidation.js"

export const createPostMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const errors = zodValidation(createPostSchema, req.body)

  if (errors) {
    res.status(400).send({ message: "Validation errors", errors })
    return
  }

  next()
}