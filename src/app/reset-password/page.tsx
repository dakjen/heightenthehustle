import AuthShell from "@/app/components/AuthShell";
import { findValidToken, RESET_TOKEN_TTL_LABEL } from "@/lib/password-reset";
import ResetPasswordForm, { ResetLinkExpired } from "./ResetPasswordForm";

/**
 * The page the emailed link lands on. The token is checked here — without
 * being spent — so a stale link shows "ask for a new one" instead of a form
 * that is going to fail on submit.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const resolved = token ? await findValidToken(token) : null;

  if (!resolved || !token) {
    return (
      <AuthShell title="Link expired" subtitle="This password reset link can't be used.">
        <ResetLinkExpired ttlLabel={RESET_TOKEN_TTL_LABEL} />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="New password" subtitle={`Choose a new password for ${resolved.user.email}.`}>
      <ResetPasswordForm token={token} />
    </AuthShell>
  );
}
