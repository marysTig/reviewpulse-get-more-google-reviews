import { createFileRoute, Link } from "@tanstack/react-router";

import { Logo } from "@/components/rp/Logo";

const TITLE = "FiveRate — Get More 5-Star Google Reviews";
const DESCRIPTION =
  "FiveRate makes it easy to turn happy customers into more Google reviews. Send personalized review requests via WhatsApp and watch your reputation grow. Free to start.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    n: "01",
    title: "Add customers",
    body: "Add one customer or a whole list. FiveRate stores them for you.",
  },
  {
    n: "02",
    title: "Send via WhatsApp",
    body: "Personalized review messages are ready to send. No WhatsApp API needed.",
  },
  {
    n: "03",
    title: "Grow your reputation",
    body: "More review requests create more opportunities for genuine 5-star reviews.",
  },
];

const FREE_FEATURES = [
  "Business profile & QR code",
  "Up to 10 customers",
  "5 WhatsApp requests / month",
  "Basic dashboard & history",
];

const PRO_FEATURES = [
  "Unlimited customers",
  "Unlimited WhatsApp requests",
  "Full dashboard analytics",
  "Full request history",
  "Priority support",
  "All core FiveRate features",
];

function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink selection:bg-pulse/15">
      <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-ink-muted md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#pricing" className="transition-colors hover:text-ink">
              Pricing
            </a>
            <Link to="/dashboard" className="transition-colors hover:text-ink">
              Sign in
            </Link>
          </nav>
          <Link
            to="/dashboard"
            className="shrink-0 rounded-md bg-ink px-3.5 py-2 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
          >
            <span className="hidden sm:inline">Get More Reviews</span>
            <span className="sm:hidden">Get Reviews</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        <section className="grid items-center gap-8 py-12 md:grid-cols-12 md:py-16">
          <div className="rise md:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-pulse">
              Start growing your reputation
            </p>
            <h1 className="mt-4 max-w-[16ch] text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Get more 5-star reviews.
            </h1>
            <p className="mt-5 max-w-[46ch] text-pretty text-base text-ink-muted sm:text-lg">
              FiveRate makes it easy to turn happy customers into more Google reviews. Send personalized review requests via WhatsApp and watch your reputation grow.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="rounded-md bg-pulse px-5 py-3 text-sm font-semibold text-on-dark shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Get More Reviews →
              </Link>
              <a
                href="#how-it-works"
                className="rounded-md border border-line bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
              >
                See how it works
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 font-mono text-xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-pulse" /> No API setup
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-pulse" /> Works on any phone
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-pulse" /> Free to start
              </span>
            </div>
          </div>

          <div className="rise md:col-span-5 [animation-delay:120ms]">
            <div className="mx-auto max-w-[330px] rounded-3xl border border-line bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2 rounded-t-2xl bg-ink px-3 py-2.5">
                <img 
                  src="/ChatGPT Image 12 sept. 2026, 01_08_30.png" 
                  alt="FiveRate Logo" 
                  className="size-8 rounded object-cover"
                />
                <div className="leading-tight">
                  <p className="text-[13px] font-semibold text-on-dark">Happy customer</p>
                  <p className="font-mono text-[10px] text-on-dark/50">just finished visit</p>
                </div>
              </div>
              <div className="space-y-2 rounded-b-2xl bg-bubble px-3 py-4">
                <div className="flex items-end gap-1.5">
                  <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-card px-3 py-2 text-[13px] leading-snug text-ink shadow-sm">
                    Hi John! 👋
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-card px-3 py-2 text-[13px] leading-snug text-ink shadow-sm">
                    Thanks for visiting <span className="font-medium">Acme Cafe</span> today! 
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-card px-3 py-2 text-[13px] leading-snug text-ink shadow-sm">
                    If you enjoyed it, we'd love an honest Google review ⭐
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <div className="max-w-[85%] self-end rounded-xl rounded-tr-sm bg-bubble-out px-3 py-2 text-[13px] leading-snug text-ink shadow-sm">
                    <span className="font-mono text-[12px] text-wa-ink">
                      [Google review link]
                    </span>
                  </div>
                </div>
                <div className="pt-1 font-mono text-[10px] text-ink-muted/70">
                  Sent via WhatsApp ✓
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="dashboard-preview" className="border-t border-line py-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
              Professional reputation dashboard
            </h2>
            <span className="hidden font-mono text-xs text-ink-muted sm:block">preview</span>
          </div>
          <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
            <div className="rise rounded-2xl border border-line bg-card p-5 shadow-sm [animation-delay:80ms]">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Review requests
              </p>
              <p className="mt-2 font-display text-2xl tracking-tight">24</p>
              <p className="mt-1 text-xs text-ink-muted">this month</p>
            </div>

            <div className="rise rounded-2xl border border-line bg-card p-5 shadow-sm [animation-delay:120ms]">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Sent this week
              </p>
              <p className="mt-2 font-display text-2xl tracking-tight">8</p>
              <p className="mt-1 text-xs text-ink-muted">active</p>
            </div>

            <div className="rise rounded-2xl border border-line bg-card p-5 shadow-sm [animation-delay:160ms]">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Reviews generated
              </p>
              <p className="mt-2 font-display text-2xl tracking-tight text-pulse">12</p>
              <p className="mt-1 text-xs text-ink-muted">verified</p>
            </div>

            <div className="rise rounded-2xl border border-line bg-card p-5 shadow-sm [animation-delay:200ms]">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                Conversion rate
              </p>
              <p className="mt-2 font-display text-2xl tracking-tight">50%</p>
              <p className="mt-1 text-xs text-ink-muted">growing</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-line py-12">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
              Three steps, one card
            </h2>
            <span className="hidden font-mono text-xs text-ink-muted sm:block">how it works</span>
          </div>
          <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className="rise bg-card p-5"
                style={{ animationDelay: `${80 + i * 80}ms` }}
              >
                <span className="font-mono text-xs text-pulse">{step.n}</span>
                <h3 className="mt-3 font-display text-lg">{step.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </section>


        <section id="pricing" className="py-12">
          <div className="text-center mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-pulse">
              Simple pricing
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">Start free, upgrade when you're ready</h2>
            <p className="mt-2 text-sm text-ink-muted">
              No credit card required to get started.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
            {/* Free plan */}
            <div className="rise rounded-2xl border border-line bg-card p-6 flex flex-col">
              <div className="mb-4">
                <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-ink-muted bg-line px-2 py-0.5 rounded-full">
                  Free
                </span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl tracking-tight">$0</span>
                  <span className="text-sm text-ink-muted">/month</span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">Try FiveRate with no commitment</p>
              </div>
              <ul className="space-y-2.5 text-sm flex-1 mb-6">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="size-1.5 rounded-full bg-ink-muted flex-shrink-0" />
                    <span className="text-ink-muted">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block rounded-md border border-line bg-paper px-4 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:border-ink/30"
              >
                Start for free →
              </Link>
            </div>

            {/* Pro plan */}
            <div className="rise rounded-2xl border-2 border-pulse bg-card p-6 flex flex-col shadow-sm relative [animation-delay:80ms]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-block font-mono text-[10px] uppercase tracking-widest bg-pulse text-on-dark px-3 py-0.5 rounded-full shadow">
                  Most popular
                </span>
              </div>
              <div className="mb-4">
                <span className="inline-block font-mono text-[10px] uppercase tracking-widest text-pulse-ink bg-pulse-soft px-2 py-0.5 rounded-full">
                  Pro
                </span>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-4xl tracking-tight">$9.99</span>
                  <span className="text-sm text-ink-muted">/month</span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">Everything you need to grow</p>
              </div>
              <ul className="space-y-2.5 text-sm flex-1 mb-6">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="size-1.5 rounded-full bg-pulse flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/upgrade"
                className="block rounded-md bg-pulse px-4 py-2.5 text-center text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
              >
                Upgrade to Pro →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4 px-5 py-8 text-center">
          <Logo size="sm" />
          <p className="font-mono text-xs text-ink-muted">
            Made for main-street businesses &#183; 2026
          </p>
          <div className="flex gap-5 text-sm text-ink-muted">
            <a href="#pricing" className="transition-colors hover:text-ink">
              Pricing
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-ink">
              How it works
            </a>
            <Link to="/dashboard" className="transition-colors hover:text-ink">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
