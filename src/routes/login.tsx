import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";
import { Logo } from "@/components/rp/Logo";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

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
      if (!formData.email) throw new Error("Please enter your email");
      if (!formData.password) throw new Error("Please enter your password");

      await login(formData.email, formData.password);

      // Redirect admins to the admin panel, regular users to dashboard
      const admin = await isAdmin();
      navigate({ to: admin ? "/admin" : "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid login credentials");
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
            <h1 className="font-display text-2xl tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-ink-muted">Sign in to manage your reviews.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

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

            <label className="block relative">
              <span className="flex items-center justify-between font-mono text-xs uppercase tracking-wide text-ink-muted">
                <span>Password</span>
                <a href="#" className="font-semibold normal-case text-pulse transition-colors hover:text-pulse/80">
                  Forgot password?
                </a>
              </span>
              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full rounded-md border border-line bg-paper px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-pulse focus:ring-2 focus:ring-pulse/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-md bg-pulse px-4 py-3 text-sm font-semibold text-on-dark transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-center text-xs text-ink-muted">
              Don't have an account?{" "}
              <Link to="/signup" className="font-semibold text-pulse transition-colors hover:text-pulse">
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
