export const TOKEN_CONFIGS = {
  name: "token",
  options: {
    path: "/",
    sameSite: true,
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}
