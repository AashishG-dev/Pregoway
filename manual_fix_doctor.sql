-- RUN THIS IN SUPABASE SQL EDITOR TO FIX A SPECIFIC USER

-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with the actual email you signed up with
DO $$
DECLARE
  target_email TEXT := 'hellogmaihu@gmail.com'; -- I saw this in your screenshot
  target_user_id UUID;
BEGIN
  -- 1. Find the User ID from Auth
  SELECT id INTO target_user_id FROM auth.users WHERE email = target_email;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'User not found! Please Sign Up first.';
  ELSE
    -- 2. Insert into Doctors Table (if not exists)
    INSERT INTO public.doctors (id, full_name, specialization, hospital_name, experience_years, is_verified)
    VALUES (
      target_user_id,
      'Doctor ' || target_email, 
      'General Practice', 
      'Hospital', 
      5, 
      true -- Verify them automatically so they can see patients
    )
    ON CONFLICT (id) DO UPDATE 
    SET is_verified = true; -- Fix existing entry if present

    RAISE NOTICE 'Success! User % is now a verified Doctor.', target_email;
  END IF;
END $$;
