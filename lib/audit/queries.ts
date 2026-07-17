import { createClient } from "@/lib/supabase/server";
import type { AuditLog } from "./types";

const PAGE_SIZE = 25;

export interface AuditLogFilters {
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogCursor {
  createdAt: string;
  id: string;
}

export interface ListAuditLogsResult {
  logs: AuditLog[];
  nextCursor: AuditLogCursor | null;
}

interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  users: { email: string; persona_key: string } | null;
}

function mapRow(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    userId: row.user_id,
    userEmail: row.users?.email ?? null,
    action: row.action,
    metadata: row.metadata,
    ip: row.ip,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  };
}

// Keyset pagination on (created_at, id) instead of OFFSET: audit logs grow
// fast and OFFSET pagination gets slower the deeper a caller pages in,
// since Postgres still has to scan and discard every skipped row.
export async function listAuditLogs(
  filters: AuditLogFilters = {},
  cursor: AuditLogCursor | null = null,
): Promise<ListAuditLogsResult> {
  const supabase = await createClient();

  let query = supabase
    .from("audit_logs")
    .select("id, user_id, action, metadata, ip, user_agent, created_at, users(email, persona_key)")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (filters.action) query = query.eq("action", filters.action);
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query.returns<AuditLogRow[]>();

  if (error || !data) {
    console.error("Failed to load audit logs:", error);
    return { logs: [], nextCursor: null };
  }

  const hasMore = data.length > PAGE_SIZE;
  const page = hasMore ? data.slice(0, PAGE_SIZE) : data;
  const last = page[page.length - 1];

  return {
    logs: page.map(mapRow),
    nextCursor: hasMore && last ? { createdAt: last.created_at, id: last.id } : null,
  };
}

export async function getDistinctActions(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("audit_logs").select("action");

  if (error || !data) return [];

  return Array.from(new Set(data.map((row) => row.action))).sort();
}

export async function getUsersForFilter(): Promise<
  { id: string; email: string; persona_key: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, persona_key")
    .order("persona_key");

  if (error || !data) return [];

  return data;
}
