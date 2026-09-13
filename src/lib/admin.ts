import { supabase } from "./supabase";
import type { BusinessAccount } from "./supabase";
import type { Customer, ReviewRequest, Subscription } from "./supabase-utils";

export async function isAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc("is_admin");
    if (error) return false;
    return !!data;
  } catch (err) {
    return false;
  }
}

export async function deleteAdminUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc("admin_delete_user", { target_user_id: userId });
  if (error) throw error;
}

export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  business_name: string;
  is_paid: boolean;
  subscription_status: string | null;
};

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.rpc("admin_get_users");
  if (error) throw error;
  return data || [];
}

export async function getAdminBusinesses(): Promise<BusinessAccount[]> {
  const { data, error } = await supabase
    .from("business_accounts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAdminCustomers(): Promise<(Customer & { business_accounts: { business_name: string } })[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*, business_accounts(business_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAdminRequests(): Promise<(ReviewRequest & { business_accounts: { business_name: string } })[]> {
  const { data, error } = await supabase
    .from("review_requests")
    .select("*, business_accounts(business_name)")
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAdminSubscriptions(): Promise<(Subscription & { business_accounts: { business_name: string } })[]> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, business_accounts(business_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export type AdminQrBusiness = {
  id: string;
  business_name: string;
  google_review_url: string;
  city: string | null;
  logo_url: string | null;
  created_at: string;
};

export async function getAdminQrCodes(): Promise<AdminQrBusiness[]> {
  const { data, error } = await supabase
    .from("business_accounts")
    .select("id, business_name, google_review_url, city, logo_url, created_at")
    .not("google_review_url", "is", null)
    .neq("google_review_url", "")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

