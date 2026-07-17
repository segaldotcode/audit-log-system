import { logEvent } from "./log-event";
import type { AuditAction } from "./types";

interface WithAuditLogOptions {
  action: AuditAction | (string & {});
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

// Wraps a server action so every call is logged automatically, without each
// call site having to remember to call logEvent itself. Captures the input,
// the result (or error) and the duration, which is exactly what the replay
// view needs to reconstruct what happened during a given action.
export function withAuditLog<Args extends unknown[], Result>(
  options: WithAuditLogOptions,
  fn: (...args: Args) => Promise<Result>,
) {
  return async (...args: Args): Promise<Result> => {
    const startedAt = performance.now();

    try {
      const result = await fn(...args);

      await logEvent({
        userId: options.userId,
        action: options.action,
        ip: options.ip,
        userAgent: options.userAgent,
        metadata: {
          input: args.length === 1 ? args[0] : args,
          result,
          durationMs: Math.round(performance.now() - startedAt),
          status: "success",
        },
      });

      return result;
    } catch (err) {
      await logEvent({
        userId: options.userId,
        action: options.action,
        ip: options.ip,
        userAgent: options.userAgent,
        metadata: {
          input: args.length === 1 ? args[0] : args,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Math.round(performance.now() - startedAt),
          status: "failed",
        },
      });

      throw err;
    }
  };
}
