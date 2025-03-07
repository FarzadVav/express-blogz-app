import { SignJWT, jwtVerify } from "jose";

export type JWTUser = {
  id: number
}

const SECRET = Buffer.from(process.env.JWT_SECRET as string)

export const signJWT = async (payload: JWTUser) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(SECRET)

  return token
}

export const verifyJWT = async (token: string) => {
  const { payload } = await jwtVerify(token, SECRET)

  return payload as JWTUser | null
}
