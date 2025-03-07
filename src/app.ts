import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import prisma from "./lib/db.js";
import { zodValidation } from "./lib/zodValidation.js";
import { createUserSchema } from "./lib/zodSchemas.js";

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
  const { email, name } = req.body

  const errors = zodValidation(createUserSchema, req.body)

  if (errors) {
    res.send({ message: "Validation errors", errors }).status(400)
    return
  }

  try {
    const user = await prisma.users.create({
      data: {
        email,
        name
      }
    })

    res.send({ message: "User created successfully", user }).status(201)
  } catch (error) {
    res.send({ message: "User creation failed", error }).status(500)
  }
})

// Application running
app.listen(PORT, () => {
  console.log(`App listening to port ${PORT}`)
})