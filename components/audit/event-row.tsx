"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { AuditLog } from "@/lib/audit/types";

const DESTRUCTIVE_ACTIONS = new Set(["LOGIN_FAILED", "PAYMENT_FAILED"]);
const SECONDARY_ACTIONS = new Set(["PAYMENT_REFUNDED"]);

function badgeVariant(action: string): "destructive" | "secondary" | "outline" {
  if (DESTRUCTIVE_ACTIONS.has(action)) return "destructive";
  if (SECONDARY_ACTIONS.has(action)) return "secondary";
  return "outline";
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

export function EventRow({ log }: { log: AuditLog }) {
  const status = typeof log.metadata.status === "string" ? log.metadata.status : null;
  const duration = typeof log.metadata.durationMs === "number" ? log.metadata.durationMs : null;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button className="flex w-full items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2 text-left text-sm transition-colors hover:border-border hover:bg-muted/50" />
        }
      >
        <span className="flex min-w-0 items-center gap-3">
          <Badge variant={badgeVariant(log.action)}>{log.action}</Badge>
          <span className="truncate text-muted-foreground">{log.userEmail ?? "system"}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-muted-foreground">
          {status === "failed" && <span className="text-destructive">failed</span>}
          {duration !== null && <span className="tabular-nums">{duration}ms</span>}
          <span className="tabular-nums">{formatTime(log.createdAt)}</span>
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant={badgeVariant(log.action)}>{log.action}</Badge>
            {log.userEmail ?? "system"}
          </DialogTitle>
        </DialogHeader>

        <dl className="grid grid-cols-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Time</dt>
          <dd className="col-span-2">{new Date(log.createdAt).toLocaleString("en-US")}</dd>

          {duration !== null && (
            <>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="col-span-2">{duration}ms</dd>
            </>
          )}

          <dt className="text-muted-foreground">IP</dt>
          <dd className="col-span-2">{log.ip ?? "n/a"}</dd>

          <dt className="text-muted-foreground">User agent</dt>
          <dd className="col-span-2 truncate">{log.userAgent ?? "n/a"}</dd>
        </dl>

        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Replay data</p>
          <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
            {JSON.stringify(log.metadata, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}
