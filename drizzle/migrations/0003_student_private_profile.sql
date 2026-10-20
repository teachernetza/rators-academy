CREATE TABLE public.student_profiles_private (
  student_id uuid PRIMARY KEY,
  phone text,
  goals_summary text,
  diagnosis text,
  cefr_level text CHECK (cefr_level IS NULL OR cefr_level IN ('A1','A2','B1','B2','C1','C2')),
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.student_profiles_private TO authenticated;
GRANT ALL ON public.student_profiles_private TO service_role;
ALTER TABLE public.student_profiles_private ENABLE ROW LEVEL SECURITY;
CREATE POLICY spp_select ON public.student_profiles_private FOR SELECT TO authenticated
  USING (private.can_manage_student(student_id));
CREATE POLICY spp_insert ON public.student_profiles_private FOR INSERT TO authenticated
  WITH CHECK (private.can_manage_student(student_id) AND updated_by = auth.uid());
CREATE POLICY spp_update ON public.student_profiles_private FOR UPDATE TO authenticated
  USING (private.can_manage_student(student_id))
  WITH CHECK (private.can_manage_student(student_id) AND updated_by = auth.uid());