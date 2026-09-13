import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminBusinesses } from "@/lib/admin";
import type { BusinessAccount } from "@/lib/supabase";
import { formatDate } from "@/lib/reviewpulse";

export const Route = createFileRoute("/admin/businesses")({
  component: AdminBusinesses,
});

function AdminBusinesses() {
  const [businesses, setBusinesses] = useState<BusinessAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminBusinesses().then(setBusinesses).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-display mb-6">Businesses</h1>
      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-paper border-b border-line text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-4 font-mono font-medium">Business Name</th>
                <th className="px-6 py-4 font-mono font-medium">Phone</th>
                <th className="px-6 py-4 font-mono font-medium">Location</th>
                <th className="px-6 py-4 font-mono font-medium">Status</th>
                <th className="px-6 py-4 font-mono font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-muted">Loading...</td></tr>
              ) : businesses.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-muted">No businesses found.</td></tr>
              ) : (
                businesses.map(b => (
                  <tr key={b.id} className="hover:bg-line/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{b.business_name || "-"}</td>
                    <td className="px-6 py-4 text-ink-muted">{b.phone || "-"}</td>
                    <td className="px-6 py-4 text-ink-muted">{b.location || b.city || "-"}</td>
                    <td className="px-6 py-4">
                      {b.is_paid ? (
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest bg-line text-ink border border-line">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-ink-muted">{formatDate(b.created_at)}</td>
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
