import { Users } from "@prisma/client";

declare global {
  namespace Express {
    interface Request { user?: Pick<Users, "id" | "email" | "name">; }
  }
}

export { };