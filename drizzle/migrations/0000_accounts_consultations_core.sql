
-- ===== Enums =====
CREATE TYPE public.app_role AS ENUM ('user','corporate_user','admin','super_admin');
CREATE TYPE public.consultation_status AS ENUM ('NEW','IN_REVIEW','IN_PROGRESS','WAITING_CLIENT','RESOLVED','CLOSED','SPAM');
CREATE TYPE public.account_status AS ENUM ('active','suspended','blocked');

-- ===== Shared updated_at trigger =====
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ===== user_roles =====
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
-- No INSERT/UPDATE/DELETE policies: role changes only via audited server code.

-- ===== profiles =====
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text CHECK (char_length(first_name) <= 80),
  last_name text CHECK (char_length(last_name) <= 80),
  phone text CHECK (char_length(phone) <= 30),
  company text CHECK (char_length(company) <= 120),
  country text CHECK (char_length(country) <= 60),
  account_status public.account_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile or staff" ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND account_status = 'active');
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Prevent users from changing their own account_status
CREATE OR REPLACE FUNCTION public.protect_profile_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.account_status IS DISTINCT FROM OLD.account_status
     AND current_setting('role', true) = 'authenticated' THEN
    RAISE EXCEPTION 'account_status cannot be modified by the user';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'user_id is immutable';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER profiles_protect BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_status();

-- ===== consultations =====
CREATE TABLE public.consultation_counters (year int PRIMARY KEY, last_value int NOT NULL DEFAULT 0);
GRANT ALL ON public.consultation_counters TO service_role;
ALTER TABLE public.consultation_counters ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  public_id text NOT NULL UNIQUE,
  user_id uuid,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  last_name text NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 80),
  company text CHECK (char_length(company) <= 120),
  email text NOT NULL CHECK (char_length(email) <= 255),
  phone text CHECK (char_length(phone) <= 30),
  country text CHECK (char_length(country) <= 60),
  area text NOT NULL CHECK (char_length(area) <= 60),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 3 AND 150),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 3000),
  status public.consultation_status NOT NULL DEFAULT 'NEW',
  notification_status text NOT NULL DEFAULT 'pending',
  anonymized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX consultations_user_idx ON public.consultations(user_id);
CREATE INDEX consultations_status_idx ON public.consultations(status, created_at DESC);
GRANT SELECT, UPDATE ON public.consultations TO authenticated;
GRANT ALL ON public.consultations TO service_role;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner or staff read consultations" ON public.consultations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Staff update consultations" ON public.consultations FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
-- Inserts happen only through the validated, rate-limited server endpoint (service role).

CREATE OR REPLACE FUNCTION public.assign_consultation_public_id()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE y int := extract(year FROM now())::int; n int;
BEGIN
  INSERT INTO public.consultation_counters(year, last_value) VALUES (y, 1)
  ON CONFLICT (year) DO UPDATE SET last_value = public.consultation_counters.last_value + 1
  RETURNING last_value INTO n;
  NEW.public_id := 'NC-' || y || '-' || lpad(n::text, 6, '0');
  RETURN NEW;
END; $$;
CREATE TRIGGER consultations_public_id BEFORE INSERT ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.assign_consultation_public_id();
CREATE TRIGGER consultations_updated BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Staff may only change status via the API; lock other columns for authenticated role
CREATE OR REPLACE FUNCTION public.restrict_consultation_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF current_setting('role', true) = 'authenticated' AND (
     NEW.public_id IS DISTINCT FROM OLD.public_id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR
     NEW.name IS DISTINCT FROM OLD.name OR NEW.last_name IS DISTINCT FROM OLD.last_name OR
     NEW.email IS DISTINCT FROM OLD.email OR NEW.message IS DISTINCT FROM OLD.message OR
     NEW.subject IS DISTINCT FROM OLD.subject OR NEW.area IS DISTINCT FROM OLD.area OR
     NEW.created_at IS DISTINCT FROM OLD.created_at) THEN
    RAISE EXCEPTION 'Only status can be modified';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER consultations_restrict BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.restrict_consultation_update();

-- ===== consultation_events (append-only audit) =====
CREATE TABLE public.consultation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  actor_user_id uuid,
  event_type text NOT NULL,
  old_value text,
  new_value text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX consultation_events_c_idx ON public.consultation_events(consultation_id, created_at);
GRANT SELECT ON public.consultation_events TO authenticated;
GRANT ALL ON public.consultation_events TO service_role;
ALTER TABLE public.consultation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read consultation events" ON public.consultation_events FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.log_consultation_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.consultation_events(consultation_id, actor_user_id, event_type, new_value)
    VALUES (NEW.id, NEW.user_id, 'created', NEW.status::text);
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.consultation_events(consultation_id, actor_user_id, event_type, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status_changed', OLD.status::text, NEW.status::text);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER consultations_audit AFTER INSERT OR UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.log_consultation_change();

-- ===== internal notes (never shown to clients) =====
CREATE TABLE public.consultation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
  author_user_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 3000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.consultation_notes TO authenticated;
GRANT ALL ON public.consultation_notes TO service_role;
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read notes" ON public.consultation_notes FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff add notes" ON public.consultation_notes FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND author_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.log_note_added()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.consultation_events(consultation_id, actor_user_id, event_type, new_value)
  VALUES (NEW.consultation_id, NEW.author_user_id, 'note_added', NULL);
  RETURN NEW;
END; $$;
CREATE TRIGGER notes_audit AFTER INSERT ON public.consultation_notes FOR EACH ROW EXECUTE FUNCTION public.log_note_added();

-- ===== security_events (append-only) =====
CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  actor_user_id uuid,
  event_type text NOT NULL,
  detail text CHECK (char_length(detail) <= 300),
  ip_hash text,
  user_agent_summary text CHECK (char_length(user_agent_summary) <= 80),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX security_events_user_idx ON public.security_events(user_id, created_at DESC);
CREATE INDEX security_events_created_idx ON public.security_events(created_at DESC);
GRANT SELECT ON public.security_events TO authenticated;
GRANT ALL ON public.security_events TO service_role;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own events or staff" ON public.security_events FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

-- ===== rate limiting (server-only) =====
CREATE TABLE public.rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count int NOT NULL DEFAULT 0
);
GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(_key text, _max int, _window_seconds int)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c int;
BEGIN
  INSERT INTO public.rate_limits(key, window_start, count) VALUES (_key, now(), 1)
  ON CONFLICT (key) DO UPDATE SET
    count = CASE WHEN public.rate_limits.window_start < now() - make_interval(secs => _window_seconds) THEN 1 ELSE public.rate_limits.count + 1 END,
    window_start = CASE WHEN public.rate_limits.window_start < now() - make_interval(secs => _window_seconds) THEN now() ELSE public.rate_limits.window_start END
  RETURNING count INTO c;
  RETURN c <= _max;
END; $$;
REVOKE ALL ON FUNCTION public.check_rate_limit(text,int,int) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text,int,int) TO service_role;

-- ===== app settings (super admin) =====
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read settings" ON public.app_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
INSERT INTO public.app_settings(key, value) VALUES ('require_admin_mfa', 'false'::jsonb);

REVOKE EXECUTE ON FUNCTION public.assign_consultation_public_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_consultation_change() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_note_added() FROM PUBLIC, anon, authenticated;
