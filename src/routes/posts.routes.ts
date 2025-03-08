import { Router } from "express";

import prisma from "../lib/db.js";

const postsRouter = Router()

postsRouter.get("/", async (_, res) => {
  const posts = await prisma.posts.findMany({
    include: {
      author: {
        select: { id: true, name: true }
      }
    }
  })

  res.json(posts)
})

postsRouter.get("/:id", async (req, res) => {
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

export default postsRouter