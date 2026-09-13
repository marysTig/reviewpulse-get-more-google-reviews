import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAdmin } from "@/lib/admin";
import { Logo } from "@/components/rp/Logo";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard, 
  Contact, 
  MessageSquare, 
  QrCode, 
  Settings,
  LogOut 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const navItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/businesses", icon: Building2, label: "Businesses" },
  { path: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { path: "/admin/customers", icon: Contact, label: "Customers" },
  { path: "/admin/requests", icon: MessageSquare, label: "Review Requests" },
  { path: "/admin/qr", icon: QrCode, label: "QR Codes" },
  { path: "/admin/settings", icon: Settings, label: "Settings" },
];

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [debugMsg, setDebugMsg] = useState("Waiting for auth...");

  useEffect(() => {
    if (loading) {
      setDebugMsg("Loading auth session...");
      return;
    }

    if (!user) {
      setDebugMsg("No user session found. Redirecting to login...");
      setTimeout(() => navigate({ to: "/login" }), 1500);
      return;
    }

    setDebugMsg(`Logged in as: ${user.email}. Checking admin role...`);

    isAdmin().then((admin) => {
      if (!admin) {
        setDebugMsg(`${user.email} is NOT in the admins table. Redirecting to dashboard...`);
        setTimeout(() => navigate({ to: "/dashboard" }), 2000);
      } else {
        setDebugMsg("Admin confirmed!");
        setIsAdminUser(true);
      }
      setAdminChecked(true);
    }).catch((err) => {
      setDebugMsg(`Admin check error: ${err?.message || err}. Redirecting to dashboard...`);
      setTimeout(() => navigate({ to: "/dashboard" }), 2000);
      setAdminChecked(true);
    });
  }, [user, loading, navigate]);

  if (loading || !adminChecked || !isAdminUser) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-paper gap-3">
        <div className="text-sm font-mono text-ink-muted bg-card border border-line rounded-lg px-6 py-4 max-w-md text-center">
          {debugMsg}
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-paper text-ink">
      {/* Sidebar */}
      <aside className="w-64 border-r border-line bg-card flex flex-col">
        <div className="p-6 border-b border-line flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-widest text-pulse bg-pulse/10 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              activeProps={{
                className: "bg-pulse/10 text-pulse font-medium",
              }}
              activeOptions={{ exact: !!item.exact }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-muted hover:bg-line/50 hover:text-ink transition-colors"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-line">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="size-8 rounded-full bg-pulse flex items-center justify-center text-on-dark font-display text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-ink-muted">Administrator</p>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="mt-2 flex items-center justify-center gap-2 w-full py-2 text-sm text-ink-muted hover:text-ink hover:bg-line/50 rounded-lg transition-colors"
          >
            <LogOut className="size-4" />
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
