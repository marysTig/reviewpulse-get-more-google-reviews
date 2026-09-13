-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only admins can read the admins table (or read their own row)
CREATE POLICY "Admins can view admins" ON public.admins FOR SELECT USING (auth.uid() = user_id);

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Add admin RLS bypasses
CREATE POLICY "Admins can view all business_accounts" ON public.business_accounts FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all business_accounts" ON public.business_accounts FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all customers" ON public.customers FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all customers" ON public.customers FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all customers" ON public.customers FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can view all review_requests" ON public.review_requests FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions FOR UPDATE USING (public.is_admin());

-- Function to securely get users for admin panel
CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  business_name TEXT,
  is_paid BOOLEAN,
  subscription_status TEXT
) AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT 
    u.id, 
    u.email::TEXT, 
    (u.raw_user_meta_data->>'full_name')::TEXT as full_name,
    u.created_at,
    b.business_name,
    b.is_paid,
    s.status as subscription_status
  FROM auth.users u
  LEFT JOIN public.business_accounts b ON u.id = b.user_id
  LEFT JOIN public.subscriptions s ON b.id = s.account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
