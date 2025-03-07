import { Router } from "express"

import prisma from "../lib/db.js"
import { signJWT, verifyJWT } from "../lib/jose.js"
import { zodValidation } from "../lib/zodValidation.js"
import { createUserSchema } from "../lib/zodSchemas.js"
import { hashPassword, verifyPassword } from "../lib/crypto.js"

const authRouter = Router()

authRouter.post("/users", async (req, res) => {
  const { email, password } = req.body

  const errors = zodValidation(createUserSchema, req.body)

  if (errors) {
    res.status(400).send({ message: "Validation errors", errors })
    return
  }

  try {
    const prevUser = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true, passwordSalt: true }
    })

    if (prevUser) {
      const passwordMatch = verifyPassword(password, prevUser.password, prevUser.passwordSalt)

      if (!passwordMatch) {
        res.status(400).send({ message: "Invalid password" })
        return
      }

      const token = await signJWT({ id: prevUser.id })
      const currentUser = {
        id: prevUser.id,
        email: prevUser.email,
        name: prevUser.name
      }

      res.send({ message: "User logged in successfully", user: currentUser, token })
      return
    }

    const { salt, hash } = hashPassword(password)
    const user = await prisma.users.create({
      data: {
        email,
        password: hash,
        passwordSalt: salt,
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    const token = await signJWT({ id: user.id })

    res.status(201).send({ message: "User created successfully", user, token })
  } catch (error) {
    res.status(500).send({ message: "User creation failed", error })
  }
})

authRouter.get("/users/me", async (req, res) => {
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

  const user = await prisma.users.findUnique({
    where: { id: payload?.id },
    select: {
      id: true,
      email: true,
      name: true
    }
  })

  if (!user) {
    res.status(404).send({ message: "User not found" })
    return
  }

  res.send({ message: "User found", user })
})

export default authRouter