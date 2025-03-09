import { Request } from "express";

import prisma from "../lib/db.js";
import { hashPassword } from "../utils/crypto.utils.js";

export const getUser = async (userId: number) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  return user;
};

export const createUser = async (req: Request) => {
  const { password } = req.body;
  const { hash, salt } = hashPassword(password);

  const user = await prisma.users.create({
    data: { ...req.body, password: hash, passwordSalt: salt },
  });

  return user;
};

export const updateUser = async (req: Request) => {
  const { password } = req.body;
  const { hash, salt } = hashPassword(password);

  const user = await prisma.users.update({
    where: { id: req.user.id },
    data: { ...req.body, password: hash, passwordSalt: salt },
  });

  return user;
};

export const deleteUser = async (req: Request) => {
  const user = await prisma.users.delete({
    where: { id: req.user.id },
  });

  return user;
};
