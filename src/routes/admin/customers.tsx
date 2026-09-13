import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminCustomers } from "@/lib/admin";
import type { Customer } from "@/lib/supabase-utils";
import { formatDate, formatPhone } from "@/lib/reviewpulse";

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const [customers, setCustomers] = useState<(Customer & { business_accounts: { business_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminCustomers().then(setCustomers).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-display mb-6">Customers</h1>
      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-paper border-b border-line text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-4 font-mono font-medium">Name</th>
                <th className="px-6 py-4 font-mono font-medium">Phone</th>
                <th className="px-6 py-4 font-mono font-medium">Business</th>
                <th className="px-6 py-4 font-mono font-medium">Added On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-ink-muted">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-ink-muted">No customers found.</td></tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-line/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{c.first_name || "-"}</td>
                    <td className="px-6 py-4 font-mono text-ink-muted">{formatPhone(c.phone) || "-"}</td>
                    <td className="px-6 py-4">{c.business_accounts?.business_name || "-"}</td>
                    <td className="px-6 py-4 text-ink-muted">{formatDate(c.created_at)}</td>
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
