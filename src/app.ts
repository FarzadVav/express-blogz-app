import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes.js";

// Definitions
dotenv.config()
const PORT = process.env.PORT
const app = express()

// Express app
app.use(express.json())
app.use(cookieParser())

app.get("/", (_, res) => {
  res.send({ message: "Welcome to the blogz-app API" })
})

app.use("/auth", authRouter)

// Application running
app.listen(PORT, () => {
  console.log(`App listening to port ${PORT}`)
})