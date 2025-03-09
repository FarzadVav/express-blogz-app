import { Request } from "express";
import prisma from "../lib/db.js";

export const getPosts = async () => {
  const posts = await prisma.posts.findMany({
    include: {
      author: {
        select: { id: true, name: true }
      }
    }
  })

  return posts
}

export const getPostById = async (req: Request) => {
  const { id } = req.params

  const post = await prisma.posts.findUnique({
    where: { id: +id },
    include: {
      author: {
        select: { id: true, name: true }
      }
    }
  })

  return post
}

export const createPost = async (req: Request) => {
  const { title, content } = req.body
  const user = req.user

  const post = await prisma.posts.create({
    data: { title, content, authorId: user.id }
  })

  return post
}

export const updatePost = async (req: Request) => {
  const { id } = req.params
  const { title, content } = req.body
  const user = req.user

  const post = await prisma.posts.update({
    where: { id: +id, authorId: user.id },
    data: { title, content }
  })

  return post
}

export const deletePost = async (req: Request) => {
  const { id } = req.params

  const post = await prisma.posts.delete({ where: { id: +id } })

  return post
}
