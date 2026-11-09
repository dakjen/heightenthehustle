/**
 * bcrypt hashing for `users.password`. Server-side only.
 *
 * Split from `password.ts` so the rules module stays importable by the client
 * components that render password inputs — bcrypt is a native module and must
 * never be pulled into a browser bundle.
 *
 * This is a plain module, not a `"use server"` file, on purpose: nothing here
 * should be reachable as a server action.
 */
import bcrypt from "bcrypt";

/** bcrypt cost factor. Matches what existing rows were hashed with. */
const BCRYPT_ROUNDS = 10;

/** Hash a password for storage in `users.password`. */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** True when `password` matches the stored bcrypt hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
