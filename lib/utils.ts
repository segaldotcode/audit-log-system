import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Locale } from "@/lib/i18n"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const INTL_LOCALE: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
}

export function formatEventTime(iso: string, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso))
}

export function formatDateHeading(dateKey: string, locale: Locale = "en"): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${dateKey}T00:00:00`))
}

export function formatDateTime(iso: string, locale: Locale = "en"): string {
  return new Date(iso).toLocaleString(INTL_LOCALE[locale])
}

export function randomAmount(min = 10, max = 500): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}
