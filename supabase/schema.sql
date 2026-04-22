-- Run this in Supabase → SQL Editor → New query → Run
-- Uses quoted camelCase identifiers so columns match TypeScript types 1:1.

create table if not exists projects (
  id            text primary key,
  name          text not null,
  emoji         text not null,
  color         text not null,
  status        text not null,
  description   text,
  budget        numeric not null default 0,
  currency      text not null default 'USD',
  "startDate"   timestamptz not null,
  "dueDate"     timestamptz,
  "createdAt"   timestamptz not null default now()
);

create table if not exists tasks (
  id            text primary key,
  "projectId"   text not null references projects(id) on delete cascade,
  title         text not null,
  status        text not null,
  priority      text not null,
  "dueDate"     timestamptz,
  "createdAt"   timestamptz not null default now(),
  "completedAt" timestamptz
);
create index if not exists tasks_project_idx on tasks ("projectId");

create table if not exists transactions (
  id            text primary key,
  "projectId"   text not null references projects(id) on delete cascade,
  type          text not null,
  amount        numeric not null,
  currency      text not null,
  category      text not null,
  note          text,
  date          timestamptz not null default now(),
  source        text
);
create index if not exists tx_project_idx on transactions ("projectId");
create index if not exists tx_date_idx    on transactions (date desc);

create table if not exists recurrings (
  id            text primary key,
  "projectId"   text not null references projects(id) on delete cascade,
  type          text not null,
  amount        numeric not null,
  currency      text not null,
  category      text not null,
  note          text,
  period        text not null,
  "dayOfMonth"  integer,
  "dayOfWeek"   integer,
  "startDate"   timestamptz not null,
  active        boolean not null default true
);

create table if not exists goals (
  id            text primary key,
  "projectId"   text not null references projects(id) on delete cascade,
  kind          text not null,
  title         text not null,
  target        numeric not null,
  unit          text,
  "dueDate"     timestamptz,
  "createdAt"   timestamptz not null default now()
);

create table if not exists notes (
  id            text primary key,
  "projectId"   text not null references projects(id) on delete cascade,
  text          text not null,
  "createdAt"   timestamptz not null default now(),
  source        text
);

create table if not exists links (
  id            text primary key,
  "projectId"   text not null references projects(id) on delete cascade,
  label         text not null,
  url           text not null,
  icon          text
);

-- For now we use service_role from server only. Disable RLS so PostgREST is closed off
-- to anon (no anon key is shipped to browser). If you later expose anon, re-enable RLS.
alter table projects     disable row level security;
alter table tasks        disable row level security;
alter table transactions disable row level security;
alter table recurrings   disable row level security;
alter table goals        disable row level security;
alter table notes        disable row level security;
alter table links        disable row level security;
