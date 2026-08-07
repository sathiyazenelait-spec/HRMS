import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navGroups } from "@/lib/nav";

import { apiService } from "@/lib/api-service";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string) =>
    url === "/" ? pathname === "/" : pathname === url || pathname.startsWith(url + "/");

  const currentUser = apiService.getCurrentUser();
  const workMode = currentUser?.organization?.workMode || "TASK_BASED";

  const filteredNavGroups = navGroups.map((group) => {
    let items = group.items;

    if (group.label === "Delivery" && workMode === "TASK_BASED") {
      items = items.filter(
        (item) =>
          item.url !== "/sprints" &&
          item.url !== "/backlog" &&
          item.url !== "/tickets" &&
          item.url !== "/sprint-dashboard"
      );
    }

    if (currentUser?.role === "EMPLOYEE") {
      items = items.filter(
        (item) =>
          item.url !== "/recruitment" &&
          item.url !== "/onboarding" &&
          item.url !== "/admin" &&
          item.url !== "/rbac"
      );
    }

    return {
      ...group,
      items,
    };
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">Zenelait HRMS</span>
              <span className="text-xs text-muted-foreground">HRMS · Payroll · Delivery</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {filteredNavGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t">
        {!collapsed && (
          <div className="px-2 py-2 text-xs text-muted-foreground">
            v0.1 · Template preview
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}