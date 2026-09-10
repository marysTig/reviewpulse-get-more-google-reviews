import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Logo } from "@/components/rp/Logo";
import {
  DEMO_PROFILE,
  DEMO_REQUESTS,
  STATUS_CLASS,
  STATUS_LABEL,
  buildMessage,
  buildWhatsAppLink,
  formatDate,
  initials,
  loadProfile,
  loadRequests,
  saveProfile,
  saveRequests,
  type BusinessProfile,
  type ReviewRequest,
} from "@/lib/reviewpulse";

const TITLE = "Dashboard — ReviewPulse";
const DESCRIPTION =
  "Send a WhatsApp review request in seconds and track every request your business has sent.";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [profile, setProfile] = useState<BusinessProfile>(DEMO_PROFILE);
  const [requests, setRequests] = useState<ReviewRequest[]>(DEMO_REQUESTS);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("Dana");
  const [phone, setPhone] = useState("+1 (415) 808-2231");

  useEffect(() => {
    setProfile(loadProfile());
    setRequests(loadRequests());
  }, []);

  const message = buildMessage(firstName, profile);
  const canSend = firstName.trim().length > 0 && phone.replace(/\D/g, "").length >= 10;

  function updateProfile(patch: Partial<BusinessProfile>) {
    const next = { ...profile, ...patch };
    setProfile(next);
    saveProfile(next);
  }

  function handleSend() {
    if (!canSend) return;
    const entry: ReviewRequest = {
      id: `${Date.now()}`,
      name: firstName.trim(),
      phone: phone.trim(),
      date: new Date().toISOString(),
      status: "sent",
    };
    const next = [entry, ...requests];
    setRequests(next);
    saveRequests(next);
    window.open(buildWhatsAppLink(phone, message), "_blank", "noopener,noreferrer");
    setFirstName("");
    setPhone("");
  }

  const sentThisWeek = requests.filter(
    (r) => Date.now() - new Date(r.date).getTime() < 7 * 24 * 60 * 60 * 1000,
  ).length;
  const reviewed = requests.filter((r) => r.status === "reviewed").length;

  return (
    <div className="min-h-screen border-t-4 border-pulse bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link to="/">
              <Logo />
            </Link>
            <span className="hidden rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ink-muted sm:inline">
              Workspace
            </span>
          </div>
          <div className="grid size-9 place-items-center rounded-full bg-pulse-soft font-display text-sm text-pulse-ink">
            PR
          </div>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            {/* Business profile */}
            <div className="rise rounded-xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-pulse-soft font-display text-lg text-pulse-ink">
                    {profile.name.trim().charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate font-display text-xl tracking-tight">
                      {profile.name || "Your business"}
                    </h1>
                    <p className="truncate font-mono text-xs text-ink-muted">
                      {profile.reviewUrl || "Add your Google review link"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-pulse-soft px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-pulse-ink">
                  Active
                </span>
              </div>

              {editing ? (
                <div className="mt-4 space-y-3 border-t border-line pt-4">
                  <label className="block">
                    <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                      Business name
                    </span>
                    <input
                      value={profile.name}
                      onChange={(e) => updateProfile({ name: e.target.value })}
                      className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                      Google review URL
                    </span>
                    <input
                      value={profile.reviewUrl}
                      onChange={(e) => updateProfile({ reviewUrl: e.target.value })}
                      className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 font-mono text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                    />
                  </label>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-md border border-line bg-paper px-3.5 py-2 text-sm font-semibold transition-colors hover:border-ink/30"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-line pt-3 font-mono text-xs text-ink-muted">
                  <span>{profile.city}</span>
                  <span>Requests this week: {sentThisWeek}</span>
                  <span>Reviewed: {reviewed}</span>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-pulse-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-pulse"
                  >
                    Edit profile
                  </button>
                </div>
              )}
            </div>

            {/* Send review request */}
            <div className="rise rounded-xl border border-line bg-card p-5 [animation-delay:120ms]">
              <h2 className="font-display text-lg">Send Review Request</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Opens WhatsApp with the message ready to send.
              </p>
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                    Customer first name
                  </span>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Dana"
                    className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                  />
                </label>
                <label className="block">
                  <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                    Phone number
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (415) 555-0134"
                    className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 font-mono text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                  />
                </label>
                <div className="rounded-lg border border-line bg-paper p-3 text-[13px] leading-snug text-ink-muted">
                  Hi <span className="font-medium text-ink">{firstName.trim() || "there"}</span>!
                  Thanks for visiting{" "}
                  <span className="font-medium text-ink">{profile.name || "your business"}</span>{" "}
                  today. If you enjoyed your visit, would you mind leaving us an honest Google
                  review? <span className="break-all font-mono text-wa-ink">{profile.reviewUrl}</span>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-wa-ink px-4 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <span className="grid size-5 place-items-center rounded-full bg-wa text-[11px] font-bold text-wa-ink">
                    W
                  </span>
                  Send WhatsApp Request
                </button>
              </div>
            </div>
          </div>

          {/* Request history */}
          <div className="lg:col-span-5">
            <div className="rise rounded-xl border border-line bg-card [animation-delay:200ms]">
              <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <h2 className="font-display text-lg">Request history</h2>
                <span className="font-mono text-xs text-ink-muted">{requests.length} total</span>
              </div>
              <div className="divide-y divide-line">
                {requests.map((request, i) => (
                  <div key={request.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-pulse-soft font-display text-xs text-pulse-ink">
                      {initials(request.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{request.name}</p>
                      <p className="font-mono text-[11px] text-ink-muted">
                        {formatDate(request.date)}
                      </p>
                    </div>
                    <span
                      className={`pop shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide ${STATUS_CLASS[request.status]}`}
                      style={{ animationDelay: `${300 + i * 80}ms` }}
                    >
                      {STATUS_LABEL[request.status]}
                    </span>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-ink-muted">
                    No requests yet. Send your first one above.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
