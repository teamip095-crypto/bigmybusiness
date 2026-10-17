# ADMIN-ENHANCE — Main orchestrator

## Goal
Enhance Big My Business admin panel + add supporting API routes. Brand red #D32121 / black #111 / white. Existing flows must NOT break.

## Scope
1. Filtered Excel exports (Plan + Chapter dropdowns) in Members tab — export route already supports `?plan=` and `?chapter=` filters.
2. Meeting / Google Meet management in Events tab: meetLink, meetingDate, recordingUrl, recordingTitle (extend POST/PUT events routes, dialog, per-event actions: copy meet link, share recording on WhatsApp, download recording).
3. Live visitor count widget: render existing `LiveCountWidget` at top of dashboard.
4. CMS — admin-editable site content: `/api/site-content` GET (public), `/api/admin/site-content` GET+PUT (auth), Content tab with structured editors for membership plans / FAQ / About. Public components (membership, faq, journey, events) read from CMS via `/api/site-content` or `/api/events` (DB-backed upcoming AdminEvents).

## Files
- `prisma/schema.prisma` already has AdminEvent meetLink/meetingDate/recordingUrl/recordingTitle + SiteContent model. (No schema change required.)
- `src/app/api/admin/events/route.ts` (POST) — extend to save new fields.
- `src/app/api/admin/events/[id]/route.ts` (PUT) — extend to save new fields.
- NEW `src/app/api/site-content/route.ts` (GET public).
- NEW `src/app/api/admin/site-content/route.ts` (GET + PUT, auth).
- NEW `src/app/api/events/route.ts` (GET public).
- `src/components/admin/admin-panel.tsx` — extend (add Chapter filter, Event dialog meet/recording fields, per-event actions, LiveCountWidget, Content tab).
- `src/components/site/membership.tsx` — fetch CMS plans.
- `src/components/site/faq.tsx` — fetch CMS FAQ.
- `src/components/site/journey.tsx` — fetch CMS About (optional heading + body paragraphs).
- `src/components/site/events.tsx` — fetch from `/api/events` (DB AdminEvents), fallback static.

## Notes
- Public components use a simple useEffect + state fetch; keep static fallback if fetch fails.
- All admin routes must enforce auth (getCurrentAdmin) except the public ones.
- shadcn/ui components, brand colors, framer-motion where appropriate.

## Work log
- Read worklog + admin-panel.tsx + site components + API routes + prisma schema + lib/admin-auth.ts.
- Dev server confirmed up on port 3000 (logs show GET / 200, /api/admin/login 200).
