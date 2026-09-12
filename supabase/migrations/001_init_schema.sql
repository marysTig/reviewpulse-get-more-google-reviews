-- FiveRate Supabase Database Schema
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Business Accounts Table
-- Extended auth.users with business information
CREATE TABLE IF NOT EXISTS public.business_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  google_review_url TEXT,
  location TEXT,
  city TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  lemonsqueezy_customer_id TEXT,
  lemonsqueezy_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Customers Table
-- Customers associated with a business account
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Review Requests Table
-- Track all review requests sent
CREATE TABLE IF NOT EXISTS public.review_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'clicked', 'reviewed')),
  date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Subscriptions Table
-- Track active subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL UNIQUE REFERENCES public.business_accounts(id) ON DELETE CASCADE,
  lemonsqueezy_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_customers_account_id ON public.customers(account_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_account_id ON public.review_requests(account_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_customer_id ON public.review_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_date ON public.review_requests(date DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_account_id ON public.subscriptions(account_id);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE public.business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Business Accounts: Users can only read/write their own
CREATE POLICY "Users can view their own business account"
  ON public.business_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business account"
  ON public.business_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business account"
  ON public.business_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Customers: Users can only access customers from their business account
CREATE POLICY "Users can view their customers"
  ON public.customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = customers.account_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create customers"
  ON public.customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their customers"
  ON public.customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their customers"
  ON public.customers FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  );

-- Review Requests: Users can only access requests from their business account
CREATE POLICY "Users can view their requests"
  ON public.review_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = review_requests.account_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create requests"
  ON public.review_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their requests"
  ON public.review_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  );

-- Subscriptions: Users can only access their subscription
CREATE POLICY "Users can view their subscription"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = subscriptions.account_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their subscription"
  ON public.subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_accounts
      WHERE id = account_id
      AND user_id = auth.uid()
    )
  );

-- Update function for timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_business_accounts_updated_at
  BEFORE UPDATE ON public.business_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_requests_updated_at
  BEFORE UPDATE ON public.review_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
