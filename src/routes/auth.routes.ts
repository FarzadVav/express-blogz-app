import { Router } from "express";

import prisma from "../lib/db.js";
import { signJWT } from "../lib/jose.js";
import { zodValidation } from "../lib/zodValidation.js";
import { pickedUserFields } from "../utils/users.utils.js";
import { hashPassword, verifyPassword } from "../utils/crypto.utils.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { createUserSchema, updateUserSchema } from "../lib/zodSchemas.js";

const authRouter = Router()

authRouter.get("/users/me", authMiddleware, async (req, res) => {
  const user = req.user

  res.send({ message: "User found", user: pickedUserFields(user) })
})

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

authRouter.put("/users", authMiddleware, async (req, res) => {
  const user = req.user
  const { name, email, password } = req.body

  const errors = zodValidation(updateUserSchema, req.body)

  if (errors) {
    res.status(400).send({ message: "Validation errors", errors })
    return
  }

  try {
    const { salt, hash } = hashPassword(password)

    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { name, email, password: hash, passwordSalt: salt }
    })

    res.send({ message: "User updated successfully", user: pickedUserFields(updatedUser) })
  } catch (error) {
    res.status(500).send({ message: "User update failed", error })
  }
})

authRouter.delete("/users", authMiddleware, async (req, res) => {
  const user = req.user

  try {
    await prisma.users.delete({ where: { id: user.id } })

    res.send({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).send({ message: "User deletion failed", error })
  }
})

export default authRouter