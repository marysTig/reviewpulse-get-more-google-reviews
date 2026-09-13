import { BusinessAccount } from "./supabase";

export type RequestStatus = "sent";

export const STATUS_LABEL: Record<RequestStatus, string> = {
  sent: "Sent",
};

export const STATUS_CLASS: Record<RequestStatus, string> = {
  sent: "bg-pulse-soft text-pulse-ink",
};

export function buildMessage(firstName: string, account: BusinessAccount) {
  const name = firstName.trim() || "there";
  const businessName = account.business_name || "our business";
  return `Hi ${name}! 👋\n\nThanks for visiting ${businessName} today.\n\nIf you enjoyed your experience, we'd really appreciate an honest Google review ⭐\n\n${account.google_review_url}`;
}

import { parsePhoneNumber } from "libphonenumber-js";

export function formatPhone(e164Number: string) {
  try {
    const parsed = parsePhoneNumber(e164Number);
    if (parsed) return parsed.formatInternational();
  } catch {
    // Fallback if not valid E.164
  }
  return e164Number;
}

export function buildWhatsAppLink(phoneE164: string, message: string) {
  // WhatsApp wa.me links require the number without the leading '+'
  const to = phoneE164.replace("+", "");
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
