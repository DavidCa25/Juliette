-- Esquema de Julietté en Neon (Postgres).
-- Se aplica solo en cada despliegue (scripts/migrate.mjs). Todas las sentencias son idempotentes.

CREATE TABLE IF NOT EXISTS orders (
  id            text PRIMARY KEY,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  status        text NOT NULL DEFAULT 'nuevo',
  customer_name text NOT NULL,
  phone         text NOT NULL,
  email         text NOT NULL,
  delivery      text NOT NULL,
  address       jsonb,
  payment       text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pendiente',
  gift          text,
  items         jsonb NOT NULL,
  subtotal      integer,
  shipping      integer,
  total         integer,
  currency      text NOT NULL DEFAULT 'MXN',
  visitor_id    text,
  source        jsonb,
  notes         text
);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (lower(email));

CREATE TABLE IF NOT EXISTS events (
  id         bigserial PRIMARY KEY,
  ts         timestamptz NOT NULL DEFAULT now(),
  type       text NOT NULL,
  path       text,
  visitor_id text,
  session_id text,
  referrer   text,
  utm        jsonb,
  device     text,
  country    text,
  data       jsonb
);
CREATE INDEX IF NOT EXISTS events_ts_idx ON events (ts DESC);
CREATE INDEX IF NOT EXISTS events_type_ts_idx ON events (type, ts DESC);
