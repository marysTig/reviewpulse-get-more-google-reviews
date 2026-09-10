import { createFileRoute, Link } from "@tanstack/react-router";

import { Logo } from "@/components/rp/Logo";
import { DEMO_PROFILE } from "@/lib/reviewpulse";

const TITLE = "ReviewPulse — Get More Google Reviews by WhatsApp";
const DESCRIPTION =
  "ReviewPulse helps US local businesses ask happy customers for honest Google reviews with one WhatsApp message. $10/month per location.";

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
    title: "Set your profile",
    body: "Paste your Google review link once. We hold the business name and URL.",
  },
  {
    n: "02",
    title: "Send the nudge",
    body: "Type a first name and a phone number. One tap opens a ready-to-send WhatsApp.",
  },
  {
    n: "03",
    title: "Watch it land",
    body: "Track who was sent, who clicked, and who reviewed. Honest reviews, no gating.",
  },
];

const PLAN_FEATURES = [
  "Unlimited review requests",
  "WhatsApp one-tap delivery",
  "Full request history & status",
  "Cancel anytime",
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
            className="rounded-md bg-ink px-3.5 py-2 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
          >
            Get More Google Reviews
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5">
        <section className="grid items-center gap-8 py-12 md:grid-cols-12 md:py-16">
          <div className="rise md:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-pulse">
              For local businesses
            </p>
            <h1 className="mt-4 max-w-[16ch] text-balance font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Ask for reviews while the visit is still warm.
            </h1>
            <p className="mt-5 max-w-[46ch] text-pretty text-base text-ink-muted sm:text-lg">
              ReviewPulse hands every happy customer a single, personal WhatsApp nudge to leave an
              honest Google review. No cold email. No gatekeeping. Just the right words, at the
              right moment.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/dashboard"
                className="rounded-md bg-pulse px-5 py-3 text-sm font-semibold text-on-dark shadow-sm transition-transform hover:-translate-y-0.5"
              >
                Get More Google Reviews
              </Link>
              <Link
                to="/dashboard"
                className="rounded-md border border-line bg-card px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/30"
              >
                See the dashboard
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-5 font-mono text-xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-pulse" /> No API setup
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-pulse" /> Works on any phone
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-pulse" /> $10 / month
              </span>
            </div>
          </div>

          <div className="rise md:col-span-5 [animation-delay:120ms]">
            <div className="mx-auto max-w-[330px] rounded-3xl border border-line bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2 rounded-t-2xl bg-ink px-3 py-2.5">
                <div className="grid size-8 place-items-center rounded-full bg-wa font-display text-sm text-on-dark">
                  M
                </div>
                <div className="leading-tight">
                  <p className="text-[13px] font-semibold text-on-dark">{DEMO_PROFILE.name}</p>
                  <p className="font-mono text-[10px] text-on-dark/50">online</p>
                </div>
                <span className="ml-auto font-mono text-[10px] text-on-dark/50">12:04</span>
              </div>
              <div className="space-y-2 rounded-b-2xl bg-bubble px-3 py-4">
                <div className="flex items-end gap-1.5">
                  <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-card px-3 py-2 text-[13px] leading-snug text-ink shadow-sm">
                    Hi Dana! Thanks for visiting {DEMO_PROFILE.name} today. If you enjoyed your
                    visit, would you mind leaving us an honest Google review?
                  </div>
                </div>
                <div className="flex items-end gap-1.5">
                  <div className="max-w-[85%] self-end rounded-xl rounded-tr-sm bg-bubble-out px-3 py-2 text-[13px] leading-snug text-ink shadow-sm">
                    <span className="font-mono text-[12px] text-wa-ink">maps.app/rev/marigold</span>
                  </div>
                  <span className="font-mono text-[10px] text-ink-muted">12:04</span>
                </div>
                <div className="pt-1 font-mono text-[10px] text-ink-muted/70">
                  Delivered &#10003;&#10003;
                </div>
              </div>
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

        <section className="grid gap-6 py-12 md:grid-cols-12">
          <figure className="rise rounded-xl border border-line bg-card p-6 md:col-span-7">
            <div className="flex items-center gap-1 text-warn" aria-label="5 star rating">
              {[0, 1, 2, 3, 4].map((s) => (
                <span key={s} className="font-display">
                  &#9733;
                </span>
              ))}
            </div>
            <blockquote className="mt-3 max-w-[40ch] text-pretty font-display text-lg italic leading-snug">
              &ldquo;We stopped emailing reviews. Now a nudge lands in their chat the same afternoon
              — and the replies are actually warm.&rdquo;
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-pulse-soft font-display text-sm text-pulse-ink">
                PR
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Priya Raman</p>
                <p className="font-mono text-xs text-ink-muted">Owner, {DEMO_PROFILE.name}</p>
              </div>
            </figcaption>
          </figure>
          <div className="grid gap-4 md:col-span-5">
            <div className="rise rounded-xl border border-line bg-card p-5 [animation-delay:80ms]">
              <p className="font-display text-3xl tracking-tight">+38%</p>
              <p className="mt-1 text-sm text-ink-muted">
                median lift in weekly review requests in the first month
              </p>
            </div>
            <div className="rise rounded-xl border border-line bg-card p-5 [animation-delay:160ms]">
              <p className="font-display text-3xl tracking-tight">4.9&#9733;</p>
              <p className="mt-1 text-sm text-ink-muted">
                average rating across 1,200+ local storefronts
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-12">
          <div className="mx-auto max-w-md text-center">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-pulse">
              Simple pricing
            </p>
            <h2 className="mt-3 font-display text-3xl tracking-tight">One flat price</h2>
            <div className="rise mt-6 rounded-2xl border border-pulse/30 bg-card p-6 text-left shadow-sm">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl tracking-tight">$10</span>
                <span className="text-sm text-ink-muted">/ month</span>
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                per location. No per-review fees, no setup cost.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <span className="size-1.5 rounded-full bg-pulse" /> {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/dashboard"
                className="mt-6 block rounded-md bg-pulse px-4 py-3 text-center text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5"
              >
                Get More Google Reviews
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
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
