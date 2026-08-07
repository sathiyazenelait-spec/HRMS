import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus, Users, ShieldAlert, BadgeAlert, Sparkles, User, Award, Percent, Layers, Landmark, Network } from "lucide-react";
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

export const Route = createFileRoute("/_app/teams")({
  head: () => ({
    meta: [
      { title: "Organization Directory & Teams · Zenelait HRMS" },
      { name: "description", content: "Departments, sub-teams, skills matrix, and staffing allocations." },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [squads, setSquads] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [employees, setEmployees] = useState<APIUser[]>([]);

  // Department Form State
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptDesc, setNewDeptDesc] = useState("");
  const [newDeptLead, setNewDeptLead] = useState("");

  // Squad Form State
  const [newSquadName, setNewSquadName] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [newSquadLead, setNewSquadLead] = useState("");
  const [newSquadSkills, setNewSquadSkills] = useState("");

  // Staffing Form State
  const [selectedStaffUser, setSelectedStaffUser] = useState("");
  const [selectedSquadId, setSelectedSquadId] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [allocation, setAllocation] = useState("100");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      const filteredUsers = uList.filter(u => u.role !== "SUPERADMIN");
      setEmployees(filteredUsers);

      const deptList = await apiService.getDepartments(orgId);
      setDepartments(deptList);

      const squadList = await apiService.getSquads(orgId);
      setSquads(squadList);

      const memList = await apiService.getSquadMemberships(orgId);
      setMemberships(memList);

      if (filteredUsers.length > 0) {
        setSelectedStaffUser(filteredUsers[0].username);
        setNewDeptLead(filteredUsers[0].username);
        setNewSquadLead(filteredUsers[0].username);
      }
      if (deptList.length > 0) {
        setSelectedDeptId(String(deptList[0].id));
      }
      if (squadList.length > 0) {
        setSelectedSquadId(String(squadList[0].id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newDeptName) return;
    setLoading(true);
    try {
      await apiService.saveDepartment(orgId, {
        name: newDeptName,
        description: newDeptDesc,
        managerUsername: newDeptLead
      });
      setNewDeptName("");
      setNewDeptDesc("");
      await loadData();
    } catch (e) {
      alert("Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newSquadName || !selectedDeptId) return;
    setLoading(true);
    try {
      await apiService.saveSquad(orgId, {
        name: newSquadName,
        departmentId: parseInt(selectedDeptId),
        leadUsername: newSquadLead,
        skillsMatrix: newSquadSkills
      });
      setNewSquadName("");
      setNewSquadSkills("");
      await loadData();
    } catch (e) {
      alert("Failed to create squad");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !selectedStaffUser || !selectedSquadId || !roleTitle) return;
    setLoading(true);
    try {
      await apiService.saveSquadMembership(orgId, {
        squadId: parseInt(selectedSquadId),
        username: selectedStaffUser,
        roleTitle,
        allocationPercentage: parseInt(allocation)
      });
      setRoleTitle("");
      setAllocation("100");
      await loadData();
    } catch (e) {
      alert("Failed to assign staff member");
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const totalStaffed = new Set(memberships.map(m => m.username)).size;
  const avgAllocation = memberships.length > 0
    ? Math.round(memberships.reduce((sum, m) => sum + m.allocationPercentage, 0) / memberships.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Departments &Squad Structure" 
        description="Audit agile staffing allocations, view required skill matrices, and map cross-department structures dynamically."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Departments</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-slate-100">{departments.length}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Active Squads</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-indigo-300">{squads.length}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-400 font-semibold">Staffed Members</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-emerald-300">{totalStaffed}</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Capacity Allocation</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-amber-300">{avgAllocation}%</span>
            <Percent className="h-4 w-4 text-amber-400" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dynamic Org Chart Layout */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Network className="h-4 w-4 text-indigo-500" />
                Organization squads structure
              </CardTitle>
              <CardDescription>Casserole structure showing departments, squads, leads and team staffing.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {departments.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No departments created yet. Seed details or use forms to catalog.
                </div>
              ) : (
                departments.map(dept => {
                  const deptSquads = squads.filter(s => s.departmentId === dept.id);
                  return (
                    <div key={dept.id} className="space-y-4 border-l border-slate-800 pl-4 ml-2 relative">
                      <div className="absolute top-2 -left-1.5 h-3 w-3 rounded-full bg-indigo-500 border border-slate-950" />
                      
                      {/* Department Title */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                            <Layers className="h-4 w-4 text-indigo-400" />
                            {dept.name} Department
                          </h3>
                          <p className="text-[10px] text-slate-450">{dept.description}</p>
                        </div>
                        <Badge className="bg-slate-950 border border-slate-800 text-[10px] text-slate-400 self-start">
                          Manager: {dept.managerUsername}
                        </Badge>
                      </div>

                      {/* Squads under Department */}
                      <div className="grid grid-cols-1 gap-3 pl-4 pt-1">
                        {deptSquads.map(sq => {
                          const sqMembers = memberships.filter(m => m.squadId === sq.id);
                          return (
                            <div key={sq.id} className="p-3 bg-slate-950/60 rounded-lg border border-slate-900 space-y-2.5">
                              <div className="flex justify-between items-baseline gap-2">
                                <h4 className="text-xs font-bold text-indigo-300">{sq.name}</h4>
                                <span className="text-[9px] text-slate-500 font-medium">Lead: {sq.leadUsername}</span>
                              </div>
                              
                              {/* Skills matrix tags */}
                              {sq.skillsMatrix && (
                                <div className="flex flex-wrap gap-1">
                                  {sq.skillsMatrix.split(",").map((sk: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-[8px] bg-slate-900 border-slate-800 text-slate-400 py-0 px-1">
                                      {sk.trim()}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {/* Members logged */}
                              <div className="space-y-1.5 pt-1 border-t border-slate-900/60">
                                {sqMembers.map(m => (
                                  <div key={m.id} className="flex justify-between items-center text-[10px] text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3 text-slate-500" />
                                      <span className="font-semibold text-slate-300">{m.username}</span>
                                      <span className="text-slate-500">({m.roleTitle})</span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={m.allocationPercentage} className="h-1 bg-slate-900 w-12" />
                                      <span className="font-medium text-slate-350">{m.allocationPercentage}% staffed</span>
                                    </div>
                                  </div>
                                ))}
                                {sqMembers.length === 0 && (
                                  <span className="text-[9px] text-slate-500 italic">No staffed members assigned</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {deptSquads.length === 0 && (
                          <span className="text-[10px] text-slate-500 italic pl-2">No active squads cataloged</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* HR Operations Sidebar */}
        <div className="space-y-6">
          {isAdmin && (
            <>
              {/* Form 1: Add Department */}
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-indigo-400">Catalog Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateDept} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="dept-name" className="text-[10px] text-slate-400">Department Name</Label>
                      <Input 
                        id="dept-name" 
                        placeholder="e.g. Product Design" 
                        className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dept-desc" className="text-[10px] text-slate-400">Description</Label>
                      <Input 
                        id="dept-desc" 
                        placeholder="e.g. UX/UI and user research..." 
                        className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                        value={newDeptDesc}
                        onChange={(e) => setNewDeptDesc(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="dept-lead" className="text-[10px] text-slate-400">Manager / Lead</Label>
                      <Select value={newDeptLead} onValueChange={setNewDeptLead}>
                        <SelectTrigger id="dept-lead" className="bg-slate-950 border-slate-800 text-xs text-white h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-white">
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.username}>{emp.username}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 text-[10px] h-8 cursor-pointer" disabled={loading}>
                      Create Department
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Form 2: Add Squad */}
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-indigo-400">Catalog Squad / Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateSquad} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="squad-name" className="text-[10px] text-slate-400">Squad Name</Label>
                      <Input 
                        id="squad-name" 
                        placeholder="e.g. Analytics Squad" 
                        className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                        value={newSquadName}
                        onChange={(e) => setNewSquadName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="squad-dept" className="text-[10px] text-slate-400">Department parent</Label>
                      <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                        <SelectTrigger id="squad-dept" className="bg-slate-950 border-slate-800 text-xs text-white h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-white">
                          {departments.map(d => (
                            <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="squad-lead" className="text-[10px] text-slate-400">Lead Username</Label>
                      <Select value={newSquadLead} onValueChange={setNewSquadLead}>
                        <SelectTrigger id="squad-lead" className="bg-slate-950 border-slate-800 text-xs text-white h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-white">
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.username}>{emp.username}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="squad-skills" className="text-[10px] text-slate-400">Skills Matrix (comma-separated)</Label>
                      <Input 
                        id="squad-skills" 
                        placeholder="e.g. Python, SQL, Tableau" 
                        className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                        value={newSquadSkills}
                        onChange={(e) => setNewSquadSkills(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 text-[10px] h-8 cursor-pointer" disabled={loading}>
                      Create Squad
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Form 3: Assign Membership Staff */}
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-indigo-400">Assign Member Staff</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAssignStaff} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="staff-user" className="text-[10px] text-slate-400">Employee Select</Label>
                      <Select value={selectedStaffUser} onValueChange={setSelectedStaffUser}>
                        <SelectTrigger id="staff-user" className="bg-slate-950 border-slate-800 text-xs text-white h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-white">
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.username}>{emp.username}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="staff-squad" className="text-[10px] text-slate-400">Target Squad / Team</Label>
                      <Select value={selectedSquadId} onValueChange={setSelectedSquadId}>
                        <SelectTrigger id="staff-squad" className="bg-slate-950 border-slate-800 text-xs text-white h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-white">
                          {squads.map(s => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="staff-role" className="text-[10px] text-slate-400">Role Title</Label>
                      <Input 
                        id="staff-role" 
                        placeholder="e.g. Senior QA Engineer" 
                        className="bg-slate-950 border-slate-800 text-xs text-white h-8"
                        value={roleTitle}
                        onChange={(e) => setRoleTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-450">
                        <Label htmlFor="staff-allocation">Allocation percentage</Label>
                        <span className="font-semibold text-indigo-400">{allocation}%</span>
                      </div>
                      <input 
                        id="staff-allocation" 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="10" 
                        className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                        value={allocation}
                        onChange={(e) => setAllocation(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 text-[10px] h-8 cursor-pointer" disabled={loading}>
                      Assign Staff Allocation
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          )}

          {!isAdmin && (
            <Card className="bg-indigo-950/20 border-indigo-900/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-indigo-450 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  Staffing Allocations Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-400 leading-relaxed space-y-2">
                <p>
                  As a team member, your primary allocation is managed dynamically by your department lead. You may be staffed across multiple squads (for example, splitting capacity 50% between Platform and Core teams).
                </p>
                <div className="flex gap-1 items-center font-semibold text-slate-200">
                  <BadgeAlert className="h-3.5 w-3.5 text-indigo-450" />
                  <span>Reporting conflicts:</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Contact your primary department manager if there are workload conflicts across your current squad allocations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
