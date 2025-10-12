-- Add missing email column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS email text;