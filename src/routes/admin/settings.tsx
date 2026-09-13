import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-display mb-6">Platform Settings</h1>
      <div className="bg-card border border-line rounded-xl p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-1">General</h3>
            <p className="text-sm text-ink-muted mb-4">Basic platform configuration.</p>
            
            <div className="space-y-4">
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                  Platform Name
                </span>
                <input
                  defaultValue="FiveRate"
                  className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                />
              </label>
              
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                  Support Email
                </span>
                <input
                  defaultValue="support@fiverate.com"
                  className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                />
              </label>
              
              <label className="block">
                <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                  Default Subscription Price (Monthly)
                </span>
                <input
                  defaultValue="$19.00"
                  className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                />
              </label>
            </div>
          </div>
          
          <div className="pt-4 border-t border-line">
            <button className="rounded-md bg-pulse px-4 py-2 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
