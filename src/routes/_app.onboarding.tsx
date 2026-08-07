import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Sparkles, UserPlus, CheckCircle2, Circle, Plus, User, Eye, Landmark, Key, Laptop, HelpCircle, Users, Coffee } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User as APIUser } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding · Zenelait HRMS" },
      { name: "description", content: "Checklists, account provisioning, and asset management." },
    ],
  }),
  component: OnboardingPage,
});

const CATEGORIES = [
  { key: "DOCUMENTS", label: "Document Collection", icon: ClipboardCheck },
  { key: "PROVISIONING", label: "SSO & Provisioning", icon: Key },
  { key: "ASSETS", label: "Asset Allocation", icon: Laptop },
  { key: "PAYROLL", label: "Payroll Setup", icon: Landmark },
  { key: "TEAM", label: "Team & Sprint Assignment", icon: Users },
  { key: "WELCOME", label: "Welcome & Buddy", icon: Coffee },
];

function OnboardingPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<APIUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [tasks, setTasks] = useState<any[]>([]);

  // Form State
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("DOCUMENTS");

  const loadInitialData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      // Remove SUPERADMIN users from onboarding lists
      const filtered = uList.filter(u => u.role !== "SUPERADMIN");
      setEmployees(filtered);

      if (isAdmin) {
        // Default select first employee or logged-in username if in list
        const defaultUser = filtered.find(u => u.username === loggedInUsername) || filtered[0];
        if (defaultUser) {
          setSelectedUser(defaultUser.username);
          await loadTasks(defaultUser.username);
        }
      } else {
        setSelectedUser(loggedInUsername);
        await loadTasks(loggedInUsername);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (username: string) => {
    if (!orgId || !username) return;
    try {
      const taskList = await apiService.getOnboardingTasks(orgId, username);
      setTasks(taskList);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [orgId]);

  const handleSelectUser = async (val: string) => {
    setSelectedUser(val);
    await loadTasks(val);
  };

  const handleToggleTask = async (taskId: number, currentCompleted: boolean) => {
    if (!orgId) return;
    try {
      await apiService.toggleOnboardingTask(orgId, taskId, !currentCompleted);
      await loadTasks(selectedUser);
    } catch (e) {
      alert("Failed to toggle task");
    }
  };

  const handleSeedChecklist = async () => {
    if (!orgId || !selectedUser) return;
    setLoading(true);
    try {
      await apiService.seedOnboardingChecklist(orgId, selectedUser);
      await loadTasks(selectedUser);
    } catch (e) {
      alert("Failed to seed checklist");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !selectedUser || !newTaskName) return;
    setLoading(true);
    try {
      await apiService.createOnboardingTask(orgId, {
        username: selectedUser,
        taskName: newTaskName,
        category: newTaskCategory,
        completed: false
      });
      setNewTaskName("");
      await loadTasks(selectedUser);
    } catch (e) {
      alert("Failed to create custom task");
    } finally {
      setLoading(false);
    }
  };

  // Completion calculation
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount * 100) / totalCount) : 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Onboarding Center" 
        description={
          isAdmin 
            ? "Configure, audit, and track onboarding readiness stubs for all newly joined employees."
            : "Review your day-one checklist steps, asset allocations, and welcome guide activities."
        }
      />

      {isAdmin && (
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Manage Employee Workspace</CardTitle>
            <CardDescription>Select an employee profile to audit their checklist.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full sm:w-72">
              <Select value={selectedUser} onValueChange={handleSelectUser}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-white">
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.username}>{emp.username} ({emp.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {tasks.length === 0 && selectedUser && (
              <Button size="sm" onClick={handleSeedChecklist} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer">
                <Sparkles className="mr-1.5 h-4 w-4" /> Auto-Seed Default 6-Step Checklist
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {selectedUser && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Checklist View */}
          <Card className="md:col-span-2 bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <User className="h-4 w-4 text-indigo-500" />
                    Onboarding Roster: {selectedUser}
                  </CardTitle>
                  <CardDescription>Checklist progress overview.</CardDescription>
                </div>
                <Badge variant="outline" className={progressPercent === 100 ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"}>
                  {completedCount}/{totalCount} Completed
                </Badge>
              </div>
              <div className="pt-3 space-y-1">
                <Progress value={progressPercent} className="h-2 bg-slate-950" />
                <span className="text-[10px] text-slate-400">{progressPercent}% complete</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {tasks.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <ClipboardCheck className="h-10 w-10 text-slate-500 mx-auto" />
                  <h3 className="text-sm font-semibold text-slate-350">No Checklist Found</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {isAdmin 
                      ? "This employee has no onboarding tasks. Click 'Auto-Seed' above to populate default check-lists."
                      : "Your onboarding checklist has not been configured by HR yet."}
                  </p>
                </div>
              ) : (
                CATEGORIES.map(cat => {
                  const catTasks = tasks.filter(t => t.category === cat.key);
                  const Icon = cat.icon;
                  return (
                    <div key={cat.key} className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Icon className="h-4 w-4 text-indigo-400" />
                        {cat.label}
                      </h4>
                      <div className="grid grid-cols-1 gap-2 pl-5.5">
                        {catTasks.map(t => (
                          <div 
                            key={t.id} 
                            onClick={() => (isAdmin || t.username === loggedInUsername) && handleToggleTask(t.id, t.completed)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-xs group ${
                              t.completed 
                                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400/80 line-through shadow-inner" 
                                : "bg-slate-900/60 border-slate-800 text-slate-100 hover:bg-slate-850 hover:border-indigo-500/50 shadow-sm"
                            } ${isAdmin || t.username === loggedInUsername ? 'cursor-pointer' : ''}`}
                          >
                            {t.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                            )}
                            {t.taskName}
                          </div>
                        ))}
                        {catTasks.length === 0 && (
                          <span className="text-[10px] text-slate-500 italic">No tasks in this category</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* HR Add Custom Task Form Panel */}
          {isAdmin && (
            <Card className="bg-slate-900/40 border-slate-800 h-fit">
              <CardHeader>
                <CardTitle className="text-sm">Add Custom Task</CardTitle>
                <CardDescription>Assign a unique onboarding checklist item to {selectedUser}.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCustomTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-name" className="text-xs text-slate-350">Task Description</Label>
                    <Input 
                      id="task-name" 
                      placeholder="e.g. Set up Git SSH keys" 
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-cat" className="text-xs text-slate-350">Category</Label>
                    <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                      <SelectTrigger id="task-cat" className="bg-slate-950 border-slate-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        {CATEGORIES.map(c => (
                          <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add to Checklist
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
