# Audit Log System

## Why this exists

Every serious production application has an audit log, yet it is one of the most requested features in real companies and one of the least well implemented in open source projects. This project is not another basic activity feed. It focuses on middleware-level logging, server-side pagination that scales, and suspicious activity detection.

The core idea: every sensitive action in the system should be traceable, searchable, and explainable after the fact.

## Features

- Centralized `logEvent()` function to record actions with actor, metadata, IP and user agent
- Automatic logging middleware applied across server actions and routes
- Timeline UI grouped by date, Notion/Linear style
- Server-side pagination built in from the start
- Filtering by action, user and date range
- Action replay: inspect the exact input, result and duration behind a logged event
- Suspicious activity detection (repeated login attempts, unusual payment volume) with a visual alert in the dashboard

## Tech stack

- Next.js (App Router)
- Supabase (`audit_logs` table)
- Tailwind CSS + Shadcn UI
- pnpm

## Screenshots / Demo GIF

Coming soon.

## How to reuse

1. Clone the repo and install dependencies: `pnpm install`
2. Add your Supabase credentials to `.env.local` (see `.env.example`)
3. Run `supabase/schema.sql` against your database to create the `audit_logs` table (it references the shared `users` table from `feature-flags-dashboard/supabase/schema.sql`)
4. Optionally run `supabase/seed.sql` to populate a few days of demo activity, including two suspicious bursts for the detector to catch
5. Run `pnpm dev`, then use the action simulator at the top of the dashboard to generate more events for any persona

## Architecture

- `lib/audit/log-event.ts` is the single entry point every module should call to write to `audit_logs`; it sanitizes metadata (`lib/audit/sanitize-metadata.ts`) so sensitive keys like `password` or `token` never reach the table
- `lib/audit/with-audit-log.ts` wraps a business action so its input, result (or error) and duration are captured and logged automatically, this is the "logging middleware" applied to actions instead of raw HTTP requests
- `lib/audit/queries.ts` reads the timeline with keyset pagination on `(created_at, id)`, which stays fast at any page depth unlike `OFFSET`
- `lib/audit/suspicious-activity.ts` slides a fixed time window over each user's recent events to flag rapid login attempts or payment bursts
- `app/actions.ts` exposes a `simulateAuditEvent` server action used by the dashboard's action simulator to exercise the whole pipeline without depending on the other ecosystem modules
- `app/page.tsx` composes the filter bar, suspicious activity banner, action simulator and timeline, all server-rendered from the same Supabase read
