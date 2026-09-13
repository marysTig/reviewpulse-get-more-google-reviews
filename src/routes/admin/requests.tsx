import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminRequests } from "@/lib/admin";
import type { ReviewRequest } from "@/lib/supabase-utils";
import { formatDate, formatPhone, STATUS_CLASS, STATUS_LABEL } from "@/lib/reviewpulse";

export const Route = createFileRoute("/admin/requests")({
  component: AdminRequests,
});

function AdminRequests() {
  const [requests, setRequests] = useState<(ReviewRequest & { business_accounts: { business_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminRequests().then(setRequests).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-display mb-6">Review Requests</h1>
      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-paper border-b border-line text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-4 font-mono font-medium">Customer</th>
                <th className="px-6 py-4 font-mono font-medium">Phone</th>
                <th className="px-6 py-4 font-mono font-medium">Business</th>
                <th className="px-6 py-4 font-mono font-medium">Status</th>
                <th className="px-6 py-4 font-mono font-medium">Date Sent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-muted">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-muted">No requests found.</td></tr>
              ) : (
                requests.map(r => (
                  <tr key={r.id} className="hover:bg-line/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{r.name || "-"}</td>
                    <td className="px-6 py-4 font-mono text-ink-muted">{formatPhone(r.phone) || "-"}</td>
                    <td className="px-6 py-4">{r.business_accounts?.business_name || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest border ${STATUS_CLASS[r.status]}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-ink-muted">{formatDate(r.date)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
