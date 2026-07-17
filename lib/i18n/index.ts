import en from "@/lib/i18n/en.json";
import fr from "@/lib/i18n/fr.json";
import type { AuditAction } from "@/lib/audit/types";
import type { SuspiciousAlert } from "@/lib/audit/suspicious-activity";

export type Locale = "en" | "fr";

export const dictionaries = { en, fr } satisfies Record<Locale, typeof en>;

export type Dictionary = typeof en;

export function getDictionary(locale: string | undefined): Dictionary {
  return locale === "fr" ? dictionaries.fr : dictionaries.en;
}

export function translateAction(action: AuditAction | (string & {}), dict: Dictionary): string {
  return dict.actions[action as keyof Dictionary["actions"]] ?? action;
}

export function formatSuspiciousAlert(alert: SuspiciousAlert, dict: Dictionary): string {
  const label = dict.suspicious.rules[alert.rule];
  return dict.suspicious.triggered
    .replace("{count}", String(alert.count))
    .replace("{label}", label)
    .replace("{minutes}", String(alert.windowMinutes));
}
