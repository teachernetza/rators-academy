# Project rules

- Private classes (plans, lessons, hours, uploaded HTML labs, homework screenshots) are read/written from the browser client in `src/lib/classes.ts`; permissions live only in RLS policies + guard triggers (teachers can toggle homework/status/notes, only admins change plans/labs). Why: one source of truth for who-can-do-what.
- The staff-only "class lab" lives in `class_lesson_labs`, separate from `class_lessons`, because RLS cannot hide columns from students.
- Uploaded lab HTML is rendered via iframe `srcdoc` with sandbox (no allow-same-origin). Why: untrusted HTML must not reach the app session.
- Plan/hour rules live in `src/lib/plans.ts` with tests in `src/lib/plans.test.ts`.
