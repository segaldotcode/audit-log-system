import { withAuditLog } from "@/lib/audit/with-audit-log";
import { randomAmount } from "@/lib/utils";
import type { RequestContext } from "../request-context";

export type PaymentAction =
  | "PAYMENT_CREATED"
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED";

interface PaymentInput {
  amount: number;
  currency: string;
}

async function performPayment(action: PaymentAction, input: PaymentInput) {
  if (action === "PAYMENT_FAILED") {
    throw new Error("card_declined");
  }
  if (action === "PAYMENT_REFUNDED") {
    return { ...input, reason: "customer_request" };
  }
  return { ...input, success: true };
}

export async function simulatePaymentAction(
  action: PaymentAction,
  userId: string,
  ctx: RequestContext,
) {
  const input: PaymentInput = { amount: randomAmount(), currency: "USD" };

  const runAction = withAuditLog({ action, userId, ...ctx }, (i: PaymentInput) =>
    performPayment(action, i),
  );

  await runAction(input);
}
