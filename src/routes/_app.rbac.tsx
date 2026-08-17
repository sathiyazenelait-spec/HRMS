import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, Key, Users, Settings, Save, AlertCircle, FileText, CheckCircle2, History } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_app/rbac")({
  head: () => ({
    meta: [
      { title: "Roles & Access Matrix · Zenelait HRMS" },
      { name: "description", content: "Fine-grained role-based access controls (RBAC) and employee role audits." },
    ],
  }),
  component: RBACPage,
});

const ROLES_LIST = [
  "ADMIN",
  "EMPLOYEE",
  "FINANCE",
  "PM",
  "TEAMLEAD",
  "RECRUITER",
  "IT",
  "QA",
  "AUDITOR",
];

const MODULES_LIST = [
  "Employees",
  "Attendance",
  "Leave",
  "Payroll",
  "Performance",
  "Learning",
  "Assets",
  "Projects",
  "Teams",
  "Expenses",
  "Travel",
  "Announcements",
  "Helpdesk",
  "Exit",
  "Reports",
  "Self-Service",
];

function RBACPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("EMPLOYEE");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Local grid edits state
  const [grid, setGrid] = useState<{ [module: string]: { read: boolean; write: boolean; delete: boolean } }>({});

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      setUsers(uList.filter(u => u.role !== "SUPERADMIN"));

      const perms = await apiService.getRolePermissions(orgId);
      setPermissions(perms);

      // Load role change audit logs from MySQL
      const logs = await apiService.getRoleAuditLogs(orgId);
      setAuditLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  // Sync grid when role or permissions change
  useEffect(() => {
    const nextGrid: typeof grid = {};
    MODULES_LIST.forEach((m) => {
      const match = permissions.find((p) => p.roleName === selectedRole && p.moduleName === m);
      nextGrid[m] = {
        read: match ? match.canRead : selectedRole === "ADMIN",
        write: match ? match.canWrite : selectedRole === "ADMIN",
        delete: match ? match.canDelete : selectedRole === "ADMIN",
      };
    });
    setGrid(nextGrid);
  }, [selectedRole, permissions]);

  const handleToggle = (module: string, type: "read" | "write" | "delete", val: boolean) => {
    setGrid((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [type]: val,
      },
    }));
  };

  const handleSaveMatrix = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      for (const m of MODULES_LIST) {
        const state = grid[m] || { read: false, write: false, delete: false };
        await apiService.saveRolePermission(orgId, {
          roleName: selectedRole,
          moduleName: m,
          canRead: state.read,
          canWrite: state.write,
          canDelete: state.delete,
        });
      }
      await loadData();
    } catch (e) {
      alert("Failed to save permissions matrix");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserRole = async (targetUser: string, oldRole: string, newRole: string) => {
    if (!orgId) return;
    setLoading(true);
    try {
      // Find the user object and modify role in MySQL database
      const match = users.find(u => u.username === targetUser);
      if (match && match.id) {
        await apiService.updateUserRole(match.id, newRole);
        
        // Log the audit event to MySQL database
        await apiService.saveRoleAuditLog(orgId, {
          targetUser,
          actor: currentUser?.username || "administrator",
          oldRole,
          newRole
        });
      }
      await loadData();
    } catch (e) {
      alert("Failed to update employee role scope");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Roles & Access Matrix" 
        description="Fine-grained Role-Based Access Control (RBAC). Configure granular module permissions and audit user access levels."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Role select & Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-indigo-500" />
                  Configure Permissions
                </CardTitle>
                <CardDescription>Toggle module scopes for the selected role.</CardDescription>
              </div>
              <div className="w-full sm:w-44">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    {ROLES_LIST.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-2.5">Module Path</th>
                      <th className="py-2.5 text-center">Read access</th>
                      <th className="py-2.5 text-center">Write access</th>
                      <th className="py-2.5 text-center">Delete access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES_LIST.map((m) => {
                      const state = grid[m] || { read: false, write: false, delete: false };
                      return (
                        <tr key={m} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                          <td className="py-3 font-semibold text-slate-200">{m}</td>
                          <td className="py-3 text-center">
                            <Checkbox 
                              checked={state.read} 
                              onCheckedChange={(checked) => handleToggle(m, "read", !!checked)}
                              disabled={selectedRole === "ADMIN" || !isAdmin}
                            />
                          </td>
                          <td className="py-3 text-center">
                            <Checkbox 
                              checked={state.write} 
                              onCheckedChange={(checked) => handleToggle(m, "write", !!checked)}
                              disabled={selectedRole === "ADMIN" || !isAdmin}
                            />
                          </td>
                          <td className="py-3 text-center">
                            <Checkbox 
                              checked={state.delete} 
                              onCheckedChange={(checked) => handleToggle(m, "delete", !!checked)}
                              disabled={selectedRole === "ADMIN" || !isAdmin}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {isAdmin && (
                <div className="flex justify-end pt-4 mt-4 border-t border-slate-850">
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-500 text-xs flex items-center gap-1.5 cursor-pointer"
                    onClick={handleSaveMatrix}
                    disabled={loading || selectedRole === "ADMIN"}
                  >
                    <Save className="h-4 w-4" />
                    Save Permissions Matrix
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Employee Roles & Audit logs */}
        <div className="space-y-6">
          {/* Employee Roles assignments */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-500" />
                Employee Roles List
              </CardTitle>
              <CardDescription>Assign functional access roles to team members.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-900">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-100">{u.username}</span>
                    <span className="text-[10px] text-slate-500 block">{u.gmail}</span>
                  </div>
                  <div className="w-28">
                    <Select 
                      value={u.role} 
                      onValueChange={(val) => handleChangeUserRole(u.username, u.role, val)}
                      disabled={!isAdmin}
                    >
                      <SelectTrigger className="bg-slate-950 border-slate-850 h-7 text-[10px] text-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white text-[10px]">
                        {ROLES_LIST.map((r) => (
                          <SelectItem key={r} value={r} className="text-[10px]">{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Role Change Audit log */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
                <History className="h-4 w-4 text-indigo-500" />
                Role Change Audit Trail
              </CardTitle>
              <CardDescription>Trace log audit trail of all role assignments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-[10px] p-2.5 rounded bg-slate-950/45 border border-slate-900 space-y-1">
                  <div className="flex justify-between text-slate-500">
                    <span>{log.timestamp}</span>
                    <span>By: {log.actor}</span>
                  </div>
                  <p className="text-slate-300">
                    Modified <strong className="text-slate-100">{log.targetUser}</strong> role from{" "}
                    <Badge variant="outline" className="text-[8px] bg-slate-900 text-slate-500">{log.oldRole}</Badge> to{" "}
                    <Badge variant="outline" className="text-[8px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">{log.newRole}</Badge>
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
