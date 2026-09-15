
ALTER TABLE public.lab_assignments
  ADD COLUMN IF NOT EXISTS best_score integer,
  ADD COLUMN IF NOT EXISTS last_score integer,
  ADD COLUMN IF NOT EXISTS max_score integer,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz;

ALTER TABLE public.lab_assignments DROP CONSTRAINT IF EXISTS lab_assignments_status_check;
ALTER TABLE public.lab_assignments
  ADD CONSTRAINT lab_assignments_status_check
  CHECK (status IN ('pending','in_progress','completed'));

CREATE TABLE IF NOT EXISTS public.lab_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.lab_assignments(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lab_level text NOT NULL,
  lab_slug text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 0,
  section_breakdown jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.lab_attempts TO authenticated;
GRANT ALL ON public.lab_attempts TO service_role;

ALTER TABLE public.lab_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students insert own lab attempts" ON public.lab_attempts;
CREATE POLICY "students insert own lab attempts" ON public.lab_attempts
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "read own lab attempts" ON public.lab_attempts;
CREATE POLICY "read own lab attempts" ON public.lab_attempts
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "staff read lab attempts" ON public.lab_attempts;
CREATE POLICY "staff read lab attempts" ON public.lab_attempts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

CREATE INDEX IF NOT EXISTS lab_attempts_student_idx ON public.lab_attempts(student_id);
CREATE INDEX IF NOT EXISTS lab_attempts_assignment_idx ON public.lab_attempts(assignment_id);
