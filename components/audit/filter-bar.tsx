"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dictionary } from "@/lib/i18n";

const ALL = "__all__";

interface FilterBarProps {
  actions: string[];
  users: { id: string; email: string; persona_key: string }[];
  dict: Dictionary;
}

export function FilterBar({ actions, users, dict }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("cursorCreatedAt");
    params.delete("cursorId");
    router.push(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  }

  const currentAction = searchParams.get("action") ?? ALL;
  const currentUserId = searchParams.get("userId") ?? ALL;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={currentAction} onValueChange={(value) => updateParam("action", value)}>
        <SelectTrigger className="w-45" data-cuelume-press data-cuelume-release>
          <SelectValue placeholder={dict.filters.allActions} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL} data-cuelume-toggle>
            {dict.filters.allActions}
          </SelectItem>
          {actions.map((action) => (
            <SelectItem key={action} value={action} data-cuelume-toggle>
              {dict.actions[action as keyof Dictionary["actions"]] ?? action}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentUserId} onValueChange={(value) => updateParam("userId", value)}>
        <SelectTrigger className="w-50" data-cuelume-press data-cuelume-release>
          <SelectValue placeholder={dict.filters.allUsers} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL} data-cuelume-toggle>
            {dict.filters.allUsers}
          </SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id} data-cuelume-toggle>
              {user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        type="date"
        aria-label={dict.filters.fromDate}
        defaultValue={searchParams.get("dateFrom")?.slice(0, 10) ?? ""}
        onChange={(event) =>
          updateParam(
            "dateFrom",
            event.target.value ? new Date(event.target.value).toISOString() : "",
          )
        }
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
      />

      <input
        type="date"
        aria-label={dict.filters.toDate}
        defaultValue={searchParams.get("dateTo")?.slice(0, 10) ?? ""}
        onChange={(event) =>
          updateParam(
            "dateTo",
            event.target.value
              ? new Date(`${event.target.value}T23:59:59.999Z`).toISOString()
              : "",
          )
        }
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
      />
    </div>
  );
}
