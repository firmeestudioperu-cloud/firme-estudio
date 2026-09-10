-- ============================================================
-- FIRME ESTUDIO-PILATES — BASE DE DATOS PRODUCCION
-- PostgreSQL 15+ (Supabase)
-- Sede: San Juan de Lurigancho (SJL), Lima, Peru
-- 8 Reformer Allegro 2 Balanced Body por sesion
-- ============================================================
-- Pegar completo en: Supabase -> SQL Editor -> New Query -> Run
-- ============================================================

-- ============================================================
-- BLOQUE 0: LIMPIEZA TOTAL
-- ============================================================
DROP TABLE IF EXISTS public.boutique_orders    CASCADE;
DROP TABLE IF EXISTS public.boutique_products  CASCADE;
DROP TABLE IF EXISTS public.leads              CASCADE;
DROP TABLE IF EXISTS public.expenses           CASCADE;
DROP TABLE IF EXISTS public.cash_transactions  CASCADE;
DROP TABLE IF EXISTS public.bookings           CASCADE;
DROP TABLE IF EXISTS public.client_plans       CASCADE;
DROP TABLE IF EXISTS public.user_profiles      CASCADE;
DROP TABLE IF EXISTS public.clients            CASCADE;
DROP TABLE IF EXISTS public.classes            CASCADE;
DROP TABLE IF EXISTS public.instructors        CASCADE;
DROP TABLE IF EXISTS public.plans              CASCADE;
DROP TABLE IF EXISTS public.staff_profiles     CASCADE;

DROP FUNCTION IF EXISTS public.fn_set_updated_at()        CASCADE;
DROP FUNCTION IF EXISTS public.fn_checkin_update_client() CASCADE;

-- ============================================================
-- BLOQUE 1: EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- BLOQUE 2: FUNCION GLOBAL updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================
-- TABLA 1: plans — Catalogo de Planes
-- ============================================================
CREATE TABLE public.plans (
  id            TEXT          PRIMARY KEY,
  name          TEXT          NOT NULL,
  description   TEXT,
  plan_type     TEXT          NOT NULL CHECK (plan_type IN ('ilimitado','pack','clase_suelta','prueba')),
  credits       SMALLINT      NULL,
  price_soles   NUMERIC(8,2)  NOT NULL DEFAULT 0,
  validity_days SMALLINT      NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  sort_order    SMALLINT      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  public.plans IS 'Catalogo de planes y membresias. Fuente unica de verdad para precios.';
COMMENT ON COLUMN public.plans.credits IS 'Cantidad de clases incluidas. NULL = ilimitado.';
COMMENT ON COLUMN public.plans.validity_days IS 'Dias de vigencia desde la compra. NULL = sin vencimiento.';

-- ============================================================
-- TABLA 2: instructors — Instructoras del Estudio
-- ============================================================
CREATE TABLE public.instructors (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT          NOT NULL,
  email         TEXT          UNIQUE,
  phone         TEXT,
  specialty     TEXT,
  bio           TEXT,
  certification TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_instructors_upd
  BEFORE UPDATE ON public.instructors
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
COMMENT ON TABLE public.instructors IS 'Instructoras registradas del estudio. Referenciadas por clases.';

-- ============================================================
-- TABLA 3: classes — Plantilla Semanal Recurrente
-- La ocupacion se calcula en tiempo real via vista (no almacenada)
-- ============================================================
CREATE TABLE public.classes (
  id              TEXT          PRIMARY KEY,
  day             TEXT          NOT NULL CHECK (day IN ('lun','mar','mie','jue','vie','sab','dom')),
  start_time      TIME          NOT NULL,
  name            TEXT          NOT NULL,
  instructor_id   UUID          REFERENCES public.instructors(id) ON DELETE SET NULL,
  instructor_name TEXT          NOT NULL,
  level           TEXT          NOT NULL CHECK (level IN ('Principiante','Intermedio','Avanzado')),
  class_type      TEXT          NOT NULL CHECK (class_type IN ('Reformer','Mat','Suspension')),
  duration_min    SMALLINT      NOT NULL DEFAULT 50,
  total_spots     SMALLINT      NOT NULL DEFAULT 8 CHECK (total_spots BETWEEN 1 AND 8),
  focus           TEXT,
  description     TEXT,
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_classes_upd
  BEFORE UPDATE ON public.classes
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
COMMENT ON TABLE  public.classes IS 'Plantilla semanal recurrente. No almacena ocupacion (se calcula por vista).';
COMMENT ON COLUMN public.classes.instructor_name IS 'Denormalizado para display rapido.';

-- ============================================================
-- TABLA 4: clients — Registro Central de Alumnas
-- Walk-ins (sin cuenta) y alumnas registradas (con Google/email)
-- ============================================================
CREATE TABLE public.clients (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id              UUID          UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name                      TEXT          NOT NULL,
  email                     TEXT          UNIQUE,
  phone                     TEXT          NOT NULL DEFAULT '',
  dni                       TEXT          UNIQUE NOT NULL,
  document_type             TEXT          NOT NULL DEFAULT 'dni'
                              CHECK (document_type IN ('dni','ce','pasaporte')),
  birth_date                DATE,
  gender                    TEXT          NOT NULL DEFAULT 'otro'
                              CHECK (gender IN ('femenino','masculino','otro')),
  emergency_contact         TEXT,
  emergency_phone           TEXT,
  medical_notes             TEXT,
  registration_method       TEXT          NOT NULL DEFAULT 'manual_web'
                              CHECK (registration_method IN ('qr','manual_web','whatsapp','receptionist_desk')),
  exp_points                INTEGER       NOT NULL DEFAULT 0 CHECK (exp_points >= 0),
  total_attended            SMALLINT      NOT NULL DEFAULT 0 CHECK (total_attended >= 0),
  share_in_leaderboard      BOOLEAN       NOT NULL DEFAULT TRUE,
  receive_marketing_updates BOOLEAN       NOT NULL DEFAULT TRUE,
  status                    TEXT          NOT NULL DEFAULT 'activo'
                              CHECK (status IN ('activo','en_riesgo','inactivo')),
  join_date                 TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  last_visit                TIMESTAMPTZ,
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_clients_upd
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
COMMENT ON TABLE  public.clients IS 'Registro central de alumnas. Walk-ins tienen auth_user_id NULL.';
COMMENT ON COLUMN public.clients.auth_user_id IS 'NULL para walk-ins registradas por recepcion presencial.';
COMMENT ON COLUMN public.clients.exp_points IS '+150 por clase asistida (trigger automatico en bookings).';

-- ============================================================
-- TABLA 5: user_profiles — Extiende auth.users (1 a 1)
-- Solo existe para usuarios con cuenta digital (email o Google)
-- ============================================================
CREATE TABLE public.user_profiles (
  id               UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id        UUID          REFERENCES public.clients(id) ON DELETE SET NULL,
  role             TEXT          NOT NULL DEFAULT 'client'
                     CHECK (role IN ('owner_dev','admin','receptionist','instructor','client')),
  role_title       TEXT          NOT NULL DEFAULT 'Alumna',
  experience_level TEXT          NOT NULL DEFAULT 'Principiante'
                     CHECK (experience_level IN ('Principiante','Intermedio','Avanzado')),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_user_profiles_upd
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
COMMENT ON TABLE  public.user_profiles IS 'Extiende auth.users. Vincula cuenta digital con registro de alumna.';
COMMENT ON COLUMN public.user_profiles.client_id IS 'Enlace al registro en clients. NULL si aun no se vinculo.';

-- ============================================================
-- TABLA 6: client_plans — Historial de Planes por Alumna
-- Plan activo = is_active=TRUE. Historial preservado siempre.
-- credits_left se decrementa aqui (no en clients)
-- ============================================================
CREATE TABLE public.client_plans (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID          NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  plan_id         TEXT          REFERENCES public.plans(id) ON DELETE SET NULL,
  plan_name       TEXT          NOT NULL,
  plan_type       TEXT          NOT NULL CHECK (plan_type IN ('ilimitado','pack','clase_suelta','prueba')),
  credits_initial SMALLINT      NULL,
  credits_left    SMALLINT      NOT NULL DEFAULT 0 CHECK (credits_left >= 0),
  price_paid      NUMERIC(8,2)  NULL,
  payment_method  TEXT          NULL CHECK (payment_method IN
                    ('yape','plin','tarjeta_pos','efectivo','transferencia_bcp','transferencia_bbva')),
  starts_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ   NULL,
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  public.client_plans IS 'Historial de planes. credits_left se decrementa via trigger al hacer check-in.';
COMMENT ON COLUMN public.client_plans.credits_initial IS 'NULL = plan ilimitado.';

-- ============================================================
-- TABLA 7: bookings — Reservas y Check-in Totem SJL
-- UNIQUE(class_id, client_dni, scheduled_date) evita doble reserva
-- scheduled_date = fecha especifica (no solo dia de semana)
-- ============================================================
CREATE TABLE public.bookings (
  id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id               TEXT          NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_name             TEXT          NOT NULL,
  class_time             TEXT          NOT NULL,
  class_day              TEXT          NOT NULL,
  instructor_name        TEXT          NOT NULL,
  scheduled_date         DATE          NOT NULL,
  client_id              UUID          REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name            TEXT          NOT NULL,
  client_dni             TEXT          NOT NULL,
  client_email           TEXT,
  client_phone           TEXT,
  status                 TEXT          NOT NULL DEFAULT 'confirmada'
                           CHECK (status IN ('confirmada','asistio','cancelada')),
  bed_number             SMALLINT      NULL CHECK (bed_number BETWEEN 1 AND 8),
  is_waitlist            BOOLEAN       NOT NULL DEFAULT FALSE,
  medical_alert          TEXT,
  check_in_time          TIME          NULL,
  whatsapp_reminder_sent BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (class_id, client_dni, scheduled_date)
);
CREATE TRIGGER trg_bookings_upd
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
COMMENT ON TABLE  public.bookings IS 'Reservas con fecha especifica. UNIQUE evita doble reserva por dia.';
COMMENT ON COLUMN public.bookings.scheduled_date IS 'Fecha concreta de la sesion (no solo dia de semana).';
COMMENT ON COLUMN public.bookings.check_in_time IS 'Hora exacta del Totem SJL o recepcion.';

-- ============================================================
-- FUNCION + TRIGGER: Check-in automatico
-- Al marcar status='asistio':
--   1. Suma +150 EXP y +1 asistencia en clients
--   2. Descuenta 1 credito en client_plans activo (si no es ilimitado)
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_checkin_update_client()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'asistio' AND OLD.status IS DISTINCT FROM 'asistio' THEN
    UPDATE public.clients SET
      exp_points     = exp_points + 150,
      total_attended = total_attended + 1,
      last_visit     = NOW(),
      updated_at     = NOW()
    WHERE id = NEW.client_id;

    UPDATE public.client_plans SET
      credits_left = GREATEST(credits_left - 1, 0)
    WHERE client_id  = NEW.client_id
      AND is_active  = TRUE
      AND plan_type != 'ilimitado'
      AND credits_left > 0;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_checkin
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'asistio' AND OLD.status IS DISTINCT FROM 'asistio')
  EXECUTE FUNCTION public.fn_checkin_update_client();

-- ============================================================
-- VISTA 1: classes_today
-- Ocupacion del dia actual calculada en tiempo real
-- NO almacena datos redundantes
-- ============================================================
CREATE OR REPLACE VIEW public.classes_today AS
SELECT
  c.id, c.day, c.start_time, c.name, c.instructor_name,
  c.level, c.class_type, c.duration_min, c.total_spots, c.focus, c.is_active,
  COALESCE(b.cnt, 0)::SMALLINT                          AS occupied_spots,
  (c.total_spots - COALESCE(b.cnt, 0))::SMALLINT        AS available_spots
FROM public.classes c
LEFT JOIN (
  SELECT class_id, COUNT(*)::INT AS cnt
  FROM   public.bookings
  WHERE  status        != 'cancelada'
    AND  scheduled_date = CURRENT_DATE
  GROUP BY class_id
) b ON b.class_id = c.id
WHERE c.is_active = TRUE;
COMMENT ON VIEW public.classes_today IS 'Ocupacion en tiempo real de hoy. Sin datos redundantes almacenados.';

-- ============================================================
-- VISTA 2: classes_week
-- Ocupacion semanal (semana en curso, lun-dom)
-- ============================================================
CREATE OR REPLACE VIEW public.classes_week AS
SELECT
  c.id, c.day, c.start_time, c.name, c.instructor_name,
  c.level, c.class_type, c.duration_min, c.total_spots, c.focus,
  COALESCE(b.cnt, 0)::SMALLINT                          AS occupied_spots,
  (c.total_spots - COALESCE(b.cnt, 0))::SMALLINT        AS available_spots,
  b.scheduled_date
FROM public.classes c
LEFT JOIN (
  SELECT class_id, scheduled_date, COUNT(*)::INT AS cnt
  FROM   public.bookings
  WHERE  status        != 'cancelada'
    AND  scheduled_date BETWEEN date_trunc('week', CURRENT_DATE)::DATE
                             AND (date_trunc('week', CURRENT_DATE) + INTERVAL '6 days')::DATE
  GROUP BY class_id, scheduled_date
) b ON b.class_id = c.id
WHERE c.is_active = TRUE;
COMMENT ON VIEW public.classes_week IS 'Ocupacion de la semana actual. Unir por class_id + scheduled_date.';

-- ============================================================
-- VISTA 3: clients_with_plan
-- Alumnas con plan activo actual (LATERAL JOIN eficiente)
-- ============================================================
CREATE OR REPLACE VIEW public.clients_with_plan AS
SELECT
  c.id, c.name, c.email, c.phone, c.dni, c.document_type,
  c.birth_date, c.gender, c.emergency_contact, c.emergency_phone,
  c.medical_notes, c.registration_method, c.exp_points, c.total_attended,
  c.status, c.share_in_leaderboard, c.receive_marketing_updates,
  c.join_date, c.last_visit,
  cp.plan_name      AS current_plan,
  cp.plan_type,
  cp.credits_left,
  cp.credits_initial,
  cp.expires_at     AS plan_expires_at,
  cp.starts_at      AS plan_starts_at
FROM public.clients c
LEFT JOIN LATERAL (
  SELECT plan_name, plan_type, credits_left, credits_initial, expires_at, starts_at
  FROM   public.client_plans
  WHERE  client_id = c.id
    AND  is_active  = TRUE
    AND  (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1
) cp ON TRUE;
COMMENT ON VIEW public.clients_with_plan IS 'Alumnas con plan activo actual. LATERAL JOIN evita subquery ineficiente.';

-- ============================================================
-- TABLA 8: cash_transactions — Caja e Ingresos
-- ============================================================
CREATE TABLE public.cash_transactions (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  type           TEXT          NOT NULL CHECK (type IN ('ingreso','egreso')),
  concept        TEXT          NOT NULL,
  category       TEXT          NOT NULL CHECK (category IN
                   ('membresia','pack_clases','clase_suelta','tienda_calcetines','bebidas','otro')),
  amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT          NOT NULL CHECK (payment_method IN
                   ('yape','plin','tarjeta_pos','efectivo','transferencia_bcp','transferencia_bbva')),
  client_id      UUID          REFERENCES public.clients(id)      ON DELETE SET NULL,
  client_name    TEXT,
  client_plan_id UUID          REFERENCES public.client_plans(id) ON DELETE SET NULL,
  receipt_type   TEXT          CHECK (receipt_type IN ('boleta','factura','ninguno')),
  receipt_number TEXT,
  notes          TEXT,
  transacted_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  public.cash_transactions IS 'Caja diaria. Vincular client_plan_id al vender un plan.';
COMMENT ON COLUMN public.cash_transactions.client_name IS 'Denormalizado para reportes rapidos.';

-- ============================================================
-- TABLA 9: expenses — Gastos Operativos
-- ============================================================
CREATE TABLE public.expenses (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  description    TEXT          NOT NULL,
  category       TEXT          NOT NULL CHECK (category IN (
                   'alquiler_local','pago_instructores','mantenimiento_reformers',
                   'servicios_luz_agua_wifi','marketing_redes','insumos_limpieza','otros')),
  amount         NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  recipient      TEXT,
  payment_method TEXT          CHECK (payment_method IN
                   ('yape','plin','tarjeta_pos','efectivo','transferencia_bcp','transferencia_bbva')),
  status         TEXT          NOT NULL DEFAULT 'pendiente'
                   CHECK (status IN ('pagado','pendiente','vencido')),
  receipt_number TEXT,
  due_date       DATE,
  paid_at        TIMESTAMPTZ   NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.expenses IS 'Gastos operativos. paid_at se registra al cambiar status a pagado.';

-- ============================================================
-- TABLA 10: leads — Pipeline de Captacion
-- ============================================================
CREATE TABLE public.leads (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT          NOT NULL,
  phone               TEXT          NOT NULL,
  email               TEXT,
  channel             TEXT          NOT NULL CHECK (channel IN
                        ('instagram','tiktok','whatsapp','web_organico','recomendacion')),
  interest            TEXT          CHECK (interest IN ('Reformer','Mat','Suspension','Todos')),
  status              TEXT          NOT NULL DEFAULT 'nuevo' CHECK (status IN
                        ('nuevo','contactado','prueba_agendada','asistio_prueba','convertido','no_interesado')),
  notes               TEXT,
  trial_date          DATE,
  converted_client_id UUID          REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_leads_upd
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
COMMENT ON TABLE public.leads IS 'Prospectas en pipeline. converted_client_id se llena al convertir.';

-- ============================================================
-- TABLA 11: boutique_products — Catalogo de Productos
-- ============================================================
CREATE TABLE public.boutique_products (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT          NOT NULL,
  category    TEXT          CHECK (category IN ('calcetines','accesorios','bebidas','ropa','otro')),
  description TEXT,
  price_soles NUMERIC(8,2)  NULL,
  price_exp   INTEGER       NULL,
  stock       SMALLINT      NULL,
  is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_boutique_prod_upd
  BEFORE UPDATE ON public.boutique_products
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
COMMENT ON TABLE  public.boutique_products IS 'Catalogo de productos. stock NULL = sin control de inventario.';
COMMENT ON COLUMN public.boutique_products.price_exp IS 'Costo en puntos EXP. NULL = no canjeable.';

-- ============================================================
-- TABLA 12: boutique_orders — Compras y Canjes
-- ============================================================
CREATE TABLE public.boutique_orders (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID          REFERENCES public.boutique_products(id) ON DELETE SET NULL,
  product_name TEXT          NOT NULL,
  variant      TEXT,
  mode         TEXT          NOT NULL CHECK (mode IN ('efectivo','exp')),
  amount_paid  NUMERIC(8,2)  NULL,
  exp_spent    INTEGER       NULL,
  voucher_code TEXT          UNIQUE NOT NULL,
  client_id    UUID          REFERENCES public.clients(id) ON DELETE SET NULL,
  client_dni   TEXT,
  status       TEXT          NOT NULL DEFAULT 'pendiente_retiro'
                 CHECK (status IN ('pendiente_retiro','entregado','cancelado')),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE  public.boutique_orders IS 'Ventas y canjes. Historial preservado aunque el producto se elimine.';
COMMENT ON COLUMN public.boutique_orders.voucher_code IS 'Codigo unico para retiro fisico en recepcion SJL.';

-- ============================================================
-- TABLA 13: staff_profiles — Personal Autorizado
-- ============================================================
CREATE TABLE public.staff_profiles (
  id           TEXT          PRIMARY KEY,
  auth_user_id UUID          UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name         TEXT          NOT NULL,
  email        TEXT          UNIQUE NOT NULL,
  role         TEXT          NOT NULL CHECK (role IN
                 ('owner_dev','admin','receptionist','instructor','client')),
  role_title   TEXT          NOT NULL,
  phone        TEXT,
  dni          TEXT          UNIQUE,
  is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_staff_upd
  BEFORE UPDATE ON public.staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
COMMENT ON TABLE public.staff_profiles IS 'Personal autorizado con roles RBAC. auth_user_id vincula al iniciar sesion.';

-- ============================================================
-- BLOQUE 3: INDICES DE RENDIMIENTO
-- Solo en columnas usadas en WHERE, JOIN y ORDER BY frecuentes
-- ============================================================

-- classes
CREATE INDEX idx_classes_day
  ON public.classes(day) WHERE is_active = TRUE;

-- clients
CREATE INDEX idx_clients_dni
  ON public.clients(dni);
CREATE INDEX idx_clients_email
  ON public.clients(email);
CREATE INDEX idx_clients_auth_user
  ON public.clients(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX idx_clients_status
  ON public.clients(status);
CREATE INDEX idx_clients_name_trgm
  ON public.clients USING gin(name gin_trgm_ops);

-- bookings
CREATE INDEX idx_bookings_class_date
  ON public.bookings(class_id, scheduled_date);
CREATE INDEX idx_bookings_client_dni
  ON public.bookings(client_dni);
CREATE INDEX idx_bookings_client_id
  ON public.bookings(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_bookings_status
  ON public.bookings(status);
CREATE INDEX idx_bookings_scheduled_date
  ON public.bookings(scheduled_date DESC);

-- client_plans
CREATE INDEX idx_client_plans_active
  ON public.client_plans(client_id, created_at DESC) WHERE is_active = TRUE;

-- cash_transactions
CREATE INDEX idx_tx_transacted
  ON public.cash_transactions(transacted_at DESC);
CREATE INDEX idx_tx_category
  ON public.cash_transactions(category);
CREATE INDEX idx_tx_client
  ON public.cash_transactions(client_id) WHERE client_id IS NOT NULL;

-- leads
CREATE INDEX idx_leads_status
  ON public.leads(status);
CREATE INDEX idx_leads_created
  ON public.leads(created_at DESC);

-- boutique_orders
CREATE INDEX idx_boutique_orders_client
  ON public.boutique_orders(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_boutique_orders_status
  ON public.boutique_orders(status);

-- ============================================================
-- BLOQUE 4: ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.plans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boutique_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boutique_orders   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planes_lectura_publica"
  ON public.plans FOR SELECT USING (true);
CREATE POLICY "instructors_lectura_publica"
  ON public.instructors FOR SELECT USING (is_active = true);
CREATE POLICY "instructors_admin_all"
  ON public.instructors FOR ALL USING (true);
CREATE POLICY "classes_lectura_publica"
  ON public.classes FOR SELECT USING (is_active = true);
CREATE POLICY "classes_admin_all"
  ON public.classes FOR ALL USING (true);
CREATE POLICY "clients_all"
  ON public.clients FOR ALL USING (true);
CREATE POLICY "user_profiles_all"
  ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "client_plans_all"
  ON public.client_plans FOR ALL USING (true);
CREATE POLICY "bookings_select"
  ON public.bookings FOR SELECT USING (true);
CREATE POLICY "bookings_insert"
  ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_update"
  ON public.bookings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "bookings_delete"
  ON public.bookings FOR DELETE USING (true);
CREATE POLICY "cash_transactions_all"
  ON public.cash_transactions FOR ALL USING (true);
CREATE POLICY "expenses_all"
  ON public.expenses FOR ALL USING (true);
CREATE POLICY "leads_all"
  ON public.leads FOR ALL USING (true);
CREATE POLICY "boutique_products_lectura"
  ON public.boutique_products FOR SELECT USING (is_active = true);
CREATE POLICY "boutique_products_admin"
  ON public.boutique_products FOR ALL USING (true);
CREATE POLICY "boutique_orders_all"
  ON public.boutique_orders FOR ALL USING (true);
CREATE POLICY "staff_profiles_lectura"
  ON public.staff_profiles FOR SELECT USING (true);
CREATE POLICY "staff_profiles_admin"
  ON public.staff_profiles FOR ALL USING (true);

-- ============================================================
-- BLOQUE 5: SUPABASE REALTIME
-- Solo tablas que necesitan sincronizacion en tiempo real
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.classes,
  public.bookings,
  public.clients,
  public.client_plans;

-- ============================================================
-- BLOQUE 6: SEED — PLANES OFICIALES
-- ============================================================
INSERT INTO public.plans (id, name, description, plan_type, credits, price_soles, validity_days, sort_order) VALUES
  ('prueba',
   'Clase de Prueba',
   'Una sola clase para conocer el metodo Pilates Reformer sin compromiso.',
   'prueba', 1, 0, 7, 0),
  ('suelta',
   'Clase Suelta',
   'Una clase individual sin membresia. Ideal para asistencia ocasional.',
   'clase_suelta', 1, 40, 30, 1),
  ('pack-4',
   'Pack 4 Clases',
   '4 clases a usar en 60 dias. Perfecto para empezar con flexibilidad.',
   'pack', 4, 140, 60, 2),
  ('pack-8',
   'Pack 8 Clases',
   '8 clases a usar en 90 dias. El pack mas popular del estudio.',
   'pack', 8, 260, 90, 3),
  ('pack-12',
   'Pack 12 Clases',
   '12 clases a usar en 120 dias. Mayor ahorro por clase.',
   'pack', 12, 360, 120, 4),
  ('ilimitado',
   'Membresia Ilimitada Mensual',
   'Clases ilimitadas durante 30 dias. Sin restriccion de asistencia.',
   'ilimitado', NULL, 420, 30, 5),
  ('ilimitado-3',
   'Membresia Ilimitada 3 Meses',
   'Clases ilimitadas durante 90 dias. El mejor precio por dia.',
   'ilimitado', NULL, 1100, 90, 6)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLOQUE 7: SEED — INSTRUCTORAS
-- ============================================================
INSERT INTO public.instructors (name, specialty, bio, certification, is_active) VALUES
  ('Valeria Soler',
   'Reformer y Mat Pilates',
   'Especialista en fundamentos y trabajo postural profundo. 6 anos de experiencia en SJL.',
   'Balanced Body Comprehensive', TRUE),
  ('Mateo Arismendi',
   'Contrology y Reformer Clasico',
   'Formado en la metodologia clasica de Joseph Pilates. Instructor principal de niveles intermedios.',
   'BASI Pilates Certified', TRUE),
  ('Clara Dominguez',
   'Suspension y Tower Cadillac',
   'Especialista en trabajo aereo, inversiones seguras y aparatos de suspension.',
   'Stott Pilates Full Certification', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- BLOQUE 8: SEED — HORARIO SEMANAL (23 clases, lun-dom)
-- total_spots segun aforo real: Reformer/Mat=8, Suspension=6
-- Ocupacion calculada en tiempo real por vista (no almacenada)
-- ============================================================
INSERT INTO public.classes (id, day, start_time, name, instructor_name, level, class_type, duration_min, total_spots, focus) VALUES
  ('lun-1','lun','07:30','Fundamentos Reformer','Valeria Soler','Principiante','Reformer',50,8,
   'Alineacion, respiracion y control motor basico'),
  ('lun-2','lun','09:00','Reformer Flow Dinamico','Mateo Arismendi','Intermedio','Reformer',50,8,
   'Secuencias continuas y resistencia articular'),
  ('lun-3','lun','18:00','Suspension y Tower Core','Clara Dominguez','Avanzado','Suspension',55,6,
   'Fuerza excentrica y estabilidad de columna en muelles y arneses'),
  ('lun-4','lun','19:30','Restorative Mat y Breathwork','Valeria Soler','Principiante','Mat',50,8,
   'Descompresion espinal, suelo consciente y movilidad articular'),
  ('mar-1','mar','08:00','Contrology Clasico Reformer','Mateo Arismendi','Intermedio','Reformer',50,8,
   'Principios originales de Joseph Pilates en Reformer'),
  ('mar-2','mar','10:00','Suspension Aerea y Muelles','Clara Dominguez','Avanzado','Suspension',50,8,
   'Inversiones guiadas, control de gravedad y fuerza del centro'),
  ('mar-3','mar','17:30','Fundamentos Reformer','Valeria Soler','Principiante','Reformer',50,8,
   'Estructura postural y manejo de resortes'),
  ('mar-4','mar','19:00','Mat Postural y Spine Flow','Clara Dominguez','Principiante','Mat',50,8,
   'Apertura de cadera, cintura escapular y alineacion en suelo'),
  ('mie-1','mie','07:30','Reformer Flow Dinamico','Mateo Arismendi','Intermedio','Reformer',50,8,
   'Ritmo sostenido, coordinacion neuromuscular y resistencia'),
  ('mie-2','mie','09:00','Tower Cadillac Suspension','Valeria Soler','Avanzado','Suspension',55,6,
   'Inversiones seguras, barras de empuje y elongacion axial'),
  ('mie-3','mie','18:00','Fundamentos Reformer','Clara Dominguez','Principiante','Reformer',50,8,
   'Centro fuerte y control de pelvis neutra'),
  ('mie-4','mie','19:30','Deep Stretch y Mat Release','Valeria Soler','Principiante','Mat',50,8,
   'Liberacion miofascial y flexibilidad profunda sobre esterilla'),
  ('jue-1','jue','08:30','Contrology Clasico Reformer','Mateo Arismendi','Intermedio','Reformer',50,8,
   'Precision tecnica en aparatos tradicionales'),
  ('jue-2','jue','11:00','Reformer Escultural','Clara Dominguez','Avanzado','Reformer',50,8,
   'Tono muscular largo y estabilizacion lumbar'),
  ('jue-3','jue','18:30','Suspension Power y Stability','Mateo Arismendi','Intermedio','Suspension',50,8,
   'Trabajo con peso corporal suspendido y core tridimensional'),
  ('vie-1','vie','07:30','Sunrise Reformer','Valeria Soler','Principiante','Reformer',50,8,
   'Despertar neuromuscular y movilidad matutina'),
  ('vie-2','vie','09:30','Tower Suspension Challenge','Clara Dominguez','Avanzado','Suspension',55,6,
   'Control en barra de empuje y muelles pesados'),
  ('vie-3','vie','18:00','Mat y Roller Miofascial','Mateo Arismendi','Intermedio','Mat',50,8,
   'Alivio de tensiones posturales con foam roller y trabajo en suelo'),
  ('sab-1','sab','09:30','Masterclass Weekend Reformer','Valeria Soler','Avanzado','Reformer',60,8,
   'Secuencias integrales de repertorio completo'),
  ('sab-2','sab','11:00','Fundamentos y Tecnica Mat','Clara Dominguez','Principiante','Mat',50,8,
   'Taller practico de postura, suelo clasico y biomecanica'),
  ('sab-3','sab','12:30','Suspension Flow de Tarde','Mateo Arismendi','Intermedio','Suspension',50,8,
   'Equilibrio dinamico, coordinacion y centro suspendido'),
  ('dom-1','dom','10:00','Domingo Consciente Mat Clasico','Clara Dominguez','Principiante','Mat',60,6,
   'Practica pausada en colchoneta, propiocepcion y flexibilidad'),
  ('dom-2','dom','11:30','Reformer Posture Reset','Valeria Soler','Intermedio','Reformer',50,8,
   'Rebalance muscular en carro para iniciar la semana')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- BLOQUE 9: SEED — PRODUCTOS BOUTIQUE
-- ============================================================
INSERT INTO public.boutique_products (name, category, description, price_soles, price_exp, stock) VALUES
  ('Calcetines Antideslizantes FIRME','calcetines',
   'Calcetines de grip premium con logo FIRME. Obligatorios en clase Reformer.',
   25, NULL, NULL),
  ('Botella Termica FIRME 500ml','accesorios',
   'Botella acero inoxidable 18h frio / 12h calor. Branding FIRME exclusivo.',
   85, 1500, NULL),
  ('Tote Bag FIRME Organica','accesorios',
   'Bolsa de algodon organico con logo bordado. Capacidad 10L.',
   55, 1000, NULL),
  ('Aceite Aromaterapia Post-clase','accesorios',
   'Blend de lavanda y eucalipto para recuperacion muscular post-sesion.',
   45, NULL, NULL),
  ('Agua Mineral 500ml','bebidas',
   'Agua mineral sin gas para hidratacion en clase.',
   5, NULL, NULL),
  ('Roller Foam FIRME 60cm','accesorios',
   'Foam roller de alta densidad para trabajo miofascial. Incluye guia de ejercicios.',
   95, 2000, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================
-- BLOQUE 10: SEED — STAFF AUTORIZADO
-- Base limpia de produccion — sin datos falsos de alumnas
-- ============================================================
INSERT INTO public.staff_profiles (id, name, email, role, role_title, phone, dni, is_active) VALUES
  ('staff-valentino',
   'Valentino',
   'tinoykz@gmail.com',
   'owner_dev',
   'Owner / Lead Developer',
   '+51 981 223 330',
   '70112233',
   TRUE),
  ('staff-soni',
   'Soni',
   'soni@firmestudio.pe',
   'admin',
   'Administracion Sede SJL',
   '+51 991 223 344',
   '71223344',
   TRUE),
  ('staff-keyla',
   'Keyla',
   'keyla@firmestudio.pe',
   'admin',
   'Administracion y Operaciones',
   '+51 982 334 455',
   '72334455',
   TRUE),
  ('staff-recepcion',
   'Camila',
   'recepcion@firmestudio.pe',
   'receptionist',
   'Recepcion y Mostrador SJL',
   '+51 984 123 456',
   '73445566',
   TRUE)
ON CONFLICT (email) DO UPDATE SET
  role       = EXCLUDED.role,
  role_title = EXCLUDED.role_title,
  is_active  = TRUE,
  updated_at = NOW();

-- ============================================================
-- RESUMEN FINAL
-- ============================================================
-- Tablas  : 13 (plans, instructors, classes, clients,
--               user_profiles, client_plans, bookings,
--               cash_transactions, expenses, leads,
--               boutique_products, boutique_orders, staff_profiles)
-- Vistas  : 3  (classes_today, classes_week, clients_with_plan)
-- Triggers: 10 (updated_at x9 + checkin x1)
-- Indices : 19 (optimizados para consultas reales)
-- Policies: 20 (RLS habilitado en todas las tablas)
-- Realtime: 4  (classes, bookings, clients, client_plans)
-- Seed    : 7 planes | 3 instructoras | 23 clases
--           6 productos | 4 staff
-- ============================================================
