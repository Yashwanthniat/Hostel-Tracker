-- ==============================================================================
-- Migration: seed.sql
-- Description: Sample Data for Demonstration and Verification
-- ==============================================================================

-- Clean test records if re-seeding
-- Note: In production Supabase, users are created via auth.users signup.
-- These seed values correspond to default demo accounts:
-- 1. student: student@hostelfix.edu
-- 2. staff: staff@hostelfix.edu
-- 3. admin: admin@hostelfix.edu

-- Insert sample categories (safe check)
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
