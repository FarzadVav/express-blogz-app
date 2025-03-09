import { Router } from "express";

import prisma from "../lib/db.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { zodValidation } from "../lib/zodValidation.js";
import { createPostSchema } from "../lib/zodSchemas.js";

const postsRouter = Router()

postsRouter
  .get("/", async (_, res) => {
    const posts = await prisma.posts.findMany({
      include: {
        author: {
          select: { id: true, name: true }
        }
      }
    })

    res.json(posts)
  })
  .post("/", authMiddleware, async (req, res) => {
    const { title, content } = req.body
    const user = req.user

    const errors = zodValidation(createPostSchema, req.body)

    if (errors) {
      res.status(400).send({ message: "Validation errors", errors })
      return
    }

    try {
      const post = await prisma.posts.create({
        data: { title, content, authorId: user.id }
      })

      res.status(201).json(post)
    } catch (error) {
      res.status(500).json({ message: "Internal server error" })
    }
  })

postsRouter
  .get("/:id", async (req, res) => {
    const { id } = req.params

    try {
      const post = await prisma.posts.findUnique({
        where: { id: +id },
        include: {
          author: {
            select: { id: true, name: true }
          }
        }
      })

      if (!post) {
        res.status(404).json({ message: "Post not found" })
        return
      }

      res.json(post)
    } catch (error) {
      res.status(500).json({ message: "Internal server error" })
    }
  })
  .put("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params
    const { title, content } = req.body

    const errors = zodValidation(createPostSchema, req.body)

    if (errors) {
      res.status(400).send({ message: "Validation errors", errors })
      return
    }

    try {
      const post = await prisma.posts.update({
        where: { id: +id },
        data: { title, content }
      })

      res.json(post)
    } catch (error) {
      res.status(500).json({ message: "Internal server error" })
    }
  })
  .delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params

    try {
      await prisma.posts.delete({ where: { id: +id } })

      res.json({ message: "Post deleted successfully" })
    } catch (error) {
      res.status(500).json({ message: "Internal server error" })
    }
  })

export default postsRouter