import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FolderKanban, Plus, Trash2, Edit2, CheckCircle2, TrendingUp, Users, Target, ShieldAlert } from "lucide-react";
import { apiService, Project } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({
    meta: [
      { title: "Projects · Meridian HR" },
      { name: "description", content: "Projects, budgets, teams and managers." },
    ],
  }),
  component: ProjectsDashboard,
});

function ProjectsDashboard() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isHR = currentUser?.role === "ADMIN";

  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectBudget, setProjectBudget] = useState(0);
  const [projectSpent, setProjectSpent] = useState(0);
  const [projectOwner, setProjectOwner] = useState("");
  const [projectStatus, setProjectStatus] = useState<"GREEN" | "AMBER" | "RED">("GREEN");
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);

  useEffect(() => {
    if (orgId) {
      loadProjects();
      loadUsers();
    }
  }, [orgId]);

  const loadProjects = async () => {
    try {
      const data = await apiService.getProjects(orgId!);
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Get all employees/users of this org
      const data = await apiService.getUsers(orgId!);
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(undefined);
    setProjectName("");
    setProjectDesc("");
    setProjectBudget(10000);
    setProjectSpent(0);
    setProjectOwner(users[0]?.username || currentUser?.username || "");
    setProjectStatus("GREEN");
    setSelectedTeam([]);
    setSelectedMilestones(["Charter", "Scope"]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingId(proj.id);
    setProjectName(proj.name);
    setProjectDesc(proj.description || "");
    setProjectBudget(proj.budget);
    setProjectSpent(proj.spent);
    setProjectOwner(proj.owner);
    setProjectStatus(proj.status);
    setSelectedTeam(proj.teamMembers ? proj.teamMembers.split(",") : []);
    setSelectedMilestones(proj.milestones ? proj.milestones.split(",") : []);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;

    const payload: Project = {
      id: editingId,
      name: projectName,
      description: projectDesc,
      budget: projectBudget,
      spent: projectSpent,
      owner: projectOwner,
      status: projectStatus,
      teamMembers: selectedTeam.join(","),
      milestones: selectedMilestones.join(","),
      organizationId: orgId,
    };

    try {
      await apiService.saveProject(payload);
      setIsFormOpen(false);
      loadProjects();
    } catch (e) {
      alert("Failed to save project");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await apiService.deleteProject(id);
      loadProjects();
    } catch (e) {
      alert("Failed to delete project");
    }
  };

  const toggleTeamMember = (username: string) => {
    if (selectedTeam.includes(username)) {
      setSelectedTeam(selectedTeam.filter((u) => u !== username));
    } else {
      setSelectedTeam([...selectedTeam, username]);
    }
  };

  const toggleMilestone = (milestone: string) => {
    if (selectedMilestones.includes(milestone)) {
      setSelectedMilestones(selectedMilestones.filter((m) => m !== milestone));
    } else {
      setSelectedMilestones([...selectedMilestones, milestone]);
    }
  };

  // Calculations
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
  const burnRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const healthRatio = projects.length > 0 
    ? Math.round((projects.filter((p) => p.status === "GREEN").length / projects.length) * 100)
    : 100;

  return (
    <div className="space-y-6 text-left">
      <PageHeader 
        title="Projects Portfolio" 
        description="Portfolio view of every project with owners, budgets, RAG status and milestone delivery health."
        actions={isHR && (
          <Button onClick={handleOpenCreate} className="gap-1 bg-indigo-600 hover:bg-indigo-500 cursor-pointer">
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        )}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Active Projects</span>
              <FolderKanban className="h-4 w-4 text-indigo-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{projects.length}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Directly connected to DB</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Total Budget Allocated</span>
              <Target className="h-4 w-4 text-emerald-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">₹{totalBudget.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Capital resources deployed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Total Capital Burned</span>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">₹{totalSpent.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">{burnRate}% overall consumption</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Healthy Projects</span>
              <ShieldAlert className="h-4 w-4 text-indigo-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{healthRatio}%</div>
            <p className="text-[10px] text-muted-foreground mt-1">Status rated as GREEN</p>
          </CardContent>
        </Card>
      </div>

      {/* Inline Creation / Edition Form Overlay Card */}
      {isFormOpen && (
        <Card className="border border-indigo-500/30 bg-slate-900/40 backdrop-blur shadow-2xl p-6 relative">
          <h3 className="font-bold text-sm text-foreground mb-4">
            {editingId ? "Edit Project Details" : "Configure New Project"}
          </h3>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">Project Name</label>
                <Input
                  required
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Core Migration"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">Budget (₹)</label>
                <Input
                  required
                  type="number"
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-muted-foreground">Description</label>
              <textarea
                rows={2}
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                placeholder="Details about scope, objectives..."
                className="w-full text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-2 outline-none text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">Project Owner</label>
                <select
                  value={projectOwner}
                  onChange={(e) => setProjectOwner(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  {users.map((u) => (
                    <option key={u.username} value={u.username}>{u.username} ({u.role})</option>
                  ))}
                  {users.length === 0 && (
                    <option value={currentUser?.username}>{currentUser?.username}</option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">Capital Burned (Spent ₹)</label>
                <Input
                  required
                  type="number"
                  value={projectSpent}
                  onChange={(e) => setProjectSpent(Number(e.target.value))}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-muted-foreground">RAG Status</label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value as any)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none text-foreground"
                >
                  <option value="GREEN">GREEN (On Track)</option>
                  <option value="AMBER">AMBER (Minor Risks)</option>
                  <option value="RED">RED (Critical Delay)</option>
                </select>
              </div>
            </div>

            {/* Team select */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-muted-foreground mb-1">Assign Team Members</label>
              <div className="flex flex-wrap gap-1.5 p-2 border border-slate-800 rounded-lg bg-slate-950/40 max-h-24 overflow-y-auto">
                {users.map((u) => {
                  const active = selectedTeam.includes(u.username);
                  return (
                    <Badge
                      key={u.username}
                      variant={active ? "default" : "outline"}
                      className="cursor-pointer text-[10px] font-semibold py-0.5 px-2 hover:opacity-80"
                      onClick={() => toggleTeamMember(u.username)}
                    >
                      {u.username}
                    </Badge>
                  );
                })}
                {users.length === 0 && (
                  <span className="text-[10px] text-muted-foreground font-semibold">No employees configured. create some in account settings first!</span>
                )}
              </div>
            </div>

            {/* Milestones toggling list */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-muted-foreground mb-1">Milestones Completed</label>
              <div className="flex flex-wrap gap-2">
                {["Charter", "Scope", "Design", "Dev", "QA", "UAT", "Launch"].map((mile) => {
                  const active = selectedMilestones.includes(mile);
                  return (
                    <button
                      key={mile}
                      type="button"
                      onClick={() => toggleMilestone(mile)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold cursor-pointer transition-colors ${
                        active 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-450" 
                          : "bg-slate-950 border-slate-800 text-slate-500"
                      }`}
                    >
                      <CheckCircle2 className={`h-3 w-3 ${active ? "text-emerald-450" : "text-slate-500"}`} />
                      {mile}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">
                Save Project
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-10 font-semibold text-xs text-muted-foreground">Loading projects portfolio...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-3 text-center py-10 border border-dashed rounded-xl bg-slate-900/10 text-xs text-muted-foreground font-semibold">
            No projects registered. Click "Add Project" above to create one.
          </div>
        ) : (
          projects.map((proj) => {
            const burnPct = proj.budget > 0 ? Math.min(100, Math.round((proj.spent / proj.budget) * 100)) : 0;
            const team = proj.teamMembers ? proj.teamMembers.split(",") : [];
            const miles = proj.milestones ? proj.milestones.split(",") : [];
            return (
              <Card key={proj.id} className="relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                      <Users className="h-3 w-3" /> owner: <strong>{proj.owner}</strong>
                    </span>
                    <Badge variant={proj.status === "GREEN" ? "default" : proj.status === "AMBER" ? "secondary" : "destructive"} className="text-[9px] font-bold py-0 px-1.5 leading-none">
                      {proj.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-extrabold text-foreground mt-2">{proj.name}</CardTitle>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1 min-h-[30px] font-medium">{proj.description}</p>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
                  {/* Budget Spent */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>Burn Rate: {burnPct}%</span>
                      <span>₹{proj.spent.toLocaleString()} / ₹{proj.budget.toLocaleString()}</span>
                    </div>
                    <Progress value={burnPct} />
                  </div>

                  {/* Team Members List */}
                  {team.length > 0 && (
                    <div className="space-y-1 text-[10px]">
                      <span className="font-bold text-muted-foreground block">Project Team:</span>
                      <div className="flex flex-wrap gap-1">
                        {team.map((member) => (
                          <Badge key={member} variant="secondary" className="text-[9px] font-semibold py-0.5 px-1.5">
                            {member}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestones list */}
                  {miles.length > 0 && (
                    <div className="space-y-1 text-[10px]">
                      <span className="font-bold text-muted-foreground block">Completed Milestones:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {miles.map((m) => (
                          <span key={m} className="inline-flex items-center gap-0.5 text-emerald-450 font-bold bg-emerald-500/5 border border-emerald-500/10 rounded-md py-0.5 px-1.5 text-[9px]">
                            ✓ {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Controls */}
                  {isHR && (
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleOpenEdit(proj)} className="p-2 cursor-pointer h-7 text-[10px] font-bold">
                        <Edit2 className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => proj.id && handleDelete(proj.id)} className="p-2 cursor-pointer h-7 text-[10px] font-bold">
                        <Trash2 className="h-3 w-3" /> Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
