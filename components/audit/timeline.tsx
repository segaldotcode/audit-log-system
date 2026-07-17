import Link from "next/link";
import { EventRow } from "./event-row";
import { TimelineAccordion } from "./timeline-accordion";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatDateHeading } from "@/lib/utils";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { AuditLog } from "@/lib/audit/types";
import type { AuditLogCursor, AuditLogFilters } from "@/lib/audit/queries";

interface TimelineProps {
  logs: AuditLog[];
  nextCursor: AuditLogCursor | null;
  filters: AuditLogFilters;
  dict: Dictionary;
  locale: Locale;
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

function buildNextHref(
  filters: AuditLogFilters,
  cursor: AuditLogCursor,
  locale: Locale,
): string {
  const params = new URLSearchParams();
  if (filters.action) params.set("action", filters.action);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (locale === "fr") params.set("lang", "fr");
  params.set("cursorCreatedAt", cursor.createdAt);
  params.set("cursorId", cursor.id);
  return `/?${params.toString()}`;
}

export function Timeline({ logs, nextCursor, filters, dict, locale }: TimelineProps) {
  if (logs.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{dict.timeline.empty}</p>;
  }

  const groups = groupByDate(logs);

  return (
    <div className="space-y-4">
      <TimelineAccordion dateKeys={groups.map(([dateKey]) => dateKey)}>
        {groups.map(([dateKey, events]) => (
          <AccordionItem key={dateKey} value={dateKey}>
            <AccordionTrigger>{formatDateHeading(dateKey, locale)}</AccordionTrigger>
            <AccordionContent className="space-y-1">
              {events.map((log) => (
                <EventRow key={log.id} log={log} dict={dict} locale={locale} />
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </TimelineAccordion>

      {nextCursor && (
        <div className="pt-2 text-center">
          <Link
            href={buildNextHref(filters, nextCursor, locale)}
            data-cuelume-hover="tick"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {dict.timeline.loadOlder}
          </Link>
        </div>
      )}
    </div>
  );
}
