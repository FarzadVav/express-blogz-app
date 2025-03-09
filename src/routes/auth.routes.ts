import { Router } from "express";

import prisma from "../lib/db.js";
import { signJWT } from "../lib/jose.js";
import { zodValidation } from "../lib/zodValidation.js";
import { pickedUserFields } from "../utils/users.utils.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { hashPassword, verifyPassword } from "../utils/crypto.utils.js";
import { createUserSchema, updateUserSchema } from "../lib/zodSchemas.js";

const authRouter = Router()

authRouter.route("/")
  // Register a new user
  .post(async (req, res) => {
    const { email, password, name } = req.body

    const errors = zodValidation(createUserSchema, req.body)

    if (errors) {
      res.status(400).send({ message: "Validation errors", errors })
      return
    }

    try {
      const prevUser = await prisma.users.findUnique({
        where: { email }
      })

      if (prevUser) {
        const passwordMatch = verifyPassword(password, prevUser.password, prevUser.passwordSalt)

        if (!passwordMatch) {
          res.status(400).send({ message: "Invalid password" })
          return
        }

        const token = await signJWT({ id: prevUser.id })

        res.send({ message: "User logged in successfully", user: pickedUserFields(prevUser), token })
        return
      }

      const { salt, hash } = hashPassword(password)
      const user = await prisma.users.create({
        data: {
          email,
          name,
          password: hash,
          passwordSalt: salt
        }
      })

      const token = await signJWT({ id: user.id })

      res.status(201).send({ message: "User created successfully", user: pickedUserFields(user), token })
    } catch (error) {
      res.status(500).send({ message: "User creation failed", error })
    }
  })
  // Update user details
  .put(authMiddleware, async (req, res) => {
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
  // Delete user account
  .delete(authMiddleware, async (req, res) => {
    const user = req.user

    try {
      await prisma.users.delete({ where: { id: user.id } })

      res.send({ message: "User deleted successfully" })
    } catch (error) {
      res.status(500).send({ message: "User deletion failed", error })
    }
  })
  // Get user details
  .get(authMiddleware, async (req, res) => {
    const user = req.user

    res.send({ message: "User found", user: pickedUserFields(user) })
  })

export default authRouter