import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { apiService } from "../lib/api-service";
import { Sparkles, Lock, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/superadmin/")({
  head: () => ({
    meta: [
      { title: "Superadmin Login · Zenelait HRMS" },
      { name: "description", content: "Superadmin portal login page." },
    ],
  }),
  component: SuperadminLogin,
});

function SuperadminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in as SUPERADMIN
    const user = apiService.getCurrentUser();
    if (user && user.role === "SUPERADMIN") {
      window.location.href = "/superadmin/dashboard";
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await apiService.login(username, password);
      if (user.role === "SUPERADMIN") {
        window.location.href = "/superadmin/dashboard";
      } else {
        apiService.logout();
        setError("Unauthorized. This portal is for Superadmin access only.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl relative">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-2">Zenelait HRMS</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Superadmin Console</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">Superadmin Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="superadmin"
                className="w-full rounded-lg border border-slate-850 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-400 font-semibold">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-slate-850 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/15 cursor-pointer"
          >
            {loading ? "Authenticating..." : "Enter Admin Dashboard"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-600">
          <a href="/" className="hover:text-slate-450 hover:underline transition-all">
            Return to Public Landing Page
          </a>
        </div>
      </div>
    </div>
  );
}
