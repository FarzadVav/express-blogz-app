import { JWTPayload, SignJWT, jwtVerify } from "jose";

const SECRET = Buffer.from(process.env.JWT_SECRET as string)

export const signJWT = async (payload: JWTPayload) => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(SECRET)

  return token
}

export const verifyJWT = async (token: string) => {
  const { payload } = await jwtVerify(token, SECRET)

  return payload
}
