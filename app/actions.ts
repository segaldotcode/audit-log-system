"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { withAuditLog } from "@/lib/audit/with-audit-log";
import type { AuditAction } from "@/lib/audit/types";

function randomAmount(): number {
  return Math.round((Math.random() * 50000 + 1000) / 100) * 100;
}

const SAMPLE_METADATA: Record<AuditAction, () => Record<string, unknown>> = {
  LOGIN_ATTEMPT: () => ({}),
  LOGIN_SUCCEEDED: () => ({}),
  LOGIN_FAILED: () => ({ reason: "invalid_credentials" }),
  PAYMENT_CREATED: () => ({ amount: randomAmount(), currency: "XOF" }),
  PAYMENT_SUCCEEDED: () => ({ amount: randomAmount(), currency: "XOF" }),
  PAYMENT_FAILED: () => ({ reason: "card_declined" }),
  PAYMENT_REFUNDED: () => ({
    amount: randomAmount(),
    currency: "XOF",
    reason: "customer_request",
  }),
  FLAG_TOGGLED: () => ({ flag: "new_checkout", enabled: Math.random() > 0.5 }),
  USER_UPDATED: () => ({ field: "email" }),
};

const FAILING_ACTIONS = new Set<AuditAction>(["LOGIN_FAILED", "PAYMENT_FAILED"]);

// Stands in for the real business logic a payment/auth module would run.
// Only exists so the simulator can demonstrate withAuditLog on a real
// success/failure path, not just insert a log row directly.
async function performSimulatedAction(
  action: AuditAction,
  metadata: Record<string, unknown>,
) {
  if (FAILING_ACTIONS.has(action)) {
    throw new Error((metadata.reason as string) ?? "action_failed");
  }
  return { success: true };
}

// Triggers a realistic action for a chosen persona so the timeline has
// something to show without needing the other ecosystem modules wired up.
export async function simulateAuditEvent(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const action = String(formData.get("action") ?? "") as AuditAction;

  if (!userId || !action) return;

  const requestHeaders = await headers();
  const runAction = withAuditLog(
    {
      action,
      userId,
      ip: requestHeaders.get("x-forwarded-for") ?? "127.0.0.1",
      userAgent: requestHeaders.get("user-agent") ?? "unknown",
    },
    (metadata: Record<string, unknown>) => performSimulatedAction(action, metadata),
  );

  try {
    await runAction(SAMPLE_METADATA[action]?.() ?? {});
  } catch {
    // expected for the *_FAILED demo actions, already recorded by withAuditLog
  } finally {
    revalidatePath("/");
  }
}
