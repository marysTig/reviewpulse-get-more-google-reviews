import { supabase } from "@/lib/supabase";

export type Customer = {
  id: string;
  account_id: string;
  first_name: string;
  phone: string;
  created_at: string;
};

export type ReviewRequest = {
  id: string;
  account_id: string;
  customer_id?: string;
  name: string;
  phone: string;
  date: string;
  status: "sent";
};

export type Subscription = {
  id: string;
  account_id: string;
  lemonsqueezy_subscription_id: string;
  status: "active" | "cancelled" | "expired";
  current_period_end: string;
  created_at: string;
  updated_at: string;
};

// Customers
export async function addCustomer(
  accountId: string,
  firstName: string,
  phone: string
): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .insert({
      account_id: accountId,
      first_name: firstName,
      phone,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCustomers(accountId: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateCustomer(
  customerId: string,
  firstName: string,
  phone: string
): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .update({ first_name: firstName, phone })
    .eq("id", customerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(customerId: string): Promise<void> {
  const { error } = await supabase.from("customers").delete().eq("id", customerId);

  if (error) throw error;
}

// Review Requests
export async function addReviewRequest(
  accountId: string,
  name: string,
  phone: string,
  customerId?: string
): Promise<ReviewRequest> {
  const { data, error } = await supabase
    .from("review_requests")
    .insert({
      account_id: accountId,
      customer_id: customerId,
      name,
      phone,
      date: new Date().toISOString(),
      status: "sent",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReviewRequests(accountId: string): Promise<ReviewRequest[]> {
  const { data, error } = await supabase
    .from("review_requests")
    .select("*")
    .eq("account_id", accountId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Count review requests sent in the current calendar month (UTC). */
export async function getMonthlyRequestCount(accountId: string): Promise<number> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { count, error } = await supabase
    .from("review_requests")
    .select("id", { count: "exact", head: true })
    .eq("account_id", accountId)
    .gte("date", monthStart);

  if (error) throw error;
  return count ?? 0;
}

// Subscriptions
export async function createSubscription(
  accountId: string,
  lemonsqueezySubscriptionId: string,
  currentPeriodEnd: string
): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      account_id: accountId,
      lemonsqueezy_subscription_id: lemonsqueezySubscriptionId,
      status: "active",
      current_period_end: currentPeriodEnd,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSubscription(accountId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("account_id", accountId)
    .eq("status", "active")
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: "active" | "cancelled" | "expired"
): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .update({
      status,
    })
    .eq("id", subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
