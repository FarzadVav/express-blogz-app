import { Router } from "express";

import prisma from "../lib/db.js";
import { zodValidation } from "../lib/zodValidation.js";
import { createPostSchema } from "../lib/zodSchemas.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { createPost, deletePost, getPostById, getPosts, updatePost } from "../controllers/posts.controllers.js";

const postsRouter = Router()

postsRouter.route("/")
  // Get all posts
  .get(async (_, res) => {
    const posts = await getPosts()

    res.json(posts)
  })
  // Create a new post
  .post(authMiddleware, async (req, res) => {
    const errors = zodValidation(createPostSchema, req.body)

    if (errors) {
      res.status(400).send({ message: "Validation errors", errors })
      return
    }

    try {
      const post = await createPost(req)

      res.status(201).json(post)
    } catch (error) {
      res.status(500).json({ message: "Internal server error" })
    }
  })

postsRouter.route("/:id")
  // Get a post by id
  .get(async (req, res) => {
    try {
      const post = await getPostById(req)

      if (!post) {
        res.status(404).json({ message: "Post not found" })
        return
      }

      res.json(post)
    } catch (error) {
      res.status(500).json({ message: "Internal server error" })
    }
  })
  // Update a post by id
  .put(authMiddleware, async (req, res) => {
    const errors = zodValidation(createPostSchema, req.body)

    if (errors) {
      res.status(400).send({ message: "Validation errors", errors })
      return
    }

    try {
      const post = await updatePost(req)

      res.json(post)
    } catch (error) {
      res.status(500).json({ message: "Internal server error" })
    }
  })
  // Delete a post by id
  .delete(authMiddleware, async (req, res) => {
    try {
      await deletePost(req)

      res.json({ message: "Post deleted successfully" })
    } catch (error) {
      res.status(500).json({ message: "Internal server error" })
    }
  })

export default postsRouter