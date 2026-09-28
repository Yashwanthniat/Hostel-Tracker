-- ==============================================================================
-- Migration: 01_schema.sql
-- Description: Core Schema for Hostel Fix Complaint & Accountability Tracker
-- ==============================================================================

-- Enable UUID extension if not already present
create extension if not exists "pgcrypto";

-- 1. Profiles Table (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student', 'staff', 'admin')),
  room_number text,
  created_at timestamptz default now()
);

-- 2. Categories Table
create table if not exists categories (
  id serial primary key,
  name text unique not null,
  default_staff_group text
);

-- 3. Complaints Table
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id) on delete cascade,
  category_id int references categories(id) on delete set null,
  description text not null,
  photo_url text,
  status text not null default 'OPEN'
    check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED_PENDING', 'CLOSED', 'REOPENED')),
  escalation_level int not null default 0,
  assigned_staff_id uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  resolved_at timestamptz
);

-- 4. Status Log (Immutable Audit Trail)
create table if not exists status_log (
  id uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints(id) on delete cascade,
  old_status text not null,
  new_status text not null,
  changed_by uuid not null references profiles(id) on delete cascade,
  note text,
  timestamp timestamptz default now()
);

-- 5. Indexes for Performance
create index if not exists idx_complaints_status on complaints(status);
create index if not exists idx_complaints_student on complaints(student_id);
create index if not exists idx_complaints_assigned_staff on complaints(assigned_staff_id);
create index if not exists idx_complaints_updated_at on complaints(updated_at);
create index if not exists idx_statuslog_complaint on status_log(complaint_id);
create index if not exists idx_statuslog_timestamp on status_log(timestamp);

-- 6. Trigger to automatically update updated_at on complaints
create or replace function update_complaint_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  if new.status in ('RESOLVED_PENDING', 'CLOSED') and old.status not in ('RESOLVED_PENDING', 'CLOSED') then
    new.resolved_at = now();
  elsif new.status in ('OPEN', 'IN_PROGRESS', 'REOPENED') then
    new.resolved_at = null;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_complaint_timestamp on complaints;
create trigger trigger_update_complaint_timestamp
before update on complaints
for each row execute function update_complaint_timestamp();

-- 7. Seed Fixed Categories
insert into categories (name, default_staff_group)
values 
  ('electrical', 'Electrical Maintenance'),
  ('plumbing', 'Plumbing & Water Supply'),
  ('mess', 'Mess & Food Quality Committee'),
  ('cleaning', 'Sanitation & Housekeeping'),
  ('internet', 'IT & Network Support'),
  ('furniture', 'Carpentry & Facilities'),
  ('other', 'General Operations')
on conflict (name) do nothing;
