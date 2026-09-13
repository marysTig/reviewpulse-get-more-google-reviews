import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminUsers, deleteAdminUser, type AdminUser } from "@/lib/admin";
import { formatDate } from "@/lib/reviewpulse";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    getAdminUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  async function handleDelete(userId: string) {
    if (confirmId !== userId) {
      setConfirmId(userId);
      return;
    }
    setDeletingId(userId);
    try {
      await deleteAdminUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setConfirmId(null);
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user. Make sure you ran the admin_delete_user SQL function.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.business_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-display">Users</h1>
          <p className="text-sm text-ink-muted mt-1">{users.length} total registered users</p>
        </div>
        <input 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users..."
          className="rounded-md border border-line bg-paper px-3 py-2 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25 w-64"
        />
      </div>
      <div className="bg-card border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-paper border-b border-line text-xs uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-6 py-4 font-mono font-medium">Name</th>
                <th className="px-6 py-4 font-mono font-medium">Email</th>
                <th className="px-6 py-4 font-mono font-medium">Business</th>
                <th className="px-6 py-4 font-mono font-medium">Subscription</th>
                <th className="px-6 py-4 font-mono font-medium">Joined</th>
                <th className="px-6 py-4 font-mono font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-ink-muted">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-ink-muted">No users found.</td></tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-line/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{user.full_name || "-"}</td>
                    <td className="px-6 py-4 text-ink-muted">{user.email}</td>
                    <td className="px-6 py-4">{user.business_name || "-"}</td>
                    <td className="px-6 py-4">
                      {user.subscription_status ? (
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {user.subscription_status}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[10px] uppercase font-bold tracking-widest bg-line text-ink border border-line">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-ink-muted">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4">
                      {confirmId === user.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id}
                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId === user.id ? "Deleting..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-ink/30"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded-md border border-red-200 bg-red-50 p-1.5 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                          title="Delete user"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </td>
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
