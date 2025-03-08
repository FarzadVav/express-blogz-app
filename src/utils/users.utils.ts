import { Users } from "@prisma/client"

export const pickedUserFields = (user: Users) => {
  return {
    id: user.id,
    email: user.email,
    name: user.name
  }
}