import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminQrCodes, type AdminQrBusiness } from "@/lib/admin";
import { QrCode, ExternalLink, Download } from "lucide-react";
import { formatDate } from "@/lib/reviewpulse";

export const Route = createFileRoute("/admin/qr")({
  component: AdminQRCodes,
});

function buildQrUrl(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
}

function AdminQRCodes() {
  const [businesses, setBusinesses] = useState<AdminQrBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminQrCodes()
      .then(setBusinesses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display">QR Codes</h1>
          <p className="text-sm text-ink-muted mt-1">
            Businesses that have set up a Google review link.
          </p>
        </div>
        <span className="font-mono text-xs text-ink-muted bg-line/50 px-3 py-1.5 rounded-md">
          {businesses.length} active
        </span>
      </div>

      {loading ? (
        <div className="bg-card border border-line rounded-xl p-12 text-center text-ink-muted animate-pulse">
          Loading QR codes...
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-card border border-dashed border-line rounded-xl p-16 text-center">
          <div className="mx-auto size-16 bg-pulse/10 text-pulse rounded-full flex items-center justify-center mb-4">
            <QrCode className="size-8" />
          </div>
          <h2 className="text-lg font-display mb-2">No QR codes yet</h2>
          <p className="text-ink-muted text-sm max-w-sm mx-auto">
            QR codes will appear here once businesses set up their Google review link in their Business Profile.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {businesses.map((biz) => {
            const qrUrl = buildQrUrl(biz.google_review_url);
            return (
              <div key={biz.id} className="bg-card border border-line rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                {/* QR Code image */}
                <div className="bg-white p-6 flex items-center justify-center border-b border-line">
                  <img
                    src={qrUrl}
                    alt={`QR code for ${biz.business_name}`}
                    className="w-40 h-40 object-contain"
                  />
                </div>

                {/* Business info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="font-display font-semibold text-base truncate">{biz.business_name || "—"}</p>
                    {biz.city && (
                      <p className="text-xs text-ink-muted mt-0.5">{biz.city}</p>
                    )}
                    <p className="font-mono text-[10px] text-ink-muted mt-1">{formatDate(biz.created_at)}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a
                      href={biz.google_review_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-wa-ink hover:underline truncate"
                    >
                      <ExternalLink className="size-3 shrink-0" />
                      <span className="truncate">{biz.google_review_url}</span>
                    </a>
                    <a
                      href={qrUrl}
                      download={`${biz.business_name}-qr.png`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink hover:border-ink/30 hover:bg-line/20 transition-colors"
                    >
                      <Download className="size-3.5" />
                      Download QR
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
