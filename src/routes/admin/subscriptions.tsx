import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminSubscriptions } from "@/lib/admin";
import type { Subscription } from "@/lib/supabase-utils";
import { formatDate } from "@/lib/reviewpulse";

export const Route = createFileRoute("/admin/subscriptions")({
  component: AdminSubscriptions,
});

function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<(Subscription & { business_accounts: { business_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSubscriptions().then(setSubscriptions).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-display mb-6">Subscriptions</h1>
      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-paper border-b border-line text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-4 font-mono font-medium">Business</th>
                <th className="px-6 py-4 font-mono font-medium">Status</th>
                <th className="px-6 py-4 font-mono font-medium">LS Sub ID</th>
                <th className="px-6 py-4 font-mono font-medium">Period End</th>
                <th className="px-6 py-4 font-mono font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-muted">Loading...</td></tr>
              ) : subscriptions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-muted">No subscriptions found.</td></tr>
              ) : (
                subscriptions.map(s => (
                  <tr key={s.id} className="hover:bg-line/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{s.business_accounts?.business_name || "-"}</td>
                    <td className="px-6 py-4">
                      {s.status === 'active' ? (
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest bg-red-100 text-red-800 border border-red-200">
                          {s.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-ink-muted">{s.lemonsqueezy_subscription_id || "-"}</td>
                    <td className="px-6 py-4 text-ink-muted">{s.current_period_end ? formatDate(s.current_period_end) : "-"}</td>
                    <td className="px-6 py-4 text-ink-muted">{formatDate(s.created_at)}</td>
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
