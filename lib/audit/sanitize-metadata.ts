const SENSITIVE_METADATA_KEYS = new Set([
  "password",
  "token",
  "secret",
  "apikey",
  "authorization",
  "creditcard",
  "cvv",
]);

// Strips known-sensitive keys before metadata reaches the audit_logs table,
// since tokens or passwords logged here would be readable by anyone with dashboard access.
export function sanitizeMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(metadata).filter(
      ([key]) => !SENSITIVE_METADATA_KEYS.has(key.toLowerCase().replace(/[_-]/g, "")),
    ),
  );
}
