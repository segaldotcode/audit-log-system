import { simulateAuditEvent } from "@/lib/actions/simulate-audit-event";
import { AUDIT_ACTIONS } from "@/lib/audit/types";
import type { Dictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

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
        <select
          id="userId"
          name="userId"
          defaultValue={users[0].id}
          className="h-8 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="action" className="text-xs text-muted-foreground">
          {dict.simulator.actionLabel}
        </label>
        <select
          id="action"
          name="action"
          defaultValue={AUDIT_ACTIONS[0]}
          className="h-8 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {AUDIT_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {dict.actions[action]}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" data-cuelume-press data-cuelume-release>
        {dict.simulator.submit}
      </Button>
    </form>
  );
}
