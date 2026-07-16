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

Coming soon.

## Architecture

Coming soon.
