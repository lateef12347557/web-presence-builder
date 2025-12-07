-- Add lead temperature/tier field and enhanced scoring fields
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_tier TEXT DEFAULT 'cold' CHECK (lead_tier IN ('hot', 'warm', 'cold'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS has_ssl BOOLEAN DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_mobile_friendly BOOLEAN DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS website_speed_score INTEGER DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1) DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS has_social_presence BOOLEAN DEFAULT NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create email sequences table for follow-up automation
CREATE TABLE public.email_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  sequence_step INTEGER NOT NULL DEFAULT 1,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'skipped', 'cancelled')),
  template_type TEXT NOT NULL CHECK (template_type IN ('first_contact', 'followup_1', 'followup_2', 'final_close')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email_sequences
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_sequences
CREATE POLICY "Users can view their own sequences" ON public.email_sequences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sequences" ON public.email_sequences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sequences" ON public.email_sequences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sequences" ON public.email_sequences
  FOR DELETE USING (auth.uid() = user_id);

-- Add index for finding pending sequences
CREATE INDEX idx_email_sequences_scheduled ON public.email_sequences(scheduled_at, status) WHERE status = 'pending';

-- Create a function to calculate lead score based on multiple factors
CREATE OR REPLACE FUNCTION public.calculate_lead_score(
  p_website_status website_status,
  p_has_email BOOLEAN,
  p_has_phone BOOLEAN,
  p_has_ssl BOOLEAN,
  p_is_mobile_friendly BOOLEAN,
  p_website_speed_score INTEGER,
  p_google_rating DECIMAL,
  p_review_count INTEGER,
  p_has_social_presence BOOLEAN
)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- No website = highest priority (+40)
  IF p_website_status = 'none' THEN
    score := score + 40;
  ELSIF p_website_status = 'broken' THEN
    score := score + 30;
  ELSIF p_website_status = 'outdated' THEN
    score := score + 20;
  END IF;

  -- Has email = can contact (+15)
  IF p_has_email THEN
    score := score + 15;
  END IF;

  -- Has phone = alternative contact (+5)
  IF p_has_phone THEN
    score := score + 5;
  END IF;

  -- No SSL = security issue (+10)
  IF p_has_ssl = FALSE THEN
    score := score + 10;
  END IF;

  -- Not mobile friendly (+10)
  IF p_is_mobile_friendly = FALSE THEN
    score := score + 10;
  END IF;

  -- Poor website speed (+10)
  IF p_website_speed_score IS NOT NULL AND p_website_speed_score < 50 THEN
    score := score + 10;
  END IF;

  -- Low Google rating (business needs help) (+5)
  IF p_google_rating IS NOT NULL AND p_google_rating < 3.5 THEN
    score := score + 5;
  END IF;

  -- Fewer reviews = less established online (+5)
  IF p_review_count IS NOT NULL AND p_review_count < 10 THEN
    score := score + 5;
  END IF;

  -- No social presence (+5)
  IF p_has_social_presence = FALSE THEN
    score := score + 5;
  END IF;

  RETURN LEAST(score, 100);
END;
$$;

-- Create a function to determine lead tier
CREATE OR REPLACE FUNCTION public.determine_lead_tier(p_score INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF p_score >= 70 THEN
    RETURN 'hot';
  ELSIF p_score >= 40 THEN
    RETURN 'warm';
  ELSE
    RETURN 'cold';
  END IF;
END;
$$;