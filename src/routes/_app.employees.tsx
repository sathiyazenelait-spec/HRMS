import { createFileRoute } from "@tanstack/react-router";
import { Users, UserPlus, ShieldAlert, KeyRound, Check, Lock, Mail, Phone, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/employees")({
  head: () => ({
    meta: [
      { title: "Employees · Zenelait HRMS" },
      { name: "description", content: "Employee directory: personal, contact, and account management." },
    ],
  }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const currentUser = apiService.getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const orgId = currentUser?.organization?.id;
  const orgName = currentUser?.organization?.name || "Organization";

  const [activeTab, setActiveTab] = useState<"directory" | "create" | "resets">("directory");
  const [users, setUsers] = useState<User[]>([]);
  const [resetRequests, setResetRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating new employee
  const [username, setUsername] = useState("");
  const [gmail, setGmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const fetchedUsers = await apiService.getUsers(orgId);
      setUsers(fetchedUsers);

      if (isAdmin) {
        const fetchedResets = await apiService.getResetRequests(orgId);
        setResetRequests(fetchedResets);
      }
    } catch (e) {
      console.error("Error loading employees data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    if (!orgId) return;

    try {
      await apiService.createUser({
        username,
        gmail,
        password,
        mobile,
        role,
        orgId,
      });
      setCreateSuccess(`Account successfully created for ${username}!`);
      setUsername("");
      setGmail("");
      setPassword("");
      setMobile("");
      setRole("EMPLOYEE");
      loadData();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create user");
    }
  };

  const handleApproveReset = async (id: number) => {
    try {
      await apiService.approveReset(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to approve request");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`${orgName} Employees`} 
        description={isAdmin ? "Manage organization directory, add employee accounts, and approve password resets." : "Directory of employees in your organization."} 
      />

      {/* Tabs Menu */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("directory")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "directory" 
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Employee Directory
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === "create" 
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Add New Employee
            </button>
            <button
              onClick={() => setActiveTab("resets")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "resets" 
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Password Resets
              {resetRequests.length > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {resetRequests.length}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === "directory" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organization Directory</CardTitle>
            <CardDescription>All accounts registered under {orgName}.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 text-sm text-muted-foreground">Loading directory...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">No employees found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="py-3 px-4 font-semibold text-muted-foreground">Username</th>
                      <th className="py-3 px-4 font-semibold text-muted-foreground">Email</th>
                      <th className="py-3 px-4 font-semibold text-muted-foreground">Mobile</th>
                      <th className="py-3 px-4 font-semibold text-muted-foreground">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/30">
                    {users.map((u) => (
                      <tr key={u.id || u.username} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3.5 px-4 font-medium">{u.username}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{u.gmail}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">{u.mobile || "N/A"}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                            {u.role}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "create" && isAdmin && (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              Create Employee Account
            </CardTitle>
            <CardDescription>Create a new login credential for an employee under your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {createError && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-450">
                {createError}
              </div>
            )}
            {createSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="h-4 w-4" />
                {createSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Gmail Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={gmail}
                    onChange={(e) => setGmail(e.target.value)}
                    placeholder="employee@gmail.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Temporary Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">HR Admin</option>
                </select>
              </div>

              <Button type="submit" className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-500">
                Create Account
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "resets" && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-indigo-500" />
              Password Reset Requests
            </CardTitle>
            <CardDescription>Approve reset requests from employees. Once approved, the employee can change their password on the login screen.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 text-sm text-muted-foreground">Loading requests...</div>
            ) : resetRequests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2">
                <Lock className="h-8 w-8 text-muted-foreground/50" />
                <span className="text-sm font-medium">No pending password reset requests.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-muted">
                      <th className="py-3 px-4 font-semibold text-muted-foreground">Username</th>
                      <th className="py-3 px-4 font-semibold text-muted-foreground">Status</th>
                      <th className="py-3 px-4 font-semibold text-muted-foreground">Requested At</th>
                      <th className="py-3 px-4 font-semibold text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/30">
                    {resetRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3.5 px-4 font-medium">{req.username}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30">
                            {req.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {req.createdAt ? new Date(req.createdAt).toLocaleString() : "N/A"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveReset(req.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                          >
                            Approve Reset
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
