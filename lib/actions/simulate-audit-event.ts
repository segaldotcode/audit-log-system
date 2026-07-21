"use server";

import { revalidatePath } from "next/cache";
import type { AuditAction } from "@/lib/audit/types";
import { getRequestContext } from "./request-context";
import { simulateAuthAction, type AuthAction } from "./simulators/auth";
import { simulatePaymentAction, type PaymentAction } from "./simulators/payments";
import { simulateFlagAction } from "./simulators/flags";
import { simulateUserAction } from "./simulators/users";

const AUTH_ACTIONS = new Set<AuditAction>(["LOGIN_ATTEMPT", "LOGIN_SUCCEEDED", "LOGIN_FAILED"]);
const PAYMENT_ACTIONS = new Set<AuditAction>([
  "PAYMENT_CREATED",
  "PAYMENT_PROCESSING",
  "PAYMENT_SUCCEEDED",
  "PAYMENT_FAILED",
  "PAYMENT_REFUNDED",
]);

// Triggers a realistic action for a chosen persona so the timeline has
// something to show without needing the other ecosystem modules wired up.
// Routes to the domain-specific simulator that owns the real logic and the
// withAuditLog call for that action.
export async function simulateAuditEvent(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  const action = String(formData.get("action") ?? "") as AuditAction;

  if (!userId || !action) return;

  const ctx = await getRequestContext();

  try {
    if (AUTH_ACTIONS.has(action)) {
      await simulateAuthAction(action as AuthAction, userId, ctx);
    } else if (PAYMENT_ACTIONS.has(action)) {
      await simulatePaymentAction(action as PaymentAction, userId, ctx);
    } else if (action === "FLAG_TOGGLED") {
      await simulateFlagAction(userId, ctx);
    } else if (action === "USER_UPDATED") {
      await simulateUserAction(userId, ctx);
    }
  } catch {
    // expected for the *_FAILED demo actions, already recorded by withAuditLog
  } finally {
    revalidatePath("/");
  }
}
