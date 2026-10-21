-- Leor Design lead database initialization.
-- Run this migration once in Supabase Dashboard > SQL Editor, then choose Run.
-- Row Level Security is enabled without anon/authenticated policies; only trusted
-- server code using the service_role key may access these tables.

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  idempotency_key text unique,
  source text not null check (source in ('hero_form', 'enquiry_form', 'estimator', 'service_card', 'whatsapp_button')),
  name text,
  mobile text check (mobile is null or mobile ~ '^[6-9][0-9]{9}$'),
  email text,
  property_type text,
  locality text,
  services_needed text[] not null default '{}',
  requirements text,
  estimator_selections jsonb,
  indicative_estimate text,
  page_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text check (device_type is null or device_type in ('mobile', 'tablet', 'desktop')),
  whatsapp_clicked boolean not null default false,
  consent boolean not null default false,
  consent_at timestamptz,
  status text not null default 'New' check (
    status in ('New', 'Contacted', 'Site visit scheduled', 'Quoted', 'Won', 'Lost', 'WhatsApp click (no details)')
  ),
  follow_up_notes text,
  sheets_synced boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.whatsapp_clicks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  page_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text check (device_type is null or device_type in ('mobile', 'tablet', 'desktop')),
  message_text text
);

create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  wa_message_id text unique,
  from_phone text,
  profile_name text,
  message_text text,
  direction text not null default 'inbound'
);

create index if not exists leads_created_at_desc_idx on public.leads (created_at desc);
create index if not exists leads_mobile_idx on public.leads (mobile);
create index if not exists leads_status_idx on public.leads (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- Atomically record a click and the corresponding no-details lead.
create or replace function public.log_whatsapp_click(
  p_source text,
  p_page_url text,
  p_utm_source text,
  p_utm_medium text,
  p_utm_campaign text,
  p_device_type text,
  p_message_text text,
  p_estimator_selections jsonb default null,
  p_indicative_estimate text default null
)
returns table (click_id uuid, lead_id uuid)
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_click_id uuid;
  new_lead_id uuid;
begin
  insert into public.whatsapp_clicks (
    source, page_url, utm_source, utm_medium, utm_campaign, device_type, message_text
  )
  values (
    p_source, p_page_url, p_utm_source, p_utm_medium, p_utm_campaign, p_device_type, p_message_text
  )
  returning id into new_click_id;

  insert into public.leads (
    source, estimator_selections, indicative_estimate, page_url,
    utm_source, utm_medium, utm_campaign, device_type,
    whatsapp_clicked, consent, status
  )
  values (
    'whatsapp_button', p_estimator_selections, p_indicative_estimate, p_page_url,
    p_utm_source, p_utm_medium, p_utm_campaign, p_device_type,
    true, false, 'WhatsApp click (no details)'
  )
  returning id into new_lead_id;

  return query select new_click_id, new_lead_id;
end;
$$;

alter table public.leads enable row level security;
alter table public.whatsapp_clicks enable row level security;
alter table public.whatsapp_messages enable row level security;

revoke all on public.leads, public.whatsapp_clicks, public.whatsapp_messages from anon, authenticated;
grant all on public.leads, public.whatsapp_clicks, public.whatsapp_messages to service_role;
revoke all on function public.log_whatsapp_click(text, text, text, text, text, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.log_whatsapp_click(text, text, text, text, text, text, text, jsonb, text) to service_role;
