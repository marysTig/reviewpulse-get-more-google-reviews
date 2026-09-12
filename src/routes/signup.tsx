import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signUp, createBusinessAccount } from "@/lib/supabase";
import { Logo } from "@/components/rp/Logo";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name.trim()) throw new Error("Please enter your name");
      if (!formData.businessName.trim()) throw new Error("Please enter your business name");
      if (!formData.email) throw new Error("Please enter your email");
      if (formData.password.length < 8) throw new Error("Password must be at least 8 characters");
      if (formData.password !== formData.confirmPassword) throw new Error("Passwords don't match");

      const user = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.businessName
      );

      // Create business account
      if (user.user) {
        await createBusinessAccount(user.user.id, formData.businessName);
        navigate({ to: "/onboarding" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <Link to="/">
          <Logo />
        </Link>
      </div>

      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
        <div className="w-full max-w-md rounded-xl border border-line bg-card p-6 shadow-sm">
          <div className="text-center">
            <h1 className="font-display text-2xl tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-ink-muted">Free forever setup. No payment required.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                Full name
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
              />
            </label>

            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                Business name
              </span>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Acme Cafe"
                className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
              />
            </label>

            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                Email
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
              />
            </label>

            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                Password
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
              />
              <p className="mt-1 text-xs text-ink-muted">At least 8 characters</p>
            </label>

            <label className="block">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-muted">
                Confirm password
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-md border border-line bg-paper px-3 py-2.5 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-md bg-pulse px-4 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>

            <p className="text-center text-xs text-ink-muted">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-pulse transition-colors hover:text-pulse">
                Sign in
              </Link>
            </p>
          </form>

          <div className="mt-6 border-t border-line pt-6 text-center text-xs text-ink-muted">
            <p className="font-semibold">✓ Free signup, no payment required</p>
            <p className="mt-1">Complete setup for free. Pay only when you send requests.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
