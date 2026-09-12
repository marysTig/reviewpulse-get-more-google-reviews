import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type BusinessAccount = {
  id: string;
  userId: string;
  businessName: string;
  googleReviewUrl: string;
  location: string;
  isPaid: boolean;
  stripeCustomerId?: string;
  lemonsqueezyCustomerId?: string;
  createdAt: string;
  updatedAt: string;
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
  businessName: string
): Promise<BusinessAccount> {
  const { data, error } = await supabase
    .from("business_accounts")
    .insert({
      userId,
      businessName,
      googleReviewUrl: "",
      location: "",
      isPaid: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    .eq("userId", userId)
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
      updatedAt: new Date().toISOString(),
    })
    .eq("id", accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
