/**
 * The one place the password rules live.
 *
 * Every entry point that sets a password — the account request form, the
 * emailed reset link, the signed-in "change password" form — validates
 * through here, so the rule a form advertises and the rule the server
 * enforces can never drift apart.
 *
 * Deliberately free of server-only imports (no bcrypt, no database): the
 * password inputs are client components and read `PASSWORD_MIN_LENGTH` and
 * `PASSWORD_HINT` straight from this file. Hashing lives next door in
 * `password-hash.ts`, which must stay server-side.
 */

/** Minimum length, matched by the `minLength` on every password input. */
export const PASSWORD_MIN_LENGTH = 8;

/** Shown under password inputs so the form states the rule before it rejects. */
export const PASSWORD_HINT = `At least ${PASSWORD_MIN_LENGTH} characters. Mix letters and numbers for a stronger password.`;

/**
 * Check a new password and its confirmation.
 *
 * Returns a message to show the person, or null when the password is fine.
 * Deliberately short: a long list of composition rules pushes people toward
 * predictable passwords, so length is the only hard requirement.
 */
export function validateNewPassword(password: unknown, confirmation: unknown): string | null {
  const weak = validatePasswordStrength(password);
  if (weak) return weak;
  if (typeof confirmation !== "string" || password !== confirmation) {
    return "The two passwords don't match.";
  }
  return null;
}

/**
 * The length rules on their own, for forms with no "confirm password" field
 * (the account request form). Returns a message or null.
 */
export function validatePasswordStrength(password: unknown): string | null {
  if (typeof password !== "string" || password.length === 0) {
    return "Enter a password.";
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Your password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  // bcrypt silently ignores anything past 72 bytes, so refuse rather than
  // store a password whose tail does not count.
  if (new TextEncoder().encode(password).length > 72) {
    return "That password is too long. Please use 72 characters or fewer.";
  }
  return null;
}
