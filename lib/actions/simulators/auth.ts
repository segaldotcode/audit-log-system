import { withAuditLog } from "@/lib/audit/with-audit-log";
import type { RequestContext } from "../request-context";

export type AuthAction = "LOGIN_ATTEMPT" | "LOGIN_SUCCEEDED" | "LOGIN_FAILED";

interface AuthInput {
  reason?: string;
}

async function performLogin(action: AuthAction, input: AuthInput) {
  if (action === "LOGIN_FAILED") {
    throw new Error(input.reason ?? "invalid_credentials");
  }
  return { success: true };
}

export async function simulateAuthAction(
  action: AuthAction,
  userId: string,
  ctx: RequestContext,
) {
  const input: AuthInput = action === "LOGIN_FAILED" ? { reason: "invalid_credentials" } : {};

  const runAction = withAuditLog({ action, userId, ...ctx }, (i: AuthInput) =>
    performLogin(action, i),
  );

  await runAction(input);
}
