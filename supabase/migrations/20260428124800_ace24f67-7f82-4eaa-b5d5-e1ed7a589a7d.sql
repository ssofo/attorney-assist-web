CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role public.app_role;
BEGIN
  requested_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'cliente'::public.app_role);

  INSERT INTO public.profiles (id, email, full_name, phone, cedula)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cedula'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = CASE
        WHEN public.profiles.full_name = '' THEN EXCLUDED.full_name
        ELSE public.profiles.full_name
      END,
      phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
      cedula = COALESCE(public.profiles.cedula, EXCLUDED.cedula),
      updated_at = now();

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, requested_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();