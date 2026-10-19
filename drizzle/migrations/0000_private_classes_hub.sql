-- Teacher <-> student assignments (1 a 1)
CREATE TABLE public.student_teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, teacher_id)
);

-- teacher_has_student now also counts direct assignments
CREATE OR REPLACE FUNCTION private.teacher_has_student(_teacher_id uuid, _student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.student_teachers st WHERE st.student_id = _student_id AND st.teacher_id = _teacher_id)
      OR EXISTS (SELECT 1 FROM public.enrollments e JOIN public.courses c ON c.id = e.course_id
                 WHERE e.student_id = _student_id AND c.teacher_id = _teacher_id)
$$;

CREATE OR REPLACE FUNCTION private.can_manage_student(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.has_role(auth.uid(), 'admin')
      OR (private.has_role(auth.uid(), 'teacher') AND private.teacher_has_student(auth.uid(), _student_id))
$$;
GRANT EXECUTE ON FUNCTION private.can_manage_student(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.has_role(auth.uid(), 'admin')
$$;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_teachers TO authenticated;
GRANT ALL ON public.student_teachers TO service_role;
ALTER TABLE public.student_teachers ENABLE ROW LEVEL SECURITY;
CREATE POLICY st_admin_all ON public.student_teachers FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY st_read_own ON public.student_teachers FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() OR student_id = auth.uid());

-- Monthly plans
CREATE TABLE public.student_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  plan_key text NOT NULL CHECK (plan_key IN ('essential','progress','intensive')),
  month date NOT NULL,
  hours_contracted numeric(5,1) NOT NULL,
  lessons_total integer NOT NULL,
  carried_hours numeric(5,1) NOT NULL DEFAULT 0,
  carry_note text,
  slides_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.student_plans (student_id, month DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_plans TO authenticated;
GRANT ALL ON public.student_plans TO service_role;
ALTER TABLE public.student_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY sp_admin_all ON public.student_plans FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY sp_read ON public.student_plans FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR private.can_manage_student(student_id));

-- Uploaded HTML lab library
CREATE TABLE public.lab_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  level text NOT NULL DEFAULT 'a1',
  block text,
  kind text NOT NULL DEFAULT 'homework' CHECK (kind IN ('class','homework')),
  storage_path text NOT NULL,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_files TO authenticated;
GRANT ALL ON public.lab_files TO service_role;
ALTER TABLE public.lab_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY lf_admin_all ON public.lab_files FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY lf_teacher_read ON public.lab_files FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'teacher'));

-- Lessons (student-visible part)
CREATE TABLE public.class_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.student_plans(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  order_index integer NOT NULL DEFAULT 1,
  title text NOT NULL,
  slides_url text,
  homework_lab_file_id uuid REFERENCES public.lab_files(id) ON DELETE SET NULL,
  homework_lab_ref text,
  homework_active boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done')),
  notes text,
  material_url text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.class_lessons (plan_id, order_index);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_lessons TO authenticated;
GRANT ALL ON public.class_lessons TO service_role;
ALTER TABLE public.class_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY cl_admin_all ON public.class_lessons FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY cl_teacher_read ON public.class_lessons FOR SELECT TO authenticated
  USING (private.can_manage_student(student_id));
CREATE POLICY cl_teacher_update ON public.class_lessons FOR UPDATE TO authenticated
  USING (private.can_manage_student(student_id)) WITH CHECK (private.can_manage_student(student_id));
CREATE POLICY cl_student_read ON public.class_lessons FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Teachers may only toggle homework / status / notes / material
CREATE OR REPLACE FUNCTION public.guard_class_lesson_update()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF private.is_admin() THEN RETURN NEW; END IF;
  IF NEW.plan_id IS DISTINCT FROM OLD.plan_id OR NEW.student_id IS DISTINCT FROM OLD.student_id
     OR NEW.order_index IS DISTINCT FROM OLD.order_index OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.slides_url IS DISTINCT FROM OLD.slides_url
     OR NEW.homework_lab_file_id IS DISTINCT FROM OLD.homework_lab_file_id
     OR NEW.homework_lab_ref IS DISTINCT FROM OLD.homework_lab_ref THEN
    RAISE EXCEPTION 'Solo el admin puede cambiar los labs o datos de la lección';
  END IF;
  IF NEW.status = 'done' AND OLD.status <> 'done' THEN NEW.completed_at := now(); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_class_lesson BEFORE UPDATE ON public.class_lessons
  FOR EACH ROW EXECUTE FUNCTION public.guard_class_lesson_update();
CREATE TRIGGER trg_class_lessons_updated BEFORE UPDATE ON public.class_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_student_plans_updated BEFORE UPDATE ON public.student_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Class lab (staff only, hidden from students)
CREATE TABLE public.class_lesson_labs (
  lesson_id uuid PRIMARY KEY REFERENCES public.class_lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  lab_file_id uuid REFERENCES public.lab_files(id) ON DELETE SET NULL,
  lab_ref text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_lesson_labs TO authenticated;
GRANT ALL ON public.class_lesson_labs TO service_role;
ALTER TABLE public.class_lesson_labs ENABLE ROW LEVEL SECURITY;
CREATE POLICY cll_admin_all ON public.class_lesson_labs FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY cll_teacher_read ON public.class_lesson_labs FOR SELECT TO authenticated
  USING (private.can_manage_student(student_id));

-- Students can read lab files only when it is an active homework of theirs
CREATE POLICY lf_student_read ON public.lab_files FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.class_lessons l WHERE l.homework_lab_file_id = lab_files.id
                 AND l.student_id = auth.uid() AND l.homework_active));

-- Class sessions / hours log
CREATE TABLE public.class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.student_plans(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  teacher_id uuid NOT NULL,
  lesson_id uuid REFERENCES public.class_lessons(id) ON DELETE SET NULL,
  session_date date NOT NULL DEFAULT current_date,
  hours numeric(4,1) NOT NULL CHECK (hours > 0 AND hours <= 8),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.class_sessions (plan_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_sessions TO authenticated;
GRANT ALL ON public.class_sessions TO service_role;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY cs_admin_all ON public.class_sessions FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY cs_teacher_read ON public.class_sessions FOR SELECT TO authenticated
  USING (private.can_manage_student(student_id));
CREATE POLICY cs_teacher_insert ON public.class_sessions FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() AND private.can_manage_student(student_id));
CREATE POLICY cs_teacher_modify ON public.class_sessions FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() AND private.can_manage_student(student_id))
  WITH CHECK (teacher_id = auth.uid() AND private.can_manage_student(student_id));
CREATE POLICY cs_teacher_delete ON public.class_sessions FOR DELETE TO authenticated
  USING (teacher_id = auth.uid() AND private.can_manage_student(student_id));
CREATE POLICY cs_student_read ON public.class_sessions FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Homework screenshots
CREATE TABLE public.homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.class_lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  screenshot_path text NOT NULL,
  student_note text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed','done')),
  feedback text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.homework_submissions (lesson_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homework_submissions TO authenticated;
GRANT ALL ON public.homework_submissions TO service_role;
ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY hs_admin_all ON public.homework_submissions FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());
CREATE POLICY hs_staff_read ON public.homework_submissions FOR SELECT TO authenticated
  USING (private.can_manage_student(student_id));
CREATE POLICY hs_staff_review ON public.homework_submissions FOR UPDATE TO authenticated
  USING (private.can_manage_student(student_id)) WITH CHECK (private.can_manage_student(student_id));
CREATE POLICY hs_student_read ON public.homework_submissions FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY hs_student_insert ON public.homework_submissions FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND status = 'submitted' AND feedback IS NULL AND reviewed_by IS NULL
    AND EXISTS (SELECT 1 FROM public.class_lessons l WHERE l.id = lesson_id AND l.student_id = auth.uid() AND l.homework_active));
CREATE POLICY hs_student_delete ON public.homework_submissions FOR DELETE TO authenticated
  USING (student_id = auth.uid() AND status = 'submitted');

CREATE OR REPLACE FUNCTION public.guard_homework_review()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.lesson_id IS DISTINCT FROM OLD.lesson_id OR NEW.student_id IS DISTINCT FROM OLD.student_id
     OR NEW.screenshot_path IS DISTINCT FROM OLD.screenshot_path THEN
    RAISE EXCEPTION 'No puedes cambiar la entrega';
  END IF;
  NEW.reviewed_by := auth.uid();
  NEW.reviewed_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER trg_guard_homework BEFORE UPDATE ON public.homework_submissions
  FOR EACH ROW EXECUTE FUNCTION public.guard_homework_review();

-- Storage policies (buckets lab-html / homework-shots created separately)
CREATE POLICY "lab_html_admin_all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'lab-html' AND private.is_admin())
  WITH CHECK (bucket_id = 'lab-html' AND private.is_admin());
CREATE POLICY "lab_html_teacher_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lab-html' AND private.has_role(auth.uid(), 'teacher'));
CREATE POLICY "lab_html_student_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'lab-html' AND EXISTS (
    SELECT 1 FROM public.lab_files f JOIN public.class_lessons l ON l.homework_lab_file_id = f.id
    WHERE f.storage_path = storage.objects.name AND l.student_id = auth.uid() AND l.homework_active));

CREATE POLICY "hw_shots_student_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'homework-shots' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "hw_shots_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'homework-shots' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR private.can_manage_student(((storage.foldername(name))[1])::uuid)));
CREATE POLICY "hw_shots_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'homework-shots' AND ((storage.foldername(name))[1] = auth.uid()::text OR private.is_admin()));