import { NextFunction, Request, Response } from "express"

import { verifyJWT } from "../lib/jose.js"
import { getUser } from "../controllers/auth.controllers.js"

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    res.status(401).send({ message: "Token is not provided" })
    return
  }

  const payload = await verifyJWT(token)

  if (!payload) {
    res.status(401).send({ message: "Token is invalid" })
    return
  }

  const user = await getUser(payload.id)

  if (!user) {
    res.status(404).send({ message: "User not found" })
    return
  }

  req.user = user
  next()
}