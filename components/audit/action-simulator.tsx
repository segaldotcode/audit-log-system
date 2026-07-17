import { simulateAuditEvent } from "@/app/actions";
import { AUDIT_ACTIONS } from "@/lib/audit/types";
import { Button } from "@/components/ui/button";

interface ActionSimulatorProps {
  users: { id: string; email: string; persona_key: string }[];
}

export function ActionSimulator({ users }: ActionSimulatorProps) {
  if (users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No personas found. Run supabase/schema.sql against your database first.
      </p>
    );
  }

  return (
    <form
      action={simulateAuditEvent}
      className="flex flex-wrap items-end gap-3 rounded-md border p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="userId" className="text-xs text-muted-foreground">
          Persona
        </label>
        <select
          id="userId"
          name="userId"
          defaultValue={users[0].id}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
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
          Action
        </label>
        <select
          id="action"
          name="action"
          defaultValue={AUDIT_ACTIONS[0]}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {AUDIT_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" size="sm">
        Simulate event
      </Button>
    </form>
  );
}
