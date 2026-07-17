import { createClient } from "@/lib/supabase/server";

export interface SuspiciousAlert {
  userId: string;
  userEmail: string | null;
  rule: "rapid_login_attempts" | "rapid_payments";
  label: string;
  count: number;
  windowMinutes: number;
  firstOccurredAt: string;
  lastOccurredAt: string;
}

interface Rule {
  rule: SuspiciousAlert["rule"];
  label: string;
  actions: string[];
  threshold: number;
  windowMinutes: number;
}

const RULES: Rule[] = [
  {
    rule: "rapid_login_attempts",
    label: "Too many login attempts in a short window",
    actions: ["LOGIN_ATTEMPT", "LOGIN_FAILED"],
    threshold: 5,
    windowMinutes: 3,
  },
  {
    rule: "rapid_payments",
    label: "Too many payments created from the same account",
    actions: ["PAYMENT_CREATED"],
    threshold: 5,
    windowMinutes: 10,
  },
];

const LOOKBACK_HOURS = 24;

interface RecentEventRow {
  user_id: string | null;
  created_at: string;
  users: { email: string } | null;
}

// Scans the lookback window once per rule and slides a fixed-size window over
// each user's events in memory, instead of running a windowed query per user.
export async function detectSuspiciousActivity(): Promise<SuspiciousAlert[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();
  const alerts: SuspiciousAlert[] = [];

  for (const rule of RULES) {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("user_id, created_at, users(email)")
      .in("action", rule.actions)
      .gte("created_at", since)
      .not("user_id", "is", null)
      .order("created_at", { ascending: true })
      .returns<RecentEventRow[]>();

    if (error || !data) {
      if (error) console.error(`Failed to run suspicious activity rule "${rule.rule}":`, error);
      continue;
    }

    const eventsByUser = new Map<string, { createdAt: string; email: string | null }[]>();
    for (const row of data) {
      if (!row.user_id) continue;
      const events = eventsByUser.get(row.user_id) ?? [];
      events.push({ createdAt: row.created_at, email: row.users?.email ?? null });
      eventsByUser.set(row.user_id, events);
    }

    for (const [userId, events] of eventsByUser) {
      let windowStart = 0;

      for (let i = 0; i < events.length; i++) {
        const windowMs = rule.windowMinutes * 60 * 1000;
        while (
          new Date(events[i].createdAt).getTime() - new Date(events[windowStart].createdAt).getTime() >
          windowMs
        ) {
          windowStart++;
        }

        const count = i - windowStart + 1;
        if (count >= rule.threshold) {
          alerts.push({
            userId,
            userEmail: events[i].email,
            rule: rule.rule,
            label: rule.label,
            count,
            windowMinutes: rule.windowMinutes,
            firstOccurredAt: events[windowStart].createdAt,
            lastOccurredAt: events[i].createdAt,
          });
          break;
        }
      }
    }
  }

  return alerts.sort((a, b) => (a.lastOccurredAt < b.lastOccurredAt ? 1 : -1));
}
