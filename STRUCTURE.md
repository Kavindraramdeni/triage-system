# Project structure

```
src/
├── app/                                  # Next.js 15 App Router
│   ├── layout.tsx                        # Root layout — fonts, providers
│   ├── page.tsx                          # Landing → redirects to /intake
│   │
│   ├── (public)/                         # No auth required
│   │   ├── intake/
│   │   │   ├── page.tsx                  # Step 1: demographics
│   │   │   ├── symptoms/page.tsx         # Step 2: symptom checker
│   │   │   └── confirmation/page.tsx     # Step 3: token + queue position
│   │   └── status/
│   │       └── [token]/page.tsx          # Patient checks own status
│   │
│   ├── (clinician)/                      # JWT protected — middleware enforces
│   │   ├── layout.tsx                    # Clinician shell — sidebar, user info
│   │   ├── dashboard/page.tsx            # Live triage queue
│   │   ├── queue/page.tsx                # Full queue management
│   │   ├── patient/[visitId]/page.tsx    # Patient detail + AI assessment
│   │   └── analytics/page.tsx            # Volume, wait times, ESI distribution
│   │
│   ├── (auth)/
│   │   └── login/page.tsx                # Clinician login
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts            # POST — issue JWT
│       │   └── logout/route.ts           # POST — clear cookie
│       ├── intake/
│       │   └── route.ts                  # POST — create patient + visit
│       ├── triage/
│       │   └── route.ts                  # POST — run AI analysis
│       ├── visits/
│       │   ├── route.ts                  # GET — queue list (clinician)
│       │   └── [visitId]/
│       │       ├── route.ts              # GET/PATCH — visit detail + update
│       │       └── override/route.ts     # POST — ESI override
│       ├── status/
│       │   └── [token]/route.ts          # GET — patient status (public)
│       └── sse/
│           └── queue/route.ts            # GET — SSE stream for live queue
│
├── components/
│   ├── ui/                               # Primitives — Button, Input, Badge, Card
│   ├── intake/
│   │   ├── DemographicsForm.tsx
│   │   ├── SymptomChecker.tsx            # Multi-select + free text
│   │   ├── VitalsEntry.tsx               # Optional vitals
│   │   └── IntakeProgress.tsx            # Step indicator
│   ├── triage/
│   │   ├── AiAssessmentCard.tsx          # AI output display
│   │   ├── EsiBadge.tsx                  # Color-coded ESI 1–5
│   │   ├── UrgencyFlags.tsx              # Red flag indicators
│   │   └── OverrideModal.tsx             # Clinician override form
│   ├── dashboard/
│   │   ├── QueueTable.tsx                # Live sorted queue
│   │   ├── QueueRow.tsx
│   │   ├── AnalyticsCharts.tsx
│   │   └── StatsCards.tsx
│   └── shared/
│       ├── ErrorBoundary.tsx
│       └── LoadingSpinner.tsx
│
├── services/                             # Business logic — no HTTP here
│   ├── triage.service.ts                 # Orchestrates AI + DB writes
│   ├── patient.service.ts                # Patient/visit CRUD
│   ├── clinician.service.ts              # Queue management
│   ├── analytics.service.ts
│   └── audit.service.ts
│
├── lib/
│   ├── ai/
│   │   ├── gemini.client.ts              # Gemini SDK wrapper
│   │   ├── triage.prompt.ts              # System + user prompt builders
│   │   ├── response.parser.ts            # Parse + validate AI JSON output
│   │   └── fallback.classifier.ts        # Rule-based fallback if AI fails
│   ├── db/
│   │   └── prisma.ts                     # Singleton Prisma client
│   ├── auth/
│   │   ├── jwt.ts                        # Sign / verify tokens
│   │   └── password.ts                   # bcrypt helpers
│   ├── validation/
│   │   ├── intake.schema.ts              # Zod schemas
│   │   ├── triage.schema.ts
│   │   └── clinician.schema.ts
│   └── sse/
│       └── queue.emitter.ts              # EventEmitter for SSE broadcast
│
├── hooks/
│   ├── useQueueSSE.ts                    # Consume SSE stream
│   └── useTriageForm.ts                  # Multi-step form state
│
├── types/
│   └── index.ts                          # Shared TS types / Prisma re-exports
│
└── middleware.ts                         # JWT check on (clinician) routes
```
