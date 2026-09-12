import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { getUpgradeCheckoutUrl } from "@/lib/lemon-squeezy";
import { Logo } from "@/components/rp/Logo";

export const Route = {
  component: UpgradePage,
};

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
    <div className="min-h-screen bg-gradient-to-br from-pulse via-paper to-paper">
      {/* Header */}
      <header className="border-b border-line bg-paper/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div onClick={() => navigate({ to: "/" })} className="flex items-center gap-2 cursor-pointer">
            <Logo size="sm" />
            <span className="text-lg font-bold text-ink">FiveRate</span>
          </div>
          <nav className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/dashboard" })}
              className="text-ink hover:text-pulse transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate({ to: "/account" })}
              className="text-ink hover:text-pulse transition-colors"
            >
              Account
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-paper border border-line rounded-2xl p-8 sm:p-12 shadow-lg">
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-pulse/10 rounded-full flex items-center justify-center">
              <span className="text-4xl">⭐</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-ink text-center mb-4">
            Start Getting More Reviews
          </h1>

          <p className="text-lg text-ink-muted text-center mb-8">
            Your account is free and limited to viewing your customer list. Upgrade to start sending
            review requests and grow your reputation.
          </p>

          {/* Pricing Card */}
          <div className="bg-gradient-to-br from-pulse/5 to-pulse/10 border border-pulse/30 rounded-xl p-8 mb-8">
            <div className="mb-6">
              <p className="text-sm text-ink-muted uppercase tracking-wide mb-2">Basic Plan</p>
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-ink">$10</span>
                <span className="text-xl text-ink-muted ml-2">/month</span>
              </div>
              <p className="text-sm text-ink-muted">per location</p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Send unlimited review requests",
                "Track sent requests & responses",
                "Manage unlimited customer list",
                "Built-in WhatsApp integration",
                "Mobile-friendly sending workflow",
                "Email support",
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-ink">
                  <svg
                    className="w-5 h-5 text-pulse flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleUpgradeClick}
              disabled={isLoading}
              className="w-full bg-pulse hover:bg-pulse/90 disabled:bg-pulse/50 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isLoading ? "Processing..." : "Upgrade & Start Sending →"}
            </button>

            <p className="text-xs text-ink-muted text-center mt-4">
              Secure payment powered by Lemon Squeezy. Cancel subscription anytime.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="bg-paper border border-line rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-ink mb-1">Can I try it free first?</h3>
                <p className="text-sm text-ink-muted">
                  The free account lets you set up your business profile and customer list. You only pay when you're
                  ready to start sending requests.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-ink mb-1">What if I have multiple locations?</h3>
                <p className="text-sm text-ink-muted">
                  Each location needs its own subscription at $10/month. This lets you track reviews separately for
                  each place.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-ink mb-1">Can I cancel anytime?</h3>
                <p className="text-sm text-ink-muted">
                  Yes, you can cancel your subscription at any time. No long-term commitment required.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-ink mb-1">What payment methods do you accept?</h3>
                <p className="text-sm text-ink-muted">
                  We accept all major credit cards (Visa, Mastercard, Amex) through our payment partner Lemon
                  Squeezy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-12">
          <p className="text-ink-muted mb-4">Have questions?</p>
          <a href="mailto:support@fiverate.app" className="text-pulse hover:text-pulse/80 font-medium">
            Contact our support team
          </a>
        </div>
      </main>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pulse/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pulse/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}
