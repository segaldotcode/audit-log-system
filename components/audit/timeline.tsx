import Link from "next/link";
import { EventRow } from "./event-row";
import type { AuditLog } from "@/lib/audit/types";
import type { AuditLogCursor, AuditLogFilters } from "@/lib/audit/queries";

interface TimelineProps {
  logs: AuditLog[];
  nextCursor: AuditLogCursor | null;
  filters: AuditLogFilters;
}

function formatDateHeading(dateKey: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`));
}

function groupByDate(logs: AuditLog[]): [string, AuditLog[]][] {
  const groups = new Map<string, AuditLog[]>();
  for (const log of logs) {
    const key = log.createdAt.slice(0, 10);
    const list = groups.get(key) ?? [];
    list.push(log);
    groups.set(key, list);
  }
  return Array.from(groups.entries());
}

function buildNextHref(filters: AuditLogFilters, cursor: AuditLogCursor): string {
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  params.set("cursorCreatedAt", cursor.createdAt);
  params.set("cursorId", cursor.id);
  return `/?${params.toString()}`;
}

export function Timeline({ logs, nextCursor, filters }: TimelineProps) {
  if (logs.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No audit events match these filters yet. Simulate one above to populate the timeline.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {groupByDate(logs).map(([dateKey, events]) => (
        <section key={dateKey} className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {formatDateHeading(dateKey)}
          </h2>
          <div className="space-y-1">
            {events.map((log) => (
              <EventRow key={log.id} log={log} />
            ))}
          </div>
        </section>
      ))}

      {nextCursor && (
        <div className="pt-2 text-center">
          <Link
            href={buildNextHref(filters, nextCursor)}
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Load older events
          </Link>
        </div>
      )}
    </div>
  );
}
