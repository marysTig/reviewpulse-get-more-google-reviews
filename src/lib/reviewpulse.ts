export type RequestStatus = "sent";

export type Customer = {
  id: string;
  firstName: string;
  phone: string;
  createdAt: string; // ISO date
};

export type ReviewRequest = {
  id: string;
  name: string;
  phone: string;
  customerId?: string; // Link to customer
  date: string; // ISO date
  status: RequestStatus;
};

export type BusinessProfile = {
  name: string;
  reviewUrl: string;
  city: string;
};

export const EMPTY_PROFILE: BusinessProfile = {
  name: "",
  reviewUrl: "",
  city: "",
};


export const STATUS_LABEL: Record<RequestStatus, string> = {
  sent: "Sent",
};

export const STATUS_CLASS: Record<RequestStatus, string> = {
  sent: "bg-pulse-soft text-pulse-ink",
};

export function buildMessage(firstName: string, profile: BusinessProfile) {
  const name = firstName.trim() || "there";
  const businessName = profile.name || "our business";
  return `Hi ${name}! 👋\n\nThanks for visiting ${businessName} today.\n\nIf you enjoyed your experience, we'd really appreciate an honest Google review ⭐\n\n${profile.reviewUrl}`;
}

/** Digits only; assumes a US number when no country code is present. */
export function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

export function buildWhatsAppLink(phone: string, message: string) {
  const to = normalizePhone(phone);
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const PROFILE_KEY = "reviewpulse.profile";
const REQUESTS_KEY = "reviewpulse.requests";
const CUSTOMERS_KEY = "reviewpulse.customers";

export function loadProfile(): BusinessProfile {
  if (typeof window === "undefined") return EMPTY_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? { ...EMPTY_PROFILE, ...JSON.parse(raw) } : EMPTY_PROFILE;
  } catch {
    return EMPTY_PROFILE;
  }
}

export function saveProfile(profile: BusinessProfile) {
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* storage unavailable */
  }
}

export function loadRequests(): ReviewRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    return raw ? (JSON.parse(raw) as ReviewRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveRequests(requests: ReviewRequest[]) {
  try {
    window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch {
    /* storage unavailable */
  }
}

export function loadCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOMERS_KEY);
    return raw ? (JSON.parse(raw) as Customer[]) : [];
  } catch {
    return [];
  }
}

export function saveCustomers(customers: Customer[]) {
  try {
    window.localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  } catch {
    /* storage unavailable */
  }
}

export function addCustomer(firstName: string, phone: string): Customer {
  const customer: Customer = {
    id: `${Date.now()}`,
    firstName: firstName.trim(),
    phone: phone.trim(),
    createdAt: new Date().toISOString(),
  };
  const customers = loadCustomers();
  saveCustomers([customer, ...customers]);
  return customer;
}

export function deleteCustomer(customerId: string) {
  const customers = loadCustomers();
  saveCustomers(customers.filter((c) => c.id !== customerId));
}

export function updateCustomer(customerId: string, firstName: string, phone: string) {
  const customers = loadCustomers();
  const updated = customers.map((c) =>
    c.id === customerId
      ? { ...c, firstName: firstName.trim(), phone: phone.trim() }
      : c
  );
  saveCustomers(updated);
}
