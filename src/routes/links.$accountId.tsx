import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { BusinessAccount } from "@/lib/supabase";
import { Logo } from "@/components/rp/Logo";

export const Route = createFileRoute("/links/$accountId")({
  head: ({ params }) => ({
    meta: [
      { title: "Leave a Review" },
      { name: "description", content: "Share your experience and follow us online." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LinksPage,
});

function LinksPage() {
  const { accountId } = Route.useParams();
  const [business, setBusiness] = useState<BusinessAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    supabase
      .from("business_accounts")
      .select("*")
      .eq("id", accountId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setBusiness(data);
        }
        setLoading(false);
      });
  }, [accountId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="animate-pulse w-12 h-12 bg-pulse rounded-full" />
      </div>
    );
  }

  if (notFound || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-center px-6">
        <div>
          <p className="text-4xl mb-4">🔍</p>
          <h1 className="font-display text-2xl text-ink mb-2">Page not found</h1>
          <p className="text-ink-muted text-sm">This link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  const googleMapsUrl = business.google_maps_url || business.google_review_url;
  const instagramUrl = business.instagram_url;
  const hasAnyLink = googleMapsUrl || instagramUrl;

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper to-pulse-soft/30 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        {/* Business identity */}
        <div className="text-center mb-8">
          {business.logo_url ? (
            <img
              src={business.logo_url}
              alt={`${business.business_name} logo`}
              className="mx-auto size-20 rounded-2xl object-cover shadow-sm mb-4"
            />
          ) : (
            <div className="mx-auto size-20 rounded-2xl bg-pulse-soft flex items-center justify-center mb-4 shadow-sm">
              <span className="font-display text-3xl text-pulse-ink">
                {business.business_name?.[0]?.toUpperCase() ?? "B"}
              </span>
            </div>
          )}
          <h1 className="font-display text-2xl tracking-tight text-ink">{business.business_name}</h1>
          {business.city && (
            <p className="text-sm text-ink-muted mt-1">{business.city}</p>
          )}
        </div>

        {/* Link buttons */}
        <div className="flex flex-col gap-4">
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 w-full rounded-2xl border border-line bg-card px-6 py-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-yellow-400/10">
                <span className="text-xl">⭐</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-ink">Leave a Google Review</p>
                <p className="text-xs text-ink-muted mt-0.5">Share your experience on Google Maps</p>
              </div>
              <svg className="size-4 text-ink-muted shrink-0 group-hover:text-pulse transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}

          {instagramUrl && (
            <a
              href={instagramUrl.startsWith("http") ? instagramUrl : `https://instagram.com/${instagramUrl.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 w-full rounded-2xl border border-line bg-card px-6 py-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-pink-500/10">
                <span className="text-xl">📸</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-ink">Follow on Instagram</p>
                <p className="text-xs text-ink-muted mt-0.5 truncate">
                  {instagramUrl.startsWith("http") ? instagramUrl.replace(/https?:\/\/(www\.)?instagram\.com\//, "@") : instagramUrl}
                </p>
              </div>
              <svg className="size-4 text-ink-muted shrink-0 group-hover:text-pink-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}

          {!hasAnyLink && (
            <div className="text-center text-ink-muted text-sm py-8">
              No links have been added yet.
            </div>
          )}
        </div>

        {/* Powered by FiveRate */}
        <div className="mt-10 flex items-center justify-center gap-2 opacity-50">
          <Logo size="sm" />
          <span className="text-xs text-ink-muted">Powered by FiveRate</span>
        </div>
      </div>
    </div>
  );
}
