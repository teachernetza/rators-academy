CREATE TABLE public.class_lesson_lab_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.class_lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  lab_file_id uuid NOT NULL REFERENCES public.lab_files(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'homework' CHECK (kind IN ('class','homework')),
  position integer NOT NULL DEFAULT 0,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lesson_id, lab_file_id, kind)
);
CREATE INDEX class_lesson_lab_items_student_idx ON public.class_lesson_lab_items(student_id);
GRANT SELECT, INSERT, DELETE ON public.class_lesson_lab_items TO authenticated;
GRANT ALL ON public.class_lesson_lab_items TO service_role;
ALTER TABLE public.class_lesson_lab_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY clli_staff_read ON public.class_lesson_lab_items FOR SELECT TO authenticated
  USING (private.can_manage_student(student_id));
CREATE POLICY clli_student_read ON public.class_lesson_lab_items FOR SELECT TO authenticated
  USING (kind = 'homework' AND student_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.class_lessons l WHERE l.id = lesson_id AND l.student_id = auth.uid() AND l.homework_active));
CREATE POLICY clli_staff_insert ON public.class_lesson_lab_items FOR INSERT TO authenticated
  WITH CHECK (private.can_manage_student(student_id) AND added_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.class_lessons l WHERE l.id = lesson_id AND l.student_id = class_lesson_lab_items.student_id));
CREATE POLICY clli_staff_delete ON public.class_lesson_lab_items FOR DELETE TO authenticated
  USING (private.can_manage_student(student_id));

CREATE POLICY lf_student_read_items ON public.lab_files FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.class_lesson_lab_items i JOIN public.class_lessons l ON l.id = i.lesson_id
    WHERE i.lab_file_id = lab_files.id AND i.kind = 'homework' AND i.student_id = auth.uid() AND l.homework_active));

CREATE POLICY "lab_html_student_read_items" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lab-html' AND EXISTS (
    SELECT 1 FROM public.lab_files f
    JOIN public.class_lesson_lab_items i ON i.lab_file_id = f.id
    JOIN public.class_lessons l ON l.id = i.lesson_id
    WHERE f.storage_path = storage.objects.name AND i.kind = 'homework' AND i.student_id = auth.uid() AND l.homework_active));