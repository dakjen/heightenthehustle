/**
 * Safe ways to read the `users` table.
 *
 * `users.password` holds a bcrypt hash and must never leave the server: not in
 * a server action's return value, not in a page's props, not in an export.
 * Both selectors below are derived from the schema itself, so a column added
 * to `users` later is included automatically while the password stays out.
 *
 * Use `safeUserColumns` with the relational API (`db.query.users.…`) and
 * `safeUserSelect` with the builder API (`db.select(…).from(users)`).
 */
import { getTableColumns } from "drizzle-orm";
import { users, type User } from "@/db/schema";

/** A user row with the password hash removed. */
export type SafeUser = Omit<User, "password">;

const { password: _password, ...safeColumns } = getTableColumns(users);

/** Every column except `password`, for `db.select(safeUserSelect).from(users)`. */
export const safeUserSelect = safeColumns;

/** Every column except `password`, for `db.query.users.findMany({ columns: safeUserColumns })`. */
export const safeUserColumns = Object.fromEntries(
  Object.keys(safeColumns).map((name) => [name, true]),
) as { [K in keyof SafeUser]: true };
