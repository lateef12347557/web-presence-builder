-- Add sender email fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sender_email text,
ADD COLUMN IF NOT EXISTS sender_name text,
ADD COLUMN IF NOT EXISTS company_address text;