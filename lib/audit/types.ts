export const AUDIT_ACTIONS = [
  "LOGIN_ATTEMPT",
  "LOGIN_SUCCEEDED",
  "LOGIN_FAILED",
  "PAYMENT_CREATED",
  "PAYMENT_SUCCEEDED",
  "PAYMENT_FAILED",
  "PAYMENT_REFUNDED",
  "FLAG_TOGGLED",
  "USER_UPDATED",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLog {
  id: string;
  userId: string | null;
  action: AuditAction | (string & {});
  metadata: Record<string, unknown>;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface LogEventInput {
  userId?: string | null;
  action: AuditAction | (string & {});
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}
