import { AlertTriangle } from "lucide-react";
import type { SuspiciousAlert } from "@/lib/audit/suspicious-activity";

export function SuspiciousBanner({ alerts }: { alerts: SuspiciousAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-destructive">
        <AlertTriangle className="size-4" />
        Suspicious activity detected
      </div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {alerts.map((alert) => (
          <li key={`${alert.userId}-${alert.rule}`}>
            <span className="text-foreground">{alert.userEmail ?? alert.userId}</span>{" "}
            triggered {alert.count} events matching &quot;{alert.label}&quot; within{" "}
            {alert.windowMinutes} minutes.
          </li>
        ))}
      </ul>
    </div>
  );
}
