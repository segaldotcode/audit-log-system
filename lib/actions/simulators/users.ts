import { withAuditLog } from "@/lib/audit/with-audit-log";
import type { RequestContext } from "../request-context";

const EDITABLE_FIELDS = ["email", "plan", "segment"];

interface UserUpdateInput {
  field: string;
}

async function performUserUpdate(input: UserUpdateInput) {
  return input;
}

export async function simulateUserAction(userId: string, ctx: RequestContext) {
  const input: UserUpdateInput = {
    field: EDITABLE_FIELDS[Math.floor(Math.random() * EDITABLE_FIELDS.length)],
  };

  const runAction = withAuditLog(
    { action: "USER_UPDATED", userId, ...ctx },
    (i: UserUpdateInput) => performUserUpdate(i),
  );

  await runAction(input);
}
