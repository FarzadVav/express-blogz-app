import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import prisma from "./lib/db.js";
import { signJWT, verifyJWT } from "./lib/jose.js";
import { hashPassword } from "./lib/crypto.js";
import { zodValidation } from "./lib/zodValidation.js";
import { createUserSchema } from "./lib/zodSchemas.js";
import { TOKEN_CONFIGS } from "./configs/cookies.configs.js";

// Definitions
dotenv.config()
const PORT = process.env.PORT
const app = express()

// Express app
app.use(cookieParser())

app.get("/", (_, res) => {
  res.send({ message: "Welcome to the blogz-app API" }).status(200)
})

app.post("/users", async (req, res) => {
  const { email, password, name } = req.body

  const errors = zodValidation(createUserSchema, req.body)

  if (errors) {
    res.send({ message: "Validation errors", errors }).status(400)
    return
  }

  try {
    const { salt, hash } = hashPassword(password)

    const user = await prisma.users.create({
      data: {
        email,
        password: hash,
        passwordSalt: salt,
        name
      }
    })

    const token = await signJWT({ id: user.id })

    res.cookie(TOKEN_CONFIGS.name, token, TOKEN_CONFIGS.options)

    res.send({ message: "User created successfully", user }).status(201)
  } catch (error) {
    res.send({ message: "User creation failed", error }).status(500)
  }
})

app.get("/users/me", async (req, res) => {
  const token = req.cookies[TOKEN_CONFIGS.name]

  if (!token) {
    res.send({ message: "Unauthorized" }).status(401)
    return
  }

  const payload = await verifyJWT(token)

  if (!payload) {
    res.send({ message: "Unauthorized" }).status(401)
    return
  }

  const user = await prisma.users.findUnique({
    where: { id: payload?.id }
  })

  if (!user) {
    res.send({ message: "User not found" }).status(404)
    return
  }

  res.send({ message: "User found", user }).status(200)
})

// Application running
app.listen(PORT, () => {
  console.log(`App listening to port ${PORT}`)
})