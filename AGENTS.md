# Project rules

- Private classes (plans, lessons, hours, uploaded HTML labs, homework screenshots) are read/written from the browser client in `src/lib/classes.ts`; permissions live only in RLS policies + guard triggers (teachers can toggle homework/status/notes, only admins change plans/labs). Why: one source of truth for who-can-do-what.
- The staff-only "class lab" lives in `class_lesson_labs`, separate from `class_lessons`, because RLS cannot hide columns from students.
- Uploaded lab HTML is rendered via iframe `srcdoc` with sandbox (no allow-same-origin). Why: untrusted HTML must not reach the app session.
- Plan/hour rules live in `src/lib/plans.ts` with tests in `src/lib/plans.test.ts`.
- Teacher↔student lesson messages live in `class_lesson_messages` (not `lesson_comments`, which belongs to the legacy courses). Nav is class-centric; legacy pages stay routable but unlisted. Why: one simple flow around the next lesson.
- Uploaded labs open in their own full-tab route `/lab/$labFileId` (optional `?lesson=` lets the student upload evidence from the lab bar). Why: labs need the whole screen; the sandboxed srcdoc rule still applies.
- Homework state comes only from submissions (`homeworkState`, tested in `src/lib/homework-state.test.ts`); marking a lesson done never closes its homework. Why: students must still be able to send evidence after class.
- Extra labs per class (one or more, class/homework) live in `class_lesson_lab_items`; admins and assigned teachers add them, students see homework items only once the lesson's homework is active. The original single lab fields stay as the main lab. Why: additive change, no data migration risk.
