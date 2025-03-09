import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional()
});

export const createPostSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1)
});
