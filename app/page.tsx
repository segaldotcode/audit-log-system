import { getDistinctActions, getUsersForFilter, listAuditLogs } from "@/lib/audit/queries";
import { detectSuspiciousActivity } from "@/lib/audit/suspicious-activity";
import { getDictionary } from "@/lib/i18n";
import { ActionSimulator } from "@/components/audit/action-simulator";
import { FilterBar } from "@/components/audit/filter-bar";
import { SuspiciousBanner } from "@/components/audit/suspicious-banner";
import { Timeline } from "@/components/audit/timeline";
import { LanguageToggle } from "@/components/language-toggle";

interface HomeProps {
  searchParams: Promise<{
    action?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    cursorCreatedAt?: string;
    cursorId?: string;
    lang?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const locale = params.lang === "fr" ? "fr" : "en";
  const dict = getDictionary(locale);

  const filters = {
    action: params.action || undefined,
    userId: params.userId || undefined,
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
  };

  const cursor =
    params.cursorCreatedAt && params.cursorId
      ? { createdAt: params.cursorCreatedAt, id: params.cursorId }
      : null;

  const [{ logs, nextCursor }, actions, users, alerts] = await Promise.all([
    listAuditLogs(filters, cursor),
    getDistinctActions(),
    getUsersForFilter(),
    detectSuspiciousActivity(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-10 sm:px-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{dict.title}</h1>
          <p className="text-sm text-muted-foreground">{dict.subtitle}</p>
        </div>
        <LanguageToggle locale={locale} />
      </header>

      <SuspiciousBanner alerts={alerts} dict={dict} />

      <ActionSimulator users={users} dict={dict} />

      <FilterBar actions={actions} users={users} dict={dict} />

      <Timeline logs={logs} nextCursor={nextCursor} filters={filters} dict={dict} locale={locale} />
    </main>
  );
}
