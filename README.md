# Clinical Triage System

A production-grade patient intake and AI-powered triage system built with Next.js 15, TypeScript, PostgreSQL (Supabase), and Google Gemini.

## Stack

- **Framework**: Next.js 15 App Router with TypeScript
- **Database**: PostgreSQL via Supabase + Prisma ORM
- **AI**: Google Gemini 1.5 Pro (structured JSON output)
- **Auth**: JWT via `jose` + bcrypt password hashing
- **Realtime**: Server-Sent Events for live queue updates
- **Styling**: Tailwind CSS

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY

# 3. Push schema to Supabase
npm run db:push

# 4. Seed initial clinician account
npm run db:seed

# 5. Start dev server
npm run dev
```

## Architecture

Three layers with strict separation:

**Patient layer (public)**
- `/intake` — demographics form → symptom checker → confirmation with queue token
- `/status/[token]` — patient checks their own queue position

**Triage engine (API routes + AI)**
- `POST /api/intake` — creates patient + visit record
- `POST /api/triage` — runs Gemini analysis, classifies ESI 1–5, persists assessment
- Fallback rule-based classifier activates automatically if Gemini is unavailable

**Clinician layer (JWT protected)**
- `/dashboard` — live queue ordered by ESI level + arrival time
- `/patient/[visitId]` — full AI assessment, override controls, audit trail
- `/analytics` — volume, wait times, ESI distribution

## ESI levels

| Level | Name | Description |
|-------|------|-------------|
| ESI 1 | Resuscitation | Immediate life-saving intervention needed |
| ESI 2 | Emergent | High risk, severe pain/distress |
| ESI 3 | Urgent | Stable, needs 2+ resources |
| ESI 4 | Less urgent | Needs 1 resource |
| ESI 5 | Non-urgent | No resources needed |

## Deployment (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy — Prisma generates automatically during build

## Security decisions

- JWT stored in httpOnly cookie (not localStorage)
- Zod validation on every API route input
- Role-based middleware on all clinician routes
- Audit log on every clinician action (ESI overrides, status changes)
- Patient status endpoint returns minimal data — no clinical notes exposed
- AI fallback prevents queue stall if Gemini is unavailable
