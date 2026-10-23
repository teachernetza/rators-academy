# Several labs per class

## What changes

- Each class can have **one or more Class Labs** (staff only) and **one or more Homework Labs** (the student sees them).
- In the student's file, every class gets an **"Assign lab"** button for admins and teachers. It opens a list of the labs already uploaded to the app, filtered by level, with a search box. You can tick several at once and choose Class or Homework.
- Assigned labs show up as small cards inside the class, each with "Open" (full tab) and "Remove".
- The student sees all of their homework labs on the class card and sends evidence for each one from the lab bar.
- Teachers can now assign labs too, but only to their own students. Today only the admin can.
- The labs already attached to classes carry over automatically.

## Technical details

- New table `class_lesson_lab_items` (lesson_id, student_id, lab_file_id, kind 'class'|'homework', position, added_by), with GRANT + RLS:
  - staff (`can_manage_student`) can read, add and delete;
  - students can read only `kind='homework'` rows that belong to them.
- Copy the existing rows from `class_lesson_labs` and `class_lessons.homework_lab_file_id` into it; mark the old columns as DEPRECATED (no deletions).
- `lab_files` stays readable by students only when the lab is assigned to them as homework (update the policy).
- `src/lib/classes.ts`: `listLessonLabs`, `addLessonLabs`, `removeLessonLab`. New picker component `assign-lesson-labs-dialog.tsx`, used in `staff-student-hub.tsx` and in `student-hub.tsx` (read only).
- Evidence: `homework_submissions` keeps working per lesson; the lab bar sends `?lesson=`.
- Test the permission rule (teacher assigns only to their students) and verify with Playwright: assign 2 labs, see both as the student.