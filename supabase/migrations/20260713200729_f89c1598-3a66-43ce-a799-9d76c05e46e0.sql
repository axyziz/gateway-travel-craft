
-- Enums
CREATE TYPE public.quotation_status AS ENUM ('draft','sent','accepted','rejected','expired','cancelled');
CREATE TYPE public.booking_status AS ENUM ('pending','confirmed','issued','completed','cancelled');
CREATE TYPE public.invoice_status AS ENUM ('draft','pending','paid','cancelled');
CREATE TYPE public.payment_method AS ENUM ('cash','upi','bank_transfer','card','other');
CREATE TYPE public.payment_status AS ENUM ('pending','partial','paid','refunded');

-- Sequences for human-friendly reference numbers
CREATE SEQUENCE IF NOT EXISTS public.quotation_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.booking_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.invoice_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.payment_seq START 1;

CREATE OR REPLACE FUNCTION public.gen_ref(prefix text, seq regclass)
RETURNS text LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT prefix || '-' || lpad(nextval(seq)::text, 6, '0');
$$;

-- QUOTATIONS
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT public.gen_ref('GTQ', 'public.quotation_seq'),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  enquiry_id uuid REFERENCES public.enquiries(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  status public.quotation_status NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  notes text,
  terms text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotations TO authenticated;
GRANT ALL ON public.quotations TO service_role;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage quotations" ON public.quotations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_quotations_updated BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  service_type public.enquiry_service NOT NULL,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotation_items TO authenticated;
GRANT ALL ON public.quotation_items TO service_role;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage quotation items" ON public.quotation_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_qitems_qid ON public.quotation_items(quotation_id);

-- BOOKINGS
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT public.gen_ref('GTB', 'public.booking_seq'),
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  service_type public.enquiry_service,
  status public.booking_status NOT NULL DEFAULT 'pending',
  booking_date date NOT NULL DEFAULT CURRENT_DATE,
  travel_date date,
  supplier text,
  pnr text,
  ticket_number text,
  airline text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  remarks text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage bookings" ON public.bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INVOICES
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT public.gen_ref('GTI', 'public.invoice_seq'),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  status public.invoice_status NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  tax numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  amount_paid numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  notes text,
  terms text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  service_type public.enquiry_service,
  description text NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
GRANT ALL ON public.invoice_items TO service_role;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage invoice items" ON public.invoice_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX idx_iitems_iid ON public.invoice_items(invoice_id);

-- PAYMENTS
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT public.gen_ref('GTP', 'public.payment_seq'),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  method public.payment_method NOT NULL DEFAULT 'cash',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  external_reference text,
  status public.payment_status NOT NULL DEFAULT 'paid',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can manage payments" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Keep invoice.amount_paid in sync with payments
CREATE OR REPLACE FUNCTION public.recalc_invoice_paid()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  inv uuid := COALESCE(NEW.invoice_id, OLD.invoice_id);
  paid numeric(12,2);
BEGIN
  IF inv IS NULL THEN RETURN NEW; END IF;
  SELECT COALESCE(SUM(amount),0) INTO paid FROM public.payments
    WHERE invoice_id = inv AND status IN ('paid','partial');
  UPDATE public.invoices SET amount_paid = paid,
    status = CASE
      WHEN paid >= total AND total > 0 THEN 'paid'::public.invoice_status
      WHEN paid > 0 THEN 'pending'::public.invoice_status
      ELSE status END
    WHERE id = inv;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_payments_recalc AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.recalc_invoice_paid();

-- Activity log helpers
CREATE OR REPLACE FUNCTION public.log_business_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  action_name text;
  cust uuid;
BEGIN
  action_name := TG_ARGV[0];
  cust := NULL;
  BEGIN cust := NEW.customer_id; EXCEPTION WHEN OTHERS THEN cust := NULL; END;
  INSERT INTO public.activity_logs (customer_id, actor_id, action, meta)
  VALUES (cust, auth.uid(), action_name,
    jsonb_build_object('id', NEW.id, 'reference', NEW.reference));
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_quot_log AFTER INSERT ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.log_business_event('quotation_created');
CREATE TRIGGER trg_book_log AFTER INSERT ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.log_business_event('booking_created');
CREATE TRIGGER trg_inv_log  AFTER INSERT ON public.invoices  FOR EACH ROW EXECUTE FUNCTION public.log_business_event('invoice_created');
CREATE TRIGGER trg_pay_log  AFTER INSERT ON public.payments  FOR EACH ROW EXECUTE FUNCTION public.log_business_event('payment_recorded');
