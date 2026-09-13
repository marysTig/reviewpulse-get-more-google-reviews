import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env['VITE_SUPABASE_URL'] as string) || "";
const supabaseAnonKey = (import.meta.env['VITE_SUPABASE_ANON_KEY'] as string) || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type BusinessAccount = {
  id: string;
  user_id: string;
  business_name: string;
  phone?: string;
  google_review_url: string;
  google_maps_url?: string;
  instagram_url?: string;
  location: string;
  city?: string;
  logo_url?: string;
  is_paid: boolean;
  lemonsqueezy_customer_id?: string;
  lemonsqueezy_subscription_id?: string;
  created_at: string;
  updated_at: string;
};

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  businessName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        business_name: businessName,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  return user;
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;
  return session;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

export async function createBusinessAccount(
  userId: string,
  businessName: string,
  phone: string
): Promise<BusinessAccount> {
  const { data, error } = await supabase
    .from("business_accounts")
    .insert({
      user_id: userId,
      business_name: businessName,
      phone,
      google_review_url: "",
      location: "",
      is_paid: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBusinessAccount(userId: string) {
  const { data, error } = await supabase
    .from("business_accounts")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

export async function updateBusinessAccount(
  accountId: string,
  updates: Partial<BusinessAccount>
) {
  const { data, error } = await supabase
    .from("business_accounts")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
