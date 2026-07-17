import { AlertTriangle } from "lucide-react";
import { formatSuspiciousAlert, type Dictionary } from "@/lib/i18n";
import type { SuspiciousAlert } from "@/lib/audit/suspicious-activity";

interface SuspiciousBannerProps {
  alerts: SuspiciousAlert[];
  dict: Dictionary;
}

export function SuspiciousBanner({ alerts, dict }: SuspiciousBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-destructive">
        <AlertTriangle className="size-4" />
        {dict.suspicious.heading}
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {alerts.map((alert) => (
          <li key={`${alert.userId}-${alert.rule}`}>
            <span className="text-foreground">{alert.userEmail ?? alert.userId}</span>{" "}
            {formatSuspiciousAlert(alert, dict)}
          </li>
        ))}
      </ul>
    </div>
  );
}
