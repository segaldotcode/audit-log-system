import { withAuditLog } from "@/lib/audit/with-audit-log";
import type { RequestContext } from "../request-context";

interface FlagInput {
  flag: string;
  enabled: boolean;
}

async function performFlagToggle(input: FlagInput) {
  return input;
}

export async function simulateFlagAction(userId: string, ctx: RequestContext) {
  const input: FlagInput = { flag: "new_checkout", enabled: Math.random() > 0.5 };

  const runAction = withAuditLog({ action: "FLAG_TOGGLED", userId, ...ctx }, (i: FlagInput) =>
    performFlagToggle(i),
  );

  await runAction(input);
}
