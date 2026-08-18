DROP POLICY IF EXISTS "course_files_update" ON storage.objects;
CREATE POLICY "course_files_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'course-files'
    AND (
      private.has_role(auth.uid(), 'admin'::public.app_role)
      OR private.is_course_teacher(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  )
  WITH CHECK (
    bucket_id = 'course-files'
    AND (
      private.has_role(auth.uid(), 'admin'::public.app_role)
      OR private.is_course_teacher(auth.uid(), ((storage.foldername(name))[1])::uuid)
    )
  );

DROP POLICY IF EXISTS "submissions_delete" ON storage.objects;
CREATE POLICY "submissions_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'submissions'
    AND (
      owner = auth.uid()
      OR private.has_role(auth.uid(), 'admin'::public.app_role)
      OR EXISTS (
        SELECT 1 FROM public.activity_submissions sub
        JOIN public.lessons l ON l.id = sub.lesson_id
        JOIN public.sections s ON s.id = l.section_id
        WHERE sub.file_url = storage.objects.name
          AND private.is_course_teacher(auth.uid(), s.course_id)
      )
    )
  );