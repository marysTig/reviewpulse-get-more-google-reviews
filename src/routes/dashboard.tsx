import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/rp/Logo";
import {
  EMPTY_PROFILE,
  STATUS_CLASS,
  STATUS_LABEL,
  addCustomer,
  buildMessage,
  buildWhatsAppLink,
  deleteCustomer,
  formatDate,
  initials,
  loadCustomers,
  loadProfile,
  loadRequests,
  saveCustomers,
  saveProfile,
  saveRequests,
  updateCustomer,
  type BusinessProfile,
  type Customer,
  type ReviewRequest,
} from "@/lib/reviewpulse";


const TITLE = "Dashboard — FiveRate";
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
  const navigate = useNavigate();
  const { user, isPaid, loading } = useAuth();
  
  const [profile, setProfile] = useState<BusinessProfile>(EMPTY_PROFILE);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editing, setEditing] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number | null>(null);

  // Require login
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  // Load profile and data
  useEffect(() => {
    if (user) {
      setProfile(loadProfile());
      setRequests(loadRequests());
      setCustomers(loadCustomers());
    }
  }, [user]);

  const message = buildMessage(firstName, profile);
  const canSend = firstName.trim().length > 0 && phone.replace(/\D/g, "").length >= 10;

  function updateProfile(patch: Partial<BusinessProfile>) {
    const next = { ...profile, ...patch };
    setProfile(next);
    saveProfile(next);
  }

  function handleAddCustomer() {
    if (firstName.trim().length === 0 || phone.replace(/\D/g, "").length < 10) return;
    if (editingCustomerId) {
      updateCustomer(editingCustomerId, firstName, phone);
      const updated = customers.map((c) =>
        c.id === editingCustomerId
          ? { ...c, firstName: firstName.trim(), phone: phone.trim() }
          : c
      );
      setCustomers(updated);
      saveCustomers(updated);
      setEditingCustomerId(null);
    } else {
      const customer = addCustomer(firstName, phone);
      setCustomers([customer, ...customers]);
    }
    setFirstName("");
    setPhone("");
  }

  function handleRemoveCustomer(customerId: string) {
    deleteCustomer(customerId);
    setCustomers(customers.filter((c) => c.id !== customerId));
  }

  function handleEditCustomer(customer: Customer) {
    setEditingCustomerId(customer.id);
    setFirstName(customer.firstName);
    setPhone(customer.phone);
    setShowCustomerForm(true);
  }

  function handleSend() {
    // Check if user has paid subscription
    if (!isPaid) {
      navigate({ to: "/upgrade" });
      return;
    }
    
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
    
    // If sending from customer list, prepare for next customer
    if (selectedCustomerIndex !== null) {
      const nextIndex = selectedCustomerIndex + 1;
      if (nextIndex < customers.length) {
        setSelectedCustomerIndex(nextIndex);
        const nextCustomer = customers[nextIndex];
        setFirstName(nextCustomer.firstName);
        setPhone(nextCustomer.phone);
      } else {
        // All customers sent
        setSelectedCustomerIndex(null);
        setFirstName("");
        setPhone("");
      }
    } else {
      setFirstName("");
      setPhone("");
    }
  }

  function sendToCustomer(customer: Customer, index: number) {
    setSelectedCustomerIndex(index);
    setFirstName(customer.firstName);
    setPhone(customer.phone);
    // Scroll to form
    setTimeout(() => {
      const form = document.getElementById("send-form");
      if (form) form.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function cancelSequentialSend() {
    setSelectedCustomerIndex(null);
    setFirstName("");
    setPhone("");
  }

  const sentThisWeek = requests.filter(
    (r) => Date.now() - new Date(r.date).getTime() < 7 * 24 * 60 * 60 * 1000,
  ).length;

  // Show loading state while authenticating
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-12 h-12 bg-pulse rounded-full mx-auto"></div>
          </div>
          <p className="text-ink-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink">
        <div className="text-center">
          <p className="text-ink-muted">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen border-t-4 border-pulse bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-10">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          <Link
            to="/"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            ← Back to home
          </Link>
        </div>

        {/* Free tier warning banner */}
        {!isPaid && (
          <div className="mb-8 rounded-xl bg-yellow-50 border border-yellow-300 p-4">
            <div className="flex items-start gap-4">
              <div className="text-xl mt-0.5">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Free account - Limited features</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  You can view and manage your customer list, but you need to upgrade to send review requests.
                </p>
                <button
                  onClick={() => navigate({ to: "/upgrade" })}
                  className="mt-3 px-4 py-2 bg-pulse hover:bg-pulse/90 text-white font-semibold rounded-lg transition-colors text-sm"
                >
                  Upgrade to Pro →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Good evening 👋</h1>
          <p className="mt-2 text-lg text-ink-muted">Your reputation is growing.</p>
        </div>

        {/* First-time setup prompt */}
        {!profile.name || !profile.reviewUrl ? (
          <div className="mb-8 rounded-xl border border-pulse bg-pulse-soft/20 p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-2xl">🚀</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg">Get started in 3 steps</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Set up your business profile to start sending review requests.
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <p className={`flex items-center gap-2 ${profile.name ? "text-ink" : "text-ink-muted"}`}>
                    <span className={`flex size-5 items-center justify-center rounded-full text-xs font-semibold ${profile.name ? "bg-pulse text-on-dark" : "bg-line text-ink-muted"}`}>
                      {profile.name ? "✓" : "1"}
                    </span>
                    Business name
                  </p>
                  <p className={`flex items-center gap-2 ${profile.reviewUrl ? "text-ink" : "text-ink-muted"}`}>
                    <span className={`flex size-5 items-center justify-center rounded-full text-xs font-semibold ${profile.reviewUrl ? "bg-pulse text-on-dark" : "bg-line text-ink-muted"}`}>
                      {profile.reviewUrl ? "✓" : "2"}
                    </span>
                    Google review link
                  </p>
                  <p className="flex items-center gap-2 text-ink-muted">
                    <span className="flex size-5 items-center justify-center rounded-full bg-line text-xs font-semibold text-ink-muted">
                      3
                    </span>
                    Add customers
                  </p>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 rounded-md bg-pulse px-4 py-2.5 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
                >
                  {profile.name && profile.reviewUrl ? "Add customers →" : "Set up profile →"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rise rounded-xl border border-line bg-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Review requests
            </p>
            <p className="mt-3 font-display text-3xl tracking-tight">{requests.length}</p>
            <p className="mt-1 text-xs text-ink-muted">all time</p>
          </div>

          <div className="rise rounded-xl border border-line bg-card p-5 [animation-delay:80ms]">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Sent this week
            </p>
            <p className="mt-3 font-display text-3xl tracking-tight">{sentThisWeek}</p>
            <p className="mt-1 text-xs text-ink-muted">active</p>
          </div>

          <div className="rise rounded-xl border border-line bg-card p-5 [animation-delay:160ms]">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
              Customers stored
            </p>
            <p className="mt-3 font-display text-3xl tracking-tight">{customers.length}</p>
            <p className="mt-1 text-xs text-ink-muted">ready to send</p>
          </div>
        </div>

        {/* Main action card */}
        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="rise rounded-xl border border-pulse/30 bg-card p-6 shadow-md lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl tracking-tight">Get more reviews</h2>
                <p className="mt-2 text-base text-ink-muted">
                  Send personalized review requests to your customers.
                </p>
              </div>
              <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-pulse-soft font-display text-xl text-pulse-ink">
                ⭐
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setShowCustomerForm(!showCustomerForm)}
                className="rounded-md bg-pulse px-5 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
              >
                + Add customers
              </button>
              {customers.length > 0 && (
                <span className="rounded-md border border-line bg-paper px-5 py-3 text-sm text-ink">
                  {customers.length} customer{customers.length !== 1 ? "s" : ""} ready
                </span>
              )}
            </div>
          </div>

          {/* Business profile card */}
          <div className="rise rounded-xl border border-line bg-card p-6 [animation-delay:80ms]">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-muted">Business</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-pulse-soft font-display text-lg text-pulse-ink">
                {profile.name.trim().charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-base font-medium">
                  {profile.name || "Your business"}
                </p>
                <p className="truncate font-mono text-[11px] text-ink-muted">
                  {profile.city || "Add location"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="mt-4 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
            >
              {editing ? "Done" : "Edit"}
            </button>
          </div>
        </div>

        {/* Add customer form */}
        {showCustomerForm && (
          <div className="mb-8 rounded-xl border border-line bg-card p-6">
            <h3 className="font-display text-lg">
              {editingCustomerId ? "Edit customer" : "Add customer"}
            </h3>
            <div className="mt-4 space-y-4 sm:max-w-md">
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                  First name
                </span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
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
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleAddCustomer();
                    if (!editingCustomerId) setShowCustomerForm(false);
                  }}
                  disabled={firstName.trim().length === 0 || phone.replace(/\D/g, "").length < 10}
                  className="rounded-md bg-pulse px-4 py-2.5 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {editingCustomerId ? "Update" : "Add"}
                </button>
                <button
                  onClick={() => {
                    setShowCustomerForm(false);
                    setFirstName("");
                    setPhone("");
                    setEditingCustomerId(null);
                  }}
                  className="rounded-md border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer list */}
        {customers.length > 0 && (
          <div className="mb-8 rounded-xl border border-line bg-card">
            <div className="border-b border-line px-6 py-4 flex items-center justify-between">
              <h3 className="font-display text-lg">My customers</h3>
              {selectedCustomerIndex === null && (
                <button
                  onClick={() => {
                    if (customers.length > 0) sendToCustomer(customers[0], 0);
                  }}
                  className="rounded-md bg-pulse px-4 py-2 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
                >
                  Send to all →
                </button>
              )}
            </div>
            <div className="divide-y divide-line">
              {customers.map((customer, index) => (
                <div key={customer.id} className="flex items-center gap-3 px-6 py-3">
                  {selectedCustomerIndex === index && (
                    <div className="flex-shrink-0 animate-pulse">
                      <div className="size-2 rounded-full bg-pulse" />
                    </div>
                  )}
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-pulse-soft font-display text-xs text-pulse-ink">
                    {initials(customer.firstName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{customer.firstName}</p>
                    <p className="font-mono text-[11px] text-ink-muted">{customer.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedCustomerIndex !== index ? (
                      <>
                        <button
                          onClick={() => sendToCustomer(customer, index)}
                          className="rounded-md bg-wa-ink/10 px-3 py-1.5 text-xs font-semibold text-wa-ink transition-colors hover:bg-wa-ink/20"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-ink/30"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveCustomer(customer.id)}
                          className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:border-red-400"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={cancelSequentialSend}
                          className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-ink/30"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit profile section */}
        {editing && (
          <div className="mb-8 rounded-xl border border-line bg-card p-6">
            <h3 className="font-display text-lg">Edit business profile</h3>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                  Business name
                </span>
                <input
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                  className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                  placeholder="Acme Cafe"
                />
              </label>
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                  Google review URL
                </span>
                <input
                  value={profile.reviewUrl}
                  onChange={(e) => updateProfile({ reviewUrl: e.target.value })}
                  className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2.5 font-mono text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                  placeholder="https://g.page/acme-cafe"
                />
              </label>
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                  City / Location
                </span>
                <input
                  value={profile.city}
                  onChange={(e) => updateProfile({ city: e.target.value })}
                  className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                  placeholder="San Francisco, CA"
                />
              </label>
              <button
                onClick={() => setEditing(false)}
                className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
              >
                Save changes
              </button>
            </div>
          </div>
        )}

        {/* Send review request form */}
        <div id="send-form" className="mb-8 rounded-xl border border-line bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg">Send review request</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Send a personalized WhatsApp message with your Google review link.
              </p>
              {selectedCustomerIndex !== null && customers.length > 0 && (
                <p className="mt-2 rounded-md bg-pulse-soft px-3 py-2 font-mono text-xs text-pulse-ink">
                  Sending to customer {selectedCustomerIndex + 1} of {customers.length}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="lg:col-span-1">
              <div className="space-y-3">
                <label className="block">
                  <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                    Customer first name
                  </span>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
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
                <div className="flex gap-3">
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className="flex-1 rounded-md bg-wa-ink px-4 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    Send WhatsApp request
                  </button>
                  {selectedCustomerIndex !== null && (
                    <button
                      onClick={cancelSequentialSend}
                      className="rounded-md border border-line bg-paper px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                Message preview
              </p>
              <div className="mt-2 rounded-lg border border-line bg-paper p-4 text-[13px] leading-snug text-ink-muted whitespace-pre-wrap">
                <p className="font-medium text-ink">
                  Hi {firstName.trim() || "John"}! 👋
                </p>
                <p className="mt-1">
                  Thanks for visiting <span className="font-medium text-ink">{profile.name || "our business"}</span> today.
                </p>
                <p className="mt-1">
                  If you enjoyed your experience, we'd really appreciate an honest Google review ⭐
                </p>
                {profile.reviewUrl && (
                  <p className="mt-1 break-all font-mono text-[11px] text-wa-ink">
                    {profile.reviewUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Request history */}
        {requests.length > 0 && (
          <div id="request-history" className="rounded-xl border border-line bg-card">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h3 className="font-display text-lg">Request history</h3>
              <span className="font-mono text-xs text-ink-muted">{requests.length} total</span>
            </div>
            <div className="divide-y divide-line">
              {requests.map((request, i) => (
                <div key={request.id} className="flex items-center gap-3 px-6 py-3">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
