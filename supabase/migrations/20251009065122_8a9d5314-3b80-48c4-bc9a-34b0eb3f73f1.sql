-- Fix Google OAuth signup issue by updating profiles INSERT policy
-- The issue is that during OAuth signup, the trigger needs to create a profile
-- but the RLS policy was too restrictive

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a more permissive INSERT policy that allows:
-- 1. Users to insert their own profile (auth.uid() = id)
-- 2. System/trigger to insert profiles during signup
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = id 
  OR 
  auth.role() = 'authenticated'
);

-- Ensure the trigger function has the correct permissions
-- by granting INSERT on profiles to the authenticated role
GRANT INSERT ON public.profiles TO authenticated;