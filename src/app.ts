import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import prisma from "./lib/db.js";
import { hashPassword, verifyPassword } from "./lib/crypto.js";
import { signJWT, verifyJWT } from "./lib/jose.js";
import { zodValidation } from "./lib/zodValidation.js";
import { createUserSchema } from "./lib/zodSchemas.js";

// Definitions
dotenv.config()
const PORT = process.env.PORT
const app = express()

// curl -X POST http://localhost:3030/users -H "Content-Type: application/json" -d '{"email":"farzad@gmail.com","password":"farzadvav","name":"FarzadVav"}'
// 2c3ad1afbba2de17bec12bc02ee891ede8b396915210a46b922b5d77c90f36eb3cc37faa6eba5fff13ad3ad543bee0e7fa30eb2c1b81703ef32ddfb20ac058de

// Express app
app.use(express.json())
app.use(cookieParser())

app.get("/", (_, res) => {
  res.send({ message: "Welcome to the blogz-app API" }).status(200)
})

app.post("/users", async (req, res) => {
  const { email, password } = req.body

  const errors = zodValidation(createUserSchema, req.body)

  if (errors) {
    res.send({ message: "Validation errors", errors }).status(400)
    return
  }

  try {
    const isUserExists = await prisma.users.findUnique({
      where: { email }
    })

    if (isUserExists) {
      const passwordMatch = verifyPassword(password, isUserExists.password, isUserExists.passwordSalt)

      if (!passwordMatch) {
        res.send({ message: "Invalid password" }).status(400)
        return
      }

      res.send({ message: "User already exists", user: isUserExists }).status(400)
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

    res.send({ message: "User created successfully", user, token }).status(201)
  } catch (error) {
    res.send({ message: "User creation failed", error }).status(500)
  }
})

app.get("/users/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    res.send({ message: "Token is not provided" }).status(401)
    return
  }

  const payload = await verifyJWT(token)

  if (!payload) {
    res.send({ message: "Token is invalid" }).status(401)
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
    res.send({ message: "User not found" }).status(404)
    return
  }

  res.send({ message: "User found", user }).status(200)
})

// Application running
app.listen(PORT, () => {
  console.log(`App listening to port ${PORT}`)
})