"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

interface FilterBarProps {
  actions: string[];
  users: { id: string; email: string; persona_key: string }[];
}

export function FilterBar({ actions, users }: FilterBarProps) {
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
        <SelectTrigger className="w-45">
          <SelectValue placeholder="All actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All actions</SelectItem>
          {actions.map((action) => (
            <SelectItem key={action} value={action}>
              {action}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentUserId} onValueChange={(value) => updateParam("userId", value)}>
        <SelectTrigger className="w-50">
          <SelectValue placeholder="All users" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All users</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <input
        type="date"
        aria-label="From date"
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
        aria-label="To date"
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
