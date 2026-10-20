CREATE TABLE public.class_lesson_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.class_lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  author_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL CHECK (length(btrim(body)) between 1 and 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX class_lesson_messages_lesson_idx ON public.class_lesson_messages(lesson_id, created_at);
GRANT SELECT, INSERT, DELETE ON public.class_lesson_messages TO authenticated;
GRANT ALL ON public.class_lesson_messages TO service_role;
ALTER TABLE public.class_lesson_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY clm_read ON public.class_lesson_messages FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR private.can_manage_student(student_id));
CREATE POLICY clm_insert ON public.class_lesson_messages FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.class_lessons l WHERE l.id = lesson_id AND l.student_id = class_lesson_messages.student_id)
    AND (student_id = auth.uid() OR private.can_manage_student(student_id))
  );
CREATE POLICY clm_delete ON public.class_lesson_messages FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR private.is_admin());