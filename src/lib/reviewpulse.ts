export type RequestStatus = "sent" | "clicked" | "reviewed";

export type ReviewRequest = {
  id: string;
  name: string;
  phone: string;
  date: string; // ISO date
  status: RequestStatus;
};

export type BusinessProfile = {
  name: string;
  reviewUrl: string;
  city: string;
};

export const DEMO_PROFILE: BusinessProfile = {
  name: "Marigold Floral",
  reviewUrl: "https://maps.app.goo.gl/rev-marigold-floral",
  city: "Portland, OR",
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const DEMO_REQUESTS: ReviewRequest[] = [
  { id: "r1", name: "Dana Torres", phone: "+1 (415) 808-2231", date: daysAgo(0), status: "reviewed" },
  { id: "r2", name: "Marcus Chen", phone: "+1 (503) 555-0182", date: daysAgo(0), status: "clicked" },
  { id: "r3", name: "Aisha Lewis", phone: "+1 (503) 555-0144", date: daysAgo(1), status: "sent" },
  { id: "r4", name: "Jordan Blake", phone: "+1 (971) 555-0117", date: daysAgo(1), status: "clicked" },
  { id: "r5", name: "Sofia Reyes", phone: "+1 (503) 555-0163", date: daysAgo(2), status: "reviewed" },
];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  sent: "Sent",
  clicked: "Clicked",
  reviewed: "Reviewed",
};

export const STATUS_CLASS: Record<RequestStatus, string> = {
  sent: "bg-ink/5 text-ink-muted",
  clicked: "bg-warn-soft text-warn-ink",
  reviewed: "bg-pulse-soft text-pulse-ink",
};

export function buildMessage(firstName: string, profile: BusinessProfile) {
  const name = firstName.trim() || "there";
  return `Hi ${name}! Thanks for visiting ${profile.name} today. If you enjoyed your visit, would you mind leaving us an honest Google review? ${profile.reviewUrl}`;
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

export function loadProfile(): BusinessProfile {
  if (typeof window === "undefined") return DEMO_PROFILE;
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEMO_PROFILE, ...JSON.parse(raw) } : DEMO_PROFILE;
  } catch {
    return DEMO_PROFILE;
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
  if (typeof window === "undefined") return DEMO_REQUESTS;
  try {
    const raw = window.localStorage.getItem(REQUESTS_KEY);
    return raw ? (JSON.parse(raw) as ReviewRequest[]) : DEMO_REQUESTS;
  } catch {
    return DEMO_REQUESTS;
  }
}

export function saveRequests(requests: ReviewRequest[]) {
  try {
    window.localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  } catch {
    /* storage unavailable */
  }
}
