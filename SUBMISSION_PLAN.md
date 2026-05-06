# Assignment Submission Plan

## Current Readiness (as of May 6, 2026)

You are close, but not fully aligned with the assignment requirements yet.

### Blockers before submission

1. **Version mismatch with mandatory stack**
   - Assignment requires **Next.js 16**.
   - Project currently uses **Next.js 15**.

2. **AI reliability issue observed (frequent fallback mode)**
   - The triage pipeline has fallback logic, but AI responses can fail strict parsing.
   - This has been improved by making JSON parsing resilient to markdown wrappers and extra text.

3. **Missing environment template**
   - README references `.env.example`, but it was missing.
   - Added for setup clarity and evaluator reproducibility.

---

## Recommended Change Plan

### Phase 1 — Compliance fixes (must do first)

- [ ] Upgrade dependencies to Next.js 16 and compatible `eslint-config-next`.
- [ ] Run full regression checks: app routes, API routes, middleware auth flow.
- [ ] Update README stack section from Next.js 15 -> Next.js 16.

### Phase 2 — AI stability + observability

- [x] Harden AI response parsing so JSON wrapped in code fences still parses.
- [ ] Add structured logging for AI failures (reason categories: auth/rate-limit/format/schema).
- [ ] Show AI status in clinician UI ("AI" vs "fallback") so evaluators can see graceful degradation.

### Phase 3 — Assignment scoring improvements

- [ ] Add tests:
  - API integration tests for intake + triage + status.
  - Basic auth route tests.
  - One triage parsing unit test.
- [ ] Add CI workflow (lint, typecheck, build, tests).
- [ ] Add README section: security risks + mitigations + production contingencies.
- [ ] Verify footer has **Name, GitHub, LinkedIn** exactly as requested.

### Phase 4 — Submission packaging

- [ ] Ensure seeded demo credentials and reproducible local setup.
- [ ] Record short demo GIF/video walkthrough (optional, high impact).
- [ ] Provide GitHub repo link + live deployment URL.

---

## Should you submit right now?

**Recommendation: not yet.**

Submit after:
1. Next.js 16 upgrade is complete,
2. AI behavior is validated (not always falling back),
3. CI + tests are in place,
4. Footer identity requirements are verified.
