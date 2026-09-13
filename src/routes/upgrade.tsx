import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { getUpgradeCheckoutUrl } from "@/lib/lemon-squeezy";
import { Logo } from "@/components/rp/Logo";

import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/upgrade")({
  component: UpgradePage,
});

const PRO_FEATURES = [
  "Unlimited customers",
  "Unlimited WhatsApp review requests",
  "Full request history",
  "Full dashboard analytics",
  "QR code for your business",
  "All core FiveRate features",
  "Priority support",
];

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-pulse flex-shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function UpgradePage() {
  const navigate = useNavigate();
  const { user, businessAccount } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgradeClick = async () => {
    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const checkoutUrl = await getUpgradeCheckoutUrl(user.email || "", businessAccount?.id || "");
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start upgrade");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="border-b border-line bg-paper/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div onClick={() => navigate({ to: "/" })} className="cursor-pointer">
            <Logo />
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="text-ink-muted hover:text-ink transition-colors"
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-16">
        {/* Paywall heading */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pulse-soft rounded-2xl mb-6">
            <span className="text-3xl">⭐</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-ink">
            You're ready for more reviews ⭐
          </h1>
          <p className="mt-4 text-base text-ink-muted max-w-sm mx-auto">
            You've reached your free monthly limit. Upgrade to FiveRate Pro to send unlimited review requests.
          </p>
        </div>

        {/* Pro plan card */}
        <div className="rounded-2xl border-2 border-pulse bg-card shadow-lg overflow-hidden">
          {/* Plan header */}
          <div className="bg-pulse px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-on-dark/70">FiveRate</p>
              <p className="font-display text-xl text-on-dark font-semibold tracking-tight">Pro</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-on-dark">$9.99</span>
                <span className="text-on-dark/70 text-sm">/month</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="px-6 py-6">
            <ul className="space-y-3">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-ink">
                  <CheckIcon />
                  {feature}
                </li>
              ))}
            </ul>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              id="upgrade-to-pro-btn"
              onClick={handleUpgradeClick}
              disabled={isLoading}
              className="mt-6 w-full rounded-lg bg-pulse px-4 py-3.5 text-sm font-semibold text-on-dark shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? "Processing..." : "Upgrade to Pro"}
            </button>

            <p className="text-xs text-ink-muted text-center mt-3">
              Secure payment · Cancel anytime
            </p>
          </div>
        </div>

        {/* What you get on Free */}
        <div className="mt-6 rounded-xl border border-line bg-paper px-6 py-5">
          <p className="text-xs font-mono uppercase tracking-wider text-ink-muted mb-3">
            Your current free plan includes
          </p>
          <ul className="space-y-2 text-sm text-ink-muted">
            {[
              "Business profile & QR code",
              "Up to 10 customers",
              "5 WhatsApp review requests per month",
              "Basic request history",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <span className="size-1.5 rounded-full bg-line flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mt-8 space-y-5">
          <h2 className="font-display text-lg tracking-tight">FAQ</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-ink">Can I cancel anytime?</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Yes — cancel your subscription at any time with no long-term commitment.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">What payment methods are accepted?</h3>
              <p className="mt-1 text-sm text-ink-muted">
                All major credit cards (Visa, Mastercard, Amex) via Lemon Squeezy.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">What happens to my data if I cancel?</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Your account stays active on the Free plan. All your customers and history are preserved.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center text-sm text-ink-muted">
          <p>
            Questions?{" "}
            <a href="mailto:support@fiverate.app" className="text-pulse hover:underline font-medium">
              Contact support
            </a>
          </p>
          <p className="mt-2">
            <Link to="/dashboard" className="text-ink-muted hover:text-ink transition-colors underline underline-offset-2">
              ← Back to dashboard
            </Link>
          </p>
        </div>
      </main>

      {/* Subtle bg decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pulse/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pulse/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
