-- Create email_logs table for tracking sent emails
CREATE TABLE public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unsubscribes table for CAN-SPAM compliance
CREATE TABLE public.unsubscribes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  reason TEXT,
  unsubscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discovery_jobs table for scheduling
CREATE TABLE public.discovery_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  location TEXT NOT NULL,
  categories TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  leads_found INTEGER DEFAULT 0,
  leads_saved INTEGER DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  is_recurring BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_send_limits table
CREATE TABLE public.daily_send_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  daily_limit INTEGER NOT NULL DEFAULT 100,
  sent_today INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_send_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_logs
CREATE POLICY "Users can view their own email logs" ON public.email_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own email logs" ON public.email_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own email logs" ON public.email_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for unsubscribes (public read for compliance checking)
CREATE POLICY "Anyone can check unsubscribe status" ON public.unsubscribes
  FOR SELECT USING (true);
CREATE POLICY "Anyone can unsubscribe" ON public.unsubscribes
  FOR INSERT WITH CHECK (true);

-- RLS Policies for discovery_jobs
CREATE POLICY "Users can view their own jobs" ON public.discovery_jobs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own jobs" ON public.discovery_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jobs" ON public.discovery_jobs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jobs" ON public.discovery_jobs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for daily_send_limits
CREATE POLICY "Users can view their own limits" ON public.daily_send_limits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own limits" ON public.daily_send_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own limits" ON public.daily_send_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Add unique constraint on leads to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS leads_unique_business 
  ON public.leads (user_id, business_name, city, state);

-- Add index for faster email checking
CREATE INDEX IF NOT EXISTS idx_unsubscribes_email ON public.unsubscribes (email);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead ON public.email_logs (lead_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign ON public.email_logs (campaign_id);