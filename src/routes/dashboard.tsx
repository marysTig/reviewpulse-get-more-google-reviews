import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, FREE_REQUEST_LIMIT } from "@/hooks/useAuth";
import { Logo } from "@/components/rp/Logo";
import { logout } from "@/lib/supabase";
import { LogOut, CheckSquare, Square, Users, Send, Activity, BarChart, Briefcase, CreditCard, ChevronLeft, QrCode } from "lucide-react";
import { ImageUpload } from "@/components/rp/ImageUpload";
import {
  STATUS_CLASS,
  STATUS_LABEL,
  buildMessage,
  buildWhatsAppLink,
  formatDate,
  formatPhone,
  initials,
} from "@/lib/reviewpulse";
import { PhoneInput } from "@/components/rp/PhoneInput";
import {
  addCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  addReviewRequest,
  getReviewRequests,
  type Customer,
  type ReviewRequest,
} from "@/lib/supabase-utils";
import { updateBusinessAccount, type BusinessAccount } from "@/lib/supabase";

const TITLE = "Dashboard — FiveRate";
const DESCRIPTION = "Send a WhatsApp review request in seconds and track every request your business has sent.";

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

type AppView = 'home' | 'customers' | 'send' | 'activity' | 'stats' | 'business' | 'plan' | 'qr';

function Dashboard() {
  const navigate = useNavigate();
  const { user, isPaid, businessAccount, loading, monthlyRequestCount } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();
      navigate({ to: "/login" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  }

  const [activeApp, setActiveApp] = useState<AppView>('home');
  const [profile, setProfile] = useState<Partial<BusinessAccount>>({});
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<Set<string>>(new Set());

  const [editing, setEditing] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState("");

  // Require login
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  // Load profile and data
  useEffect(() => {
    if (user && businessAccount) {
      setProfile({
        business_name: businessAccount.business_name || "",
        google_review_url: businessAccount.google_review_url || "",
        city: businessAccount.city || "",
        logo_url: businessAccount.logo_url || "",
      });
      getCustomers(businessAccount.id).then(setCustomers).catch(console.error);
      getReviewRequests(businessAccount.id).then(setRequests).catch(console.error);
    }
  }, [user, businessAccount]);

  const message = buildMessage(firstName, profile as BusinessAccount);
  const hasReachedLimit = !isPaid && monthlyRequestCount >= FREE_REQUEST_LIMIT;
  const canSend = firstName.trim().length > 0 && isPhoneValid && !hasReachedLimit;

  async function handleSaveProfile() {
    if (!businessAccount) return;
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      await updateBusinessAccount(businessAccount.id, profile);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      setProfileError("Failed to save.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleAddCustomer() {
    if (firstName.trim().length === 0 || !isPhoneValid || !businessAccount) return;

    setIsSaving(true);
    try {
      if (editingCustomerId) {
        const updatedCustomer = await updateCustomer(editingCustomerId, firstName, phone);
        setCustomers(customers.map((c) => (c.id === editingCustomerId ? updatedCustomer : c)));
        setEditingCustomerId(null);
      } else {
        const newCustomer = await addCustomer(businessAccount.id, firstName, phone);
        setCustomers([newCustomer, ...customers]);
      }
      setFirstName("");
      setPhone("");
      setShowCustomerForm(false);
    } catch (err) {
      console.error("Failed to save customer", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveCustomer(customerId: string) {
    try {
      await deleteCustomer(customerId);
      setCustomers(customers.filter((c) => c.id !== customerId));
      if (selectedCustomerIds.has(customerId)) {
        const newSet = new Set(selectedCustomerIds);
        newSet.delete(customerId);
        setSelectedCustomerIds(newSet);
      }
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  }

  function handleEditCustomer(customer: Customer) {
    setEditingCustomerId(customer.id);
    setFirstName(customer.first_name);
    setPhone(customer.phone);
    setShowCustomerForm(true);
    setTimeout(() => {
      document.getElementById("customer-form")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function toggleCustomerSelection(id: string) {
    const newSet = new Set(selectedCustomerIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedCustomerIds(newSet);
  }

  function toggleAllSelection() {
    if (selectedCustomerIds.size === customers.length) {
      setSelectedCustomerIds(new Set());
    } else {
      setSelectedCustomerIds(new Set(customers.map(c => c.id)));
    }
  }

  function startSequentialSend() {
    if (customers.length === 0) return;
    const targetIds = selectedCustomerIds.size > 0 
      ? Array.from(selectedCustomerIds) 
      : customers.map(c => c.id);
    const firstIndex = customers.findIndex(c => c.id === targetIds[0]);
    if (firstIndex !== -1 && customers[firstIndex]) {
      sendToCustomer(customers[firstIndex], firstIndex);
      setActiveApp('send');
    }
  }

  async function handleSend() {
    if (!isPaid && monthlyRequestCount >= FREE_REQUEST_LIMIT) {
      navigate({ to: "/upgrade" });
      return;
    }
    if (!canSend || !businessAccount) return;

    setIsSaving(true);
    try {
      const activeCustomerId = selectedCustomerIndex !== null ? customers[selectedCustomerIndex]?.id : undefined;
      const newRequest = await addReviewRequest(businessAccount.id, firstName.trim(), phone.trim(), activeCustomerId);
      setRequests([newRequest, ...requests]);
      window.open(buildWhatsAppLink(phone, customMessage || message), "_blank", "noopener,noreferrer");

      if (selectedCustomerIndex !== null) {
        const targetIds = selectedCustomerIds.size > 0 ? Array.from(selectedCustomerIds) : customers.map(c => c.id);
        const currentActiveId = customers[selectedCustomerIndex]?.id || "";
        const currentTargetIndex = targetIds.indexOf(currentActiveId);
        
        if (currentTargetIndex !== -1 && currentTargetIndex + 1 < targetIds.length) {
          const nextId = targetIds[currentTargetIndex + 1];
          const nextIndex = customers.findIndex(c => c.id === nextId);
          if (nextIndex !== -1) {
            setSelectedCustomerIndex(nextIndex);
            const nextCustomer = customers[nextIndex];
            if (nextCustomer) {
              setFirstName(nextCustomer.first_name);
              setPhone(nextCustomer.phone);
            }
          } else {
            cancelSequentialSend();
          }
        } else {
          cancelSequentialSend();
        }
      } else {
        setFirstName("");
        setPhone("");
      }
    } catch (err) {
      console.error("Failed to send request", err);
    } finally {
      setIsSaving(false);
    }
  }

  function sendToCustomer(customer: Customer, index: number) {
    setSelectedCustomerIndex(index);
    setFirstName(customer.first_name);
    setPhone(customer.phone);
    setCustomMessage(buildMessage(customer.first_name, profile as BusinessAccount));
  }

  function cancelSequentialSend() {
    setSelectedCustomerIndex(null);
    setFirstName("");
    setPhone("");
    setCustomMessage("");
  }

  function getCustomerStatus(customer: Customer) {
    const req = requests.find(r => r.customer_id === customer.id || r.phone === customer.phone);
    return req ? req.status : "not sent";
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-12 h-12 bg-pulse rounded-full mx-auto"></div>
          </div>
          <p className="text-ink-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink">
        <div className="text-center">
          <p className="text-ink-muted">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // APP RENDERERS
  const renderHome = () => {
    const apps = [
      { id: "customers", label: "Customers Manager", icon: Users, color: "text-blue-600", bg: "bg-blue-600/10" },
      { id: "send", label: "Review Campaigns", icon: Send, color: "text-pulse", bg: "bg-pulse/10" },
      { id: "stats", label: "Usage Statistics", icon: BarChart, color: "text-orange-600", bg: "bg-orange-600/10" },
      { id: "business", label: "Business Profile", icon: Briefcase, color: "text-ink", bg: "bg-ink/10" },
      { id: "plan", label: "Billing & Plan", icon: CreditCard, color: "text-rose-600", bg: "bg-rose-600/10" },
      { id: "qr", label: "QR Generator", icon: QrCode, color: "text-teal-600", bg: "bg-teal-600/10" },
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">cPanel Dashboard</h1>
          <p className="mt-2 text-lg text-ink-muted">Manage your reviews, customers, and business settings.</p>
        </div>
        
        {/* Setup Prompt (only on Home) */}
        {!profile.business_name || !profile.google_review_url ? (
          <div className="rounded-xl border border-pulse bg-pulse-soft/20 p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-2xl">🚀</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg">Get started in 3 steps</h3>
                <p className="mt-1 text-sm text-ink-muted">Set up your business profile to start sending review requests.</p>
                <button
                  onClick={() => setActiveApp('business')}
                  className="mt-4 rounded-md bg-pulse px-4 py-2 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
                >
                  Set up profile →
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-line bg-card overflow-hidden rise">
          <div className="bg-paper border-b border-line px-5 py-3">
            <h3 className="font-mono text-xs uppercase tracking-wider font-semibold text-ink-muted">Quick Actions</h3>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {apps.map(app => (
              <button 
                key={app.id} 
                onClick={() => setActiveApp(app.id as AppView)}
                className="group flex flex-col items-center justify-center p-6 rounded-xl hover:bg-paper transition-colors border border-transparent hover:border-line"
              >
                <div className={`grid size-14 place-items-center rounded-2xl ${app.bg} mb-4 group-hover:scale-110 transition-transform`}>
                  <app.icon className={`size-7 ${app.color}`} />
                </div>
                <span className="text-sm font-medium text-center text-ink">{app.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCustomersApp = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Add Client</h2>
          <p className="text-sm text-ink-muted">Add and manage your client database.</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomerId(null);
            setFirstName("");
            setPhone("");
            setShowCustomerForm(true);
          }}
          className="rounded-md bg-pulse px-4 py-2 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 shadow-sm"
        >
          + Add Client
        </button>
      </div>

      {showCustomerForm && (
        <div id="customer-form" className="rounded-xl border border-line bg-card p-6">
          <h3 className="font-display text-lg">{editingCustomerId ? "Edit client" : "Add new client"}</h3>
          <div className="mt-4 space-y-4 sm:max-w-md">
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">First name</span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse"
              />
            </label>
            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">Phone number</span>
              <PhoneInput
                value={phone}
                onChange={(val, valid) => {
                  setPhone(val);
                  setIsPhoneValid(valid);
                }}
                className="mt-1.5"
              />
            </label>
            <div className="flex gap-3">
              <button
                onClick={handleAddCustomer}
                disabled={firstName.trim().length === 0 || !isPhoneValid || isSaving}
                className="rounded-md bg-pulse px-4 py-2.5 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 disabled:opacity-40"
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
                className="rounded-md border border-line bg-paper px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink/30"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {customers.length === 0 && !showCustomerForm ? (
        <div className="rounded-xl border border-dashed border-line p-12 text-center text-ink-muted">
          No clients found. Click "+ Add Client" to get started.
        </div>
      ) : customers.length > 0 ? (
        <div className="rounded-xl border border-line bg-card overflow-hidden">
          <div className="border-b border-line bg-paper px-6 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-ink-muted">All Clients</span>
          </div>
          <div className="divide-y divide-line max-h-[600px] overflow-y-auto">
            {customers.map((customer) => {
              const status = getCustomerStatus(customer);
              return (
                <div key={customer.id} className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-paper/50">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-pulse-soft font-display text-xs text-pulse-ink">
                    {initials(customer.first_name)}
                  </div>
                  <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    <div>
                      <p className="truncate text-sm font-medium">{customer.first_name}</p>
                      <p className="font-mono text-[11px] text-ink-muted">{formatPhone(customer.phone)}</p>
                    </div>
                    <div>
                      <span className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide 
                        ${status === 'sent' ? STATUS_CLASS[status as keyof typeof STATUS_CLASS] : 'bg-line text-ink-muted'}`}
                      >
                        {status === 'not sent' ? 'Not sent' : STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditCustomer(customer)} className="rounded-md px-2 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-line/50 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleRemoveCustomer(customer.id)} className="rounded-md px-2 py-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );

  const renderSendApp = () => {
    // The "active" client is the one the campaign is currently on
    const activeCustomer = selectedCustomerIndex !== null ? customers[selectedCustomerIndex] : null;
    const targetIds = selectedCustomerIds.size > 0 ? Array.from(selectedCustomerIds) : [];
    const activeIndexInQueue = activeCustomer
      ? targetIds.indexOf(activeCustomer.id)
      : -1;

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Review Campaigns</h2>
            <p className="text-sm text-ink-muted">Select clients, then generate and send your review request.</p>
          </div>
          {selectedCustomerIds.size > 0 && selectedCustomerIndex === null && (
            <button
              onClick={startSequentialSend}
              className="shrink-0 rounded-md bg-pulse px-4 py-2.5 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 shadow-sm"
            >
              Start Campaign ({selectedCustomerIds.size}) →
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT: Client list with checkboxes */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0 rounded-xl border border-line bg-card overflow-hidden">
            <div className="border-b border-line bg-paper px-5 py-3 flex items-center justify-between">
              <button onClick={toggleAllSelection} className="text-sm font-medium text-ink-muted hover:text-ink">
                {selectedCustomerIds.size === customers.length && customers.length > 0 ? "Deselect all" : "Select all"}
              </button>
              {selectedCustomerIds.size > 0 && (
                <span className="text-xs font-mono text-pulse-ink bg-pulse-soft px-2 py-1 rounded-md">
                  {selectedCustomerIds.size} selected
                </span>
              )}
            </div>
            <div className="divide-y divide-line max-h-[540px] overflow-y-auto">
              {customers.length === 0 ? (
                <div className="p-8 text-center text-sm text-ink-muted">
                  No clients yet. Add them in <button onClick={() => setActiveApp('customers')} className="text-pulse underline">Add Client</button>.
                </div>
              ) : (
                customers.map((customer, index) => {
                  const isSelected = selectedCustomerIds.has(customer.id);
                  const isActive = selectedCustomerIndex === index;
                  const status = getCustomerStatus(customer);
                  return (
                    <div
                      key={customer.id}
                      onClick={() => {
                        toggleCustomerSelection(customer.id);
                        sendToCustomer(customer, index);
                      }}
                      className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-pulse-soft border-l-2 border-l-pulse'
                          : 'hover:bg-paper/60'
                      }`}
                    >
                      <span className={`shrink-0 transition-colors ${isSelected ? 'text-pulse' : 'text-ink-muted hover:text-pulse'}`}>
                        {isSelected ? <CheckSquare className="size-5" /> : <Square className="size-5" />}
                      </span>
                      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-pulse-soft font-display text-xs text-pulse-ink">
                        {initials(customer.first_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{customer.first_name}</p>
                        <p className="font-mono text-[10px] text-ink-muted">{formatPhone(customer.phone)}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide 
                        ${status === 'sent' ? STATUS_CLASS[status as keyof typeof STATUS_CLASS] : 'bg-line text-ink-muted'}`}
                      >
                        {status === 'not sent' ? 'New' : STATUS_LABEL[status as keyof typeof STATUS_LABEL] || status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Message + Send */}
          <div className="flex-1 min-w-0">
            {!activeCustomer ? (
              <div className="rounded-xl border border-dashed border-line bg-card p-12 text-center text-ink-muted">
                <Send className="size-8 mx-auto mb-3 text-ink-muted/40" />
                <p className="text-sm font-medium text-ink">Select a client to generate a message</p>
                <p className="mt-1 text-xs">Click any client on the left to preview their personalised review request.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-card overflow-hidden">
                {/* Campaign progress bar */}
                {selectedCustomerIds.size > 1 && activeIndexInQueue >= 0 && (
                  <div className="border-b border-line bg-paper px-6 py-3 flex items-center justify-between">
                    <span className="font-mono text-xs text-pulse-ink">
                      Campaign: {activeIndexInQueue + 1} / {selectedCustomerIds.size}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-1.5 rounded-full bg-line overflow-hidden">
                        <div
                          className="h-full rounded-full bg-pulse transition-all"
                          style={{ width: `${((activeIndexInQueue + 1) / selectedCustomerIds.size) * 100}%` }}
                        />
                      </div>
                      <button
                        onClick={cancelSequentialSend}
                        className="text-xs font-semibold text-ink-muted hover:text-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-5">
                  {/* Client info */}
                  <div className="flex items-center gap-3 pb-4 border-b border-line">
                    <div className="grid size-10 shrink-0 place-items-center rounded-full bg-pulse-soft font-display text-sm text-pulse-ink">
                      {initials(activeCustomer.first_name)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{activeCustomer.first_name}</p>
                      <p className="font-mono text-xs text-ink-muted">{formatPhone(activeCustomer.phone)}</p>
                    </div>
                  </div>

                  {/* Editable message */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-xs uppercase tracking-wide text-ink-muted">Message</p>
                      <button
                        onClick={() => setCustomMessage(buildMessage(activeCustomer.first_name, profile as BusinessAccount))}
                        className="text-xs text-ink-muted hover:text-pulse transition-colors"
                      >
                        ↺ Reset to default
                      </button>
                    </div>
                    <textarea
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={8}
                      className="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none transition focus:border-pulse resize-none shadow-inner"
                      placeholder="Type your message here..."
                    />
                    <p className="mt-1.5 text-[11px] text-ink-muted font-mono">
                      {customMessage.length} characters — edit freely, the message will be sent exactly as shown.
                    </p>
                  </div>

                  {/* Send button */}
                  {hasReachedLimit ? (
                    <button
                      onClick={() => navigate({ to: "/upgrade" })}
                      className="w-full rounded-md bg-pulse px-4 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 shadow-sm"
                    >
                      Upgrade to send more requests →
                    </button>
                  ) : (
                    <button
                      onClick={handleSend}
                      disabled={isSaving}
                      className="w-full rounded-md bg-wa-ink px-4 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 disabled:opacity-40 shadow-sm"
                    >
                      {isSaving ? "Sending..." : `Send to ${activeCustomer.first_name} via WhatsApp`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActivityApp = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl">Activity Logs</h2>
        <p className="text-sm text-ink-muted">History of all review requests sent.</p>
      </div>
      <div className="rounded-xl border border-line bg-card overflow-hidden">
        <div className="border-b border-line bg-paper px-6 py-4 flex items-center justify-between">
          <span className="font-mono text-xs text-ink-muted">{requests.length} total requests sent</span>
        </div>
        <div className="divide-y divide-line">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-sm text-ink-muted border-dashed">No requests sent yet.</div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="flex items-center gap-4 px-6 py-3 hover:bg-paper/50 transition-colors">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-pulse-soft font-display text-xs text-pulse-ink">
                  {initials(request.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{request.name}</p>
                  <p className="font-mono text-[11px] text-ink-muted">{formatDate(request.date)}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${STATUS_CLASS[request.status as keyof typeof STATUS_CLASS] || 'bg-line text-ink-muted'}`}>
                  {STATUS_LABEL[request.status as keyof typeof STATUS_LABEL] || request.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderStatsApp = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl">Usage Statistics</h2>
        <p className="text-sm text-ink-muted">Overview of your account metrics.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-line bg-card p-6 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-muted flex items-center gap-2"><Users className="size-4" /> Total Customers</p>
          <p className="mt-4 font-display text-4xl tracking-tight">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-6 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-muted flex items-center gap-2"><Activity className="size-4" /> All-Time Requests</p>
          <p className="mt-4 font-display text-4xl tracking-tight">{requests.length}</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-6 shadow-sm">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-muted flex items-center gap-2"><BarChart className="size-4" /> Requests This Month</p>
          <p className="mt-4 font-display text-4xl tracking-tight text-pulse">
            {isPaid ? "Unlimited" : `${monthlyRequestCount} / ${FREE_REQUEST_LIMIT}`}
          </p>
        </div>
      </div>
    </div>
  );

  const renderBusinessApp = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl">Business Profile</h2>
        <p className="text-sm text-ink-muted">Manage how your business appears to customers.</p>
      </div>
      <div className="rounded-xl border border-line bg-card p-8">
        <div className="space-y-6">
          <ImageUpload
            value={profile.logo_url ?? ""}
            onChange={(url) => setProfile({ ...profile, logo_url: url })}
            label="Business logo"
            folder="fiverate/logos"
          />
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">Business name</span>
            <input
              value={profile.business_name}
              onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-line bg-paper px-4 py-3 text-sm outline-none transition focus:border-pulse"
              placeholder="Acme Cafe"
            />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">Google review URL</span>
            <input
              value={profile.google_review_url}
              onChange={(e) => setProfile({ ...profile, google_review_url: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-line bg-paper px-4 py-3 font-mono text-sm outline-none transition focus:border-pulse"
              placeholder="https://g.page/acme-cafe"
            />
          </label>
          <label className="block">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">City / Location</span>
            <input
              value={profile.city}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
              className="mt-1.5 w-full rounded-md border border-line bg-paper px-4 py-3 text-sm outline-none transition focus:border-pulse"
              placeholder="San Francisco, CA"
            />
          </label>
          {profileError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{profileError}</p>}
          <div className="pt-4 border-t border-line">
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="rounded-md bg-ink px-6 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isSavingProfile ? "Saving..." : "Save Profile Details"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlanApp = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl">Billing & Plan</h2>
        <p className="text-sm text-ink-muted">Manage your FiveRate subscription.</p>
      </div>
      
      <div className={`rounded-xl border p-8 ${isPaid ? "border-pulse/30 bg-pulse-soft/10" : "border-line bg-card"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-mono font-bold tracking-widest ${isPaid ? "bg-pulse text-on-dark" : "bg-line text-ink"}`}>
                {isPaid ? "PRO PLAN" : "FREE PLAN"}
              </span>
            </div>
            <h3 className="font-display text-3xl tracking-tight mb-2">
              {isPaid ? "FiveRate Pro" : "FiveRate Free"}
            </h3>
            <p className="text-ink-muted text-sm">
              {isPaid ? "You have unlimited review requests. Keep growing!" : `You've used ${monthlyRequestCount} out of ${FREE_REQUEST_LIMIT} free requests this month.`}
            </p>
          </div>
          
          {!isPaid && (
            <button
              onClick={() => navigate({ to: "/upgrade" })}
              className="shrink-0 rounded-md bg-pulse px-6 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 shadow-sm"
            >
              Upgrade to Pro →
            </button>
          )}
        </div>

        {!isPaid && (
          <div className="mt-8">
            <div className="flex items-center justify-between text-xs font-mono mb-2">
              <span className="text-ink">Monthly Limit</span>
              <span className="text-ink-muted">{monthlyRequestCount} / {FREE_REQUEST_LIMIT} sent</span>
            </div>
            <div className="h-2 w-full rounded-full bg-line overflow-hidden">
              <div
                className="h-full rounded-full bg-pulse transition-all"
                style={{ width: `${Math.min((monthlyRequestCount / FREE_REQUEST_LIMIT) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-line bg-paper p-6 text-sm text-ink-muted">
        <h4 className="font-semibold text-ink mb-2">Need help?</h4>
        <p>If you have questions about your billing or need to change your subscription payment method, please contact support.</p>
      </div>
    </div>
  );

  const renderQrApp = () => {
    const reviewUrl = profile.google_review_url?.trim();
    const qrUrl = reviewUrl 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(reviewUrl)}` 
      : null;

    return (
      <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 max-w-4xl">
        <div>
          <h2 className="font-display text-2xl">QR Generator</h2>
          <p className="text-sm text-ink-muted">Download a QR code for your physical store.</p>
        </div>
        
        <div className="rounded-xl border border-line bg-card p-8">
          {!reviewUrl ? (
            <div className="text-center py-12">
              <div className="mx-auto size-16 bg-pulse/10 text-pulse rounded-full flex items-center justify-center mb-4">
                <QrCode className="size-8" />
              </div>
              <h3 className="text-lg font-display mb-2">Google Review Link Missing</h3>
              <p className="text-ink-muted text-sm max-w-md mx-auto mb-6">
                You need to set up your Google review link in your Business Profile before generating a QR code.
              </p>
              <button
                onClick={() => setActiveApp('business')}
                className="rounded-md bg-pulse px-4 py-2 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
              >
                Go to Business Profile
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-display mb-3">Your Custom QR Code</h3>
                <p className="text-ink-muted text-sm mb-6">
                  Print this QR code and place it on your counter or tables. When customers scan it with their phone camera, they will be taken directly to your Google Review page.
                </p>
                <div className="bg-paper p-4 rounded-lg border border-line mb-6">
                  <p className="font-mono text-xs text-ink-muted mb-1 uppercase tracking-wide">Destination URL</p>
                  <a href={reviewUrl} target="_blank" rel="noreferrer" className="text-wa-ink hover:underline break-all text-sm">
                    {reviewUrl}
                  </a>
                </div>
                <a 
                  href={qrUrl!} 
                  download="review-qr-code.png"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-pulse px-6 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 shadow-sm"
                >
                  <QrCode className="size-4" /> Download QR Code Image
                </a>
              </div>
              <div className="shrink-0 p-6 bg-white rounded-xl border border-line shadow-sm">
                <img src={qrUrl!} alt="Google Review QR Code" className="w-64 h-64 object-contain" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen border-t-4 border-pulse bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between gap-3 border-b border-line pb-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Logo />
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted px-2 py-1 bg-line/50 rounded">cPanel</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden text-xs font-mono text-ink-muted sm:block">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 rounded-md border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink-muted transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
            >
              <LogOut className="size-3.5" />
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>

        {/* Global Navigation */}
        {activeApp !== 'home' && (
          <div className="mb-8">
            <button 
              onClick={() => setActiveApp('home')} 
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:text-ink hover:bg-line/50 transition-colors"
            >
              <ChevronLeft className="size-4" /> Back to Home
            </button>
          </div>
        )}

        {/* Dynamic App Rendering */}
        {activeApp === 'home' && renderHome()}
        {activeApp === 'customers' && renderCustomersApp()}
        {activeApp === 'send' && renderSendApp()}
        {activeApp === 'activity' && renderActivityApp()}
        {activeApp === 'stats' && renderStatsApp()}
        {activeApp === 'business' && renderBusinessApp()}
        {activeApp === 'plan' && renderPlanApp()}
        {activeApp === 'qr' && renderQrApp()}

      </div>
    </div>
  );
}
