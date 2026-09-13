import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { 
  getAdminUsers, 
  getAdminBusinesses, 
  getAdminSubscriptions, 
  getAdminRequests, 
  getAdminCustomers,
  type AdminUser
} from "@/lib/admin";
import type { BusinessAccount } from "@/lib/supabase";
import type { ReviewRequest, Subscription, Customer } from "@/lib/supabase-utils";
import { Users, Building2, CreditCard, MessageSquare, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { formatDate } from "@/lib/reviewpulse";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

function StatCard({ title, value, icon: Icon, link }: { title: string, value: string | number, icon: any, link: string }) {
  return (
    <div className="bg-card border border-line rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-mono uppercase tracking-wide text-ink-muted mb-1">{title}</p>
          <p className="text-3xl font-display">{value}</p>
        </div>
        <div className="size-12 rounded-full bg-pulse/10 flex items-center justify-center text-pulse">
          <Icon className="size-6" />
        </div>
      </div>
      <Link to={link} className="mt-4 flex items-center text-sm text-pulse font-medium hover:underline">
        View details <ArrowUpRight className="ml-1 size-3" />
      </Link>
    </div>
  );
}

function AdminOverview() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [businesses, setBusinesses] = useState<BusinessAccount[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminUsers(),
      getAdminBusinesses(),
      getAdminSubscriptions(),
      getAdminRequests(),
      getAdminCustomers()
    ]).then(([u, b, s, r, c]) => {
      setUsers(u);
      setBusinesses(b);
      setSubscriptions(s);
      setRequests(r);
      setCustomers(c);
      setLoading(false);
    }).catch(console.error);
  }, []);

  if (loading) return <div className="p-8 text-ink-muted">Loading overview...</div>;

  const paidCount = businesses.filter(b => b.is_paid).length;
  const activeSubs = subscriptions.filter(s => s.status === 'active').length;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-display mb-6">Platform Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Users" value={users.length} icon={Users} link="/admin/users" />
        <StatCard title="Businesses" value={businesses.length} icon={Building2} link="/admin/businesses" />
        <StatCard title="Active Subs" value={activeSubs} icon={CreditCard} link="/admin/subscriptions" />
        <StatCard title="Requests Sent" value={requests.length} icon={MessageSquare} link="/admin/requests" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-line rounded-xl">
          <div className="p-6 border-b border-line">
            <h2 className="text-lg font-display">Recent Users</h2>
          </div>
          <div className="divide-y divide-line">
            {users.slice(0, 5).map(user => (
              <div key={user.id} className="p-4 px-6 flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.full_name || "Unknown"}</p>
                  <p className="text-xs text-ink-muted">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{user.business_name || "No Business"}</p>
                  <p className="text-xs text-ink-muted">{formatDate(user.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-line rounded-xl">
          <div className="p-6 border-b border-line">
            <h2 className="text-lg font-display">Recent Review Requests</h2>
          </div>
          <div className="divide-y divide-line">
            {requests.slice(0, 5).map(req => (
              <div key={req.id} className="p-4 px-6 flex justify-between items-center">
                <div>
                  <p className="font-medium">{req.name}</p>
                  <p className="text-xs font-mono text-ink-muted">{req.phone}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {req.status}
                  </span>
                  <p className="text-xs text-ink-muted mt-1">{formatDate(req.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
