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