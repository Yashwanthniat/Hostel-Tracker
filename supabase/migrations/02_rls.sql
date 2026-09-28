-- ==============================================================================
-- Migration: 02_rls.sql
-- Description: Row Level Security (RLS) Policies for Hostel Fix
-- ==============================================================================

-- Enable RLS on all sensitive tables
alter table complaints enable row level security;
alter table status_log enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;

-- ------------------------------------------------------------------------------
-- 1. Profiles Policies
-- ------------------------------------------------------------------------------
create policy "profiles_read_all_authenticated" on profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own_or_admin" on profiles
  for update using (
    auth.uid() = id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ------------------------------------------------------------------------------
-- 2. Categories Policies (read-only for authenticated users)
-- ------------------------------------------------------------------------------
create policy "categories_read_all" on categories
  for select using (auth.role() = 'authenticated');

-- ------------------------------------------------------------------------------
-- 3. Complaints Policies
-- ------------------------------------------------------------------------------
-- Students see their own complaints, or public view if authenticated; staff/admin see all
create policy "students_view_own" on complaints
  for select using (
    auth.uid() = student_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('staff', 'admin'))
  );

-- Student insert policy (must match authenticated user)
create policy "students_insert_own" on complaints
  for insert with check (auth.uid() = student_id);

-- Staff and Admin can update status, assign staff, etc.
create policy "staff_admin_update" on complaints
  for update using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('staff', 'admin'))
  );

-- Students can also update their own complaint strictly when disputing (REOPENED) or confirming (CLOSED) from RESOLVED_PENDING
create policy "student_confirm_or_dispute" on complaints
  for update using (
    auth.uid() = student_id 
    and status in ('RESOLVED_PENDING')
  );

-- ------------------------------------------------------------------------------
-- 4. Status Log Policies
-- ------------------------------------------------------------------------------
-- Status log read: staff/admin see all, students see history of their own complaints
create policy "status_log_read" on status_log
  for select using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('staff', 'admin'))
    or exists (select 1 from complaints c where c.id = complaint_id and c.student_id = auth.uid())
  );

-- Insert into status log allowed for authenticated users making valid transitions
create policy "status_log_insert" on status_log
  for insert with check (
    auth.uid() = changed_by
  );
