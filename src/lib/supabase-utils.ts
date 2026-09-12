import { supabase, BusinessAccount } from "@/lib/supabase";

export type Customer = {
  id: string;
  accountId: string;
  firstName: string;
  phone: string;
  createdAt: string;
};

export type ReviewRequest = {
  id: string;
  accountId: string;
  customerId?: string;
  name: string;
  phone: string;
  date: string;
  status: "sent";
};

export type Subscription = {
  id: string;
  accountId: string;
  lemonsqueezySubscriptionId: string;
  status: "active" | "cancelled" | "expired";
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
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
      accountId,
      firstName,
      phone,
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function loadCustomers(accountId: string): Customer[] {
  // This is a fallback if we need to use localStorage temporarily
  // In production, this would fetch from Supabase
  return [];
}

export async function getCustomers(accountId: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("accountId", accountId)
    .order("createdAt", { ascending: false });

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
    .update({ firstName, phone })
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
      accountId,
      customerId,
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
    .eq("accountId", accountId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data || [];
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
      accountId,
      lemonsqueezySubscriptionId,
      status: "active",
      currentPeriodEnd,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    .eq("accountId", accountId)
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
      updatedAt: new Date().toISOString(),
    })
    .eq("id", subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
