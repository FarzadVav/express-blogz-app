import dotenv from "dotenv";
import helmet from "helmet";
import express from "express";
import compression from "compression";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";

// --- Definitions
dotenv.config()
const PORT = process.env.PORT
const app = express()

// --- Express app
app.disable("x-powered-by")
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(compression())

/* Welcome route */
app.get("/", (_, res) => {
  res.send({ message: "Welcome to the blogz-app API" })
})

/* Auth routes */
app.use("/auth", authRouter)

/* 404 handler */
app.use((_, res) => {
  res.status(404).send("Sorry can't find that!")
})

// --- Application running
app.listen(PORT, () => {
  console.log(`App listening to port ${PORT}`)
})