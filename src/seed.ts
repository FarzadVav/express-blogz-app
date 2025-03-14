import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./utils/crypto.utils.js";

const prisma = new PrismaClient()

export const seeding = async () => {
  let status = true

  try {
    await prisma.users.deleteMany()
    const { salt, hash } = hashPassword("root")
    const mainUser = await prisma.users.create({
      data: {
        name: "FarzadVav", email: "farzadvav@gmail.com", password: hash, passwordSalt: salt
      }
    })

    await prisma.posts.deleteMany()
    const POSTS = [
      { title: "title-1", content: "lorem-1", published: true, authorId: mainUser.id },
      { title: "title-2", content: "lorem-2", published: false, authorId: mainUser.id },
      { title: "title-3", content: "lorem-3", published: false, authorId: mainUser.id },
    ]
    await prisma.posts.createMany({ data: POSTS })
  } catch (error) {
    console.log("Unknown error on seeding prisma/postgresql:", error)
    status = false
  }

  return status
}