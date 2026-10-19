CREATE OR REPLACE FUNCTION private.staff_create_user(p_full_name text, p_email text, p_role app_role)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_caller uuid := auth.uid();
  v_uid    uuid := gen_random_uuid();
  v_pw     text;
  v_email  text;
BEGIN
  IF v_caller IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesion'; END IF;
  IF NOT (public.has_role(v_caller, 'admin') OR (p_role = 'student' AND public.has_role(v_caller, 'teacher'))) THEN
    RAISE EXCEPTION 'No tienes permisos para crear esa cuenta';
  END IF;
  v_email := lower(btrim(coalesce(p_email, '')));
  IF v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN RAISE EXCEPTION 'El correo no es valido'; END IF;
  IF btrim(coalesce(p_full_name, '')) = '' THEN RAISE EXCEPTION 'El nombre es obligatorio'; END IF;
  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = v_email)
     OR EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = v_email) THEN
    RAISE EXCEPTION 'Ese correo ya tiene una cuenta';
  END IF;
  v_pw := translate(encode(gen_random_bytes(9), 'base64'), '+/=', '-_x');

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES (
    v_uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v_email,
    extensions.crypt(v_pw, extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', btrim(p_full_name), 'role', p_role::text),
    now(), now(), false, false, '', '', '', ''
  );

  INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
  VALUES (
    gen_random_uuid(), v_uid, v_uid::text, 'email',
    jsonb_build_object('sub', v_uid::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
    now(), now(), now()
  );

  INSERT INTO public.profiles (id, full_name, role, email, status, is_active)
  VALUES (v_uid, btrim(p_full_name), p_role, v_email, 'active', true)
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, email = EXCLUDED.email;

  RETURN jsonb_build_object('id', v_uid, 'email', v_email, 'role', p_role::text, 'password', v_pw);
END;
$function$;