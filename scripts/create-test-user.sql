-- Create Test User in Supabase
-- Run this in Supabase SQL Editor to create a test account

-- 1. Create auth user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'test@pulseagent.com',
  crypt('password123', gen_salt('bf')), -- Password: password123
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- 2. Get the user ID (run this to see the created user)
SELECT id, email FROM auth.users WHERE email = 'test@pulseagent.com';

-- 3. Create client profile (replace USER_ID_HERE with the ID from step 2)
INSERT INTO clients (
  user_id,
  business_name,
  industry,
  plan,
  plan_status,
  selected_platforms,
  email_preferences
) VALUES (
  'USER_ID_HERE', -- Replace with actual user ID from step 2
  'Test Business',
  'saas',
  'pro',
  'active',
  ARRAY['linkedin', 'facebook', 'instagram'],
  '{"daily_posts": true, "monthly_report": true, "product_updates": true}'::jsonb
);

-- Now you can login with:
-- Email: test@pulseagent.com
-- Password: password123
