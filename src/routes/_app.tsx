import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Bell, Search, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { apiService, User } from "../lib/api-service";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function TrialExpiredLock({ user, onActivated }: { user: User; onActivated: (upgradedOrg: any) => void }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    apiService.getPlans().then(setPlans);
  }, []);

  const handleUpgrade = async (planName: string) => {
    if (!user.organization) return;
    setUpgrading(planName);
    try {
      const updatedOrg = await apiService.upgradeOrganization(user.organization.id, planName);
      onActivated(updatedOrg);
    } catch (e: any) {
      alert("Error upgrading package: " + e.message);
    } finally {
      setUpgrading(null);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    window.location.href = "/";
  };

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12 text-slate-100">
      <div className="max-w-4xl w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          Trial Period Expired
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Activate Your Organization
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
          Your 3-Day free trial for <span className="text-indigo-400 font-semibold">{user.organization?.name}</span> has expired.
          {isAdmin
            ? " Please select a subscription package below to upgrade and continue using Zenelait Workforce Network."
            : " Please contact your administrator / HR manager to purchase a package and continue access."}
        </p>

        {!isAdmin ? (
          <div className="pt-6">
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className="flex flex-col rounded-xl border border-slate-850 bg-slate-900/50 p-6 text-left relative overflow-hidden backdrop-blur-sm hover:border-slate-850 transition"
                >
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                      {plan.name} Package
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white">${plan.price}</span>
                      <span className="text-slate-500 text-xs">/month</span>
                    </div>
                  </div>

                  <div className="mt-6 flex-1 space-y-4">
                    <div className="text-xs text-slate-400">
                      Supports up to <strong className="text-slate-200 font-semibold">{plan.maxUsers}</strong> users
                    </div>
                    <div className="text-xs text-slate-400">
                      Modules included:
                      <div className="mt-1 flex flex-wrap gap-1">
                        {plan.allowedModules.split(",").map((mod: string) => (
                          <span key={mod} className="px-1.5 py-0.5 rounded bg-slate-850 text-[10px] text-slate-300 border border-slate-800">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={upgrading !== null}
                    onClick={() => handleUpgrade(plan.name)}
                    className="mt-8 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    {upgrading === plan.name ? "Processing..." : `Select & Activate`}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-slate-350 transition cursor-pointer"
              >
                Sign Out & Return Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AppLayout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Route protection client-side only
  useEffect(() => {
    const user = apiService.getCurrentUser();
    if (!user) {
      window.location.href = "/";
    } else {
      setCurrentUser(user);
      setLoading(false);
    }
  }, []);

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Authenticating session...
      </div>
    );
  }

  // Check if trial organization has expired
  const isTrialExpired =
    currentUser.organization &&
    currentUser.organization.isDemo &&
    currentUser.organization.expiresAt &&
    new Date(currentUser.organization.expiresAt).getTime() < Date.now();

  if (isTrialExpired) {
    return (
      <TrialExpiredLock
        user={currentUser}
        onActivated={(upgradedOrg) => {
          const updatedUser = { ...currentUser, organization: upgradedOrg };
          setCurrentUser(updatedUser);
        }}
      />
    );
  }

  const handleLogout = () => {
    apiService.logout();
    window.location.href = "/";
  };

  const initials = currentUser.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : "UR";

  const displayRole = currentUser.role === "SUPERADMIN" 
    ? "Super Admin" 
    : `${currentUser.organization?.name || ""} (${currentUser.role})`;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur">
            <SidebarTrigger />
            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search employees, tickets, projects…" className="h-9 pl-8" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 pl-2 border-l pl-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-600 text-white font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden text-xs leading-tight sm:block mr-2">
                  <div className="font-semibold text-foreground">{currentUser.username}</div>
                  <div className="text-[10px] text-muted-foreground">{displayRole}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="h-8 w-8 hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}