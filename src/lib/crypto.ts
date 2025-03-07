import crypto from "crypto";

export const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");

  return { salt, hash };
};

export const verifyPassword = (password: string, storedHash: string, salt: string) => {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");

  return hash === storedHash;
};