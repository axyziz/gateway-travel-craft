
-- =========================================================
-- ROLES
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'agent', 'viewer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable to team" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default viewer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- CUSTOMERS
-- =========================================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  notes TEXT,
  enquiry_count INT NOT NULL DEFAULT 0,
  first_enquiry_at TIMESTAMPTZ,
  last_enquiry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX customers_email_key ON public.customers (lower(email)) WHERE email IS NOT NULL;
CREATE INDEX customers_phone_idx ON public.customers (phone);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team read customers" ON public.customers
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team write customers" ON public.customers
  FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE TRIGGER trg_customers_updated
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- ENQUIRIES
-- =========================================================
CREATE TYPE public.enquiry_service AS ENUM ('flight','hotel','visa','holiday','bus','vehicle');
CREATE TYPE public.enquiry_status AS ENUM ('new','in_progress','quoted','confirmed','completed','cancelled');
CREATE TYPE public.enquiry_priority AS ENUM ('low','normal','high');

CREATE TABLE public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT NOT NULL UNIQUE DEFAULT ('ENQ-' || to_char(now(),'YYMMDD') || '-' || upper(substr(gen_random_uuid()::text,1,6))),
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  service_type public.enquiry_service NOT NULL,
  status public.enquiry_status NOT NULL DEFAULT 'new',
  priority public.enquiry_priority NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- snapshot of contact info
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_whatsapp TEXT,

  -- common travel fields
  travel_date DATE,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  infants INT DEFAULT 0,
  message TEXT,

  -- service specific
  details JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX enquiries_status_idx ON public.enquiries (status);
CREATE INDEX enquiries_service_idx ON public.enquiries (service_type);
CREATE INDEX enquiries_created_idx ON public.enquiries (created_at DESC);
CREATE INDEX enquiries_customer_idx ON public.enquiries (customer_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT INSERT ON public.enquiries TO anon;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Public may submit enquiries (write-only)
CREATE POLICY "Anyone can submit enquiry" ON public.enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Team read enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team update enquiries" ON public.enquiries
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Team delete enquiries" ON public.enquiries
  FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);

CREATE TRIGGER trg_enquiries_updated
  BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public may upsert their own customer row when submitting an enquiry
GRANT INSERT, UPDATE ON public.customers TO anon;
CREATE POLICY "Anyone can upsert customer via enquiry" ON public.customers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update customer stats" ON public.customers
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- =========================================================
-- ACTIVITY LOGS
-- =========================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX activity_logs_enquiry_idx ON public.activity_logs (enquiry_id, created_at DESC);
CREATE INDEX activity_logs_customer_idx ON public.activity_logs (customer_id, created_at DESC);

GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT INSERT ON public.activity_logs TO anon;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert activity" ON public.activity_logs
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Team read activity" ON public.activity_logs
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- =========================================================
-- ENQUIRY TRIGGERS: update customer stats + auto-log
-- =========================================================
CREATE OR REPLACE FUNCTION public.enquiry_after_insert()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers
      SET enquiry_count = enquiry_count + 1,
          last_enquiry_at = NEW.created_at,
          first_enquiry_at = COALESCE(first_enquiry_at, NEW.created_at)
      WHERE id = NEW.customer_id;
  END IF;

  INSERT INTO public.activity_logs (enquiry_id, customer_id, action, meta)
  VALUES (NEW.id, NEW.customer_id, 'enquiry_created',
    jsonb_build_object('service_type', NEW.service_type, 'reference', NEW.reference));

  RETURN NEW;
END; $$;

CREATE TRIGGER trg_enquiry_after_insert
  AFTER INSERT ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.enquiry_after_insert();

CREATE OR REPLACE FUNCTION public.enquiry_after_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.activity_logs (enquiry_id, customer_id, actor_id, action, meta)
    VALUES (NEW.id, NEW.customer_id, auth.uid(), 'status_changed',
      jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;
  IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
    INSERT INTO public.activity_logs (enquiry_id, customer_id, actor_id, action, meta)
    VALUES (NEW.id, NEW.customer_id, auth.uid(), 'assigned',
      jsonb_build_object('from', OLD.assigned_to, 'to', NEW.assigned_to));
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_enquiry_after_update
  AFTER UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.enquiry_after_update();
