import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Hashes a plain-text password using bcryptjs.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verifies a password against a bcryptjs hash.
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    return bcrypt.compareSync(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Creates a SHA-256 hash of a token or OTP code for database storage.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a random 6-digit numerical OTP.
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
