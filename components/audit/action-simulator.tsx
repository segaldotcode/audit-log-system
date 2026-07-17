"use client";

import { simulateAuditEvent } from "@/lib/actions/simulate-audit-event";
import { AUDIT_ACTIONS } from "@/lib/audit/types";
import type { Dictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActionSimulatorProps {
  users: { id: string; email: string; persona_key: string }[];
  dict: Dictionary;
}

export function ActionSimulator({ users, dict }: ActionSimulatorProps) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">{dict.simulator.empty}</p>;
  }

  return (
    <form
      action={simulateAuditEvent}
      className="flex flex-wrap items-end gap-3 rounded-md border p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="userId" className="text-xs text-muted-foreground">
          {dict.simulator.personaLabel}
        </label>
        <Select name="userId" defaultValue={users[0].id}>
          <SelectTrigger id="userId" className="w-52" data-cuelume-press data-cuelume-release>
            <SelectValue>
              {(value: string | null) => users.find((user) => user.id === value)?.email ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id} data-cuelume-toggle>
                {user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="action" className="text-xs text-muted-foreground">
          {dict.simulator.actionLabel}
        </label>
        <Select name="action" defaultValue={AUDIT_ACTIONS[0]}>
          <SelectTrigger id="action" className="w-48" data-cuelume-press data-cuelume-release>
            <SelectValue>
              {(value: string | null) =>
                value ? dict.actions[value as keyof Dictionary["actions"]] : value
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {AUDIT_ACTIONS.map((action) => (
              <SelectItem key={action} value={action} data-cuelume-toggle>
                {dict.actions[action]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" data-cuelume-press data-cuelume-release>
        {dict.simulator.submit}
      </Button>
    </form>
  );
}
