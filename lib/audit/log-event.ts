import { createClient } from "@/lib/supabase/server";
import { sanitizeMetadata } from "./sanitize-metadata";
import type { LogEventInput } from "./types";

// Central entry point for recording an action. Every module in the ecosystem
// that writes to audit_logs should go through this function, not a raw insert,
// so sanitization and shape stay consistent.
export async function logEvent(input: LogEventInput): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("audit_logs").insert({
    user_id: input.userId ?? null,
    action: input.action,
    metadata: sanitizeMetadata(input.metadata ?? {}),
    ip: input.ip ?? null,
    user_agent: input.userAgent ?? null,
  });

  if (error) {
    throw new Error(`Failed to log audit event: ${error.message}`);
  }
}
