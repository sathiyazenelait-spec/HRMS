import { createFileRoute } from "@tanstack/react-router";
import { NotebookPen, Plus, ShieldAlert, BadgeAlert, Sparkles, User, Calendar, Clock, AlertTriangle, CheckCircle, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User as APIUser } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/worklog")({
  head: () => ({
    meta: [
      { title: "Daily Work Updates & Logs · Zenelait HRMS" },
      { name: "description", content: "One place for daily status, logged hours, and development blockers." },
    ],
  }),
  component: WorkLogPage,
});

function WorkLogPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [workLogs, setWorkLogs] = useState<any[]>([]);
  const [employees, setEmployees] = useState<APIUser[]>([]);

  // Submission Form State
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [hoursSpent, setHoursSpent] = useState("8.0");
  const [whatDone, setWhatDone] = useState("");
  const [whatNext, setWhatNext] = useState("");
  const [blockers, setBlockers] = useState("None");

  // Filtering logs
  const [filterUser, setFilterUser] = useState(isAdmin ? "All" : loggedInUsername);

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      setEmployees(uList.filter(u => u.role !== "SUPERADMIN"));

      const logs = await apiService.getWorkLogs(orgId);
      setWorkLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !logDate || !whatDone || !whatNext) return;
    setLoading(true);
    try {
      await apiService.saveWorkLog(orgId, {
        username: loggedInUsername,
        logDate,
        whatDone,
        whatNext,
        blockers,
        hoursSpent: parseFloat(hoursSpent),
      });
      setWhatDone("");
      setWhatNext("");
      setBlockers("None");
      setHoursSpent("8.0");
      await loadData();
    } catch (e) {
      alert("Failed to save work update log");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Logs List
  const displayedLogs = workLogs.filter(log => {
    if (filterUser === "All") return true;
    return log.username === filterUser;
  });

  // Calculate Metrics
  const todayStr = new Date().toISOString().split("T")[0];
  const loggedToday = workLogs
    .filter(log => log.logDate === todayStr && log.username === loggedInUsername)
    .reduce((sum, log) => sum + log.hoursSpent, 0);

  const totalUpdates = displayedLogs.length;
  const activeBlockersCount = displayedLogs.filter(log => log.blockers && log.blockers.toLowerCase() !== "none").length;
  const avgContribution = displayedLogs.length > 0
    ? (displayedLogs.reduce((sum, log) => sum + log.hoursSpent, 0) / displayedLogs.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Daily Work Log updates" 
        description="Share daily progress summaries, track hours logged, and escalate roadblocks or team blockers."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Hours Logged Today</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-slate-100">{loggedToday}h</span>
            <Clock className="h-4 w-4 text-slate-500" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Total Updates</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-indigo-300">{totalUpdates}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Roadblocks / Blockers</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-amber-300">{activeBlockersCount} flagged</span>
            {activeBlockersCount > 0 && <AlertTriangle className="h-4 w-4 text-amber-400 animate-bounce" />}
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-400 font-semibold">Average Log hours</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-emerald-300">{avgContribution}h</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Log Submission Form */}
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Submit Work Update</CardTitle>
              <CardDescription>Log your daily progress checkpoints.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitLog} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="log-date" className="text-xs text-slate-350">Log Date</Label>
                    <Input 
                      id="log-date" 
                      type="date" 
                      className="bg-slate-950 border-slate-800 text-xs text-white" 
                      value={logDate} 
                      onChange={(e) => setLogDate(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hours" className="text-xs text-slate-350">Hours Spent</Label>
                    <Input 
                      id="hours" 
                      type="number" 
                      step="0.5" 
                      min="0.5" 
                      max="24"
                      className="bg-slate-950 border-slate-800 text-xs text-white" 
                      value={hoursSpent} 
                      onChange={(e) => setHoursSpent(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="done" className="text-xs text-slate-350">What did I do today?</Label>
                  <Textarea 
                    id="done" 
                    placeholder="Describe tasks completed..." 
                    className="bg-slate-950 border-slate-800 text-xs text-white h-20" 
                    value={whatDone} 
                    onChange={(e) => setWhatDone(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="next" className="text-xs text-slate-350">What's next / Tomorrow?</Label>
                  <Textarea 
                    id="next" 
                    placeholder="Describe upcoming activities..." 
                    className="bg-slate-950 border-slate-800 text-xs text-white h-20" 
                    value={whatNext} 
                    onChange={(e) => setWhatNext(e.target.value)} 
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="blocker" className="text-xs text-slate-350">Blockers & Escalations</Label>
                  <Input 
                    id="blocker" 
                    placeholder="e.g. None, or describe blockers..." 
                    className="bg-slate-950 border-slate-800 text-xs text-white" 
                    value={blockers} 
                    onChange={(e) => setBlockers(e.target.value)} 
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                  <Plus className="mr-1.5 h-4 w-4" /> Save Work Log
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Historical Timeline list */}
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Activity Timeline Log
                </CardTitle>
                <CardDescription>Daily updates synced from the database.</CardDescription>
              </div>
              {isAdmin && (
                <div className="w-full sm:w-48">
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                      <SelectValue placeholder="Filter Employee" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="All">All Updates</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.username}>{emp.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {displayedLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No work updates submitted yet. Use the form on the left.
                </div>
              ) : (
                displayedLogs.map((log) => {
                  const hasBlocker = log.blockers && log.blockers.toLowerCase() !== "none";
                  return (
                    <div key={log.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 space-y-3 relative">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] font-semibold flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.username}
                          </Badge>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-650" />
                            {log.logDate}
                          </span>
                        </div>
                        <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] py-0 px-2 font-medium">
                          {log.hoursSpent}h logged
                        </Badge>
                      </div>

                      <div className="space-y-2 text-xs leading-relaxed">
                        <div>
                          <span className="font-semibold text-indigo-300 block text-[10px] uppercase">Completed Tasks</span>
                          <p className="text-slate-350 pl-2 border-l border-slate-800 mt-0.5">{log.whatDone}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-400 block text-[10px] uppercase">Planned Next</span>
                          <p className="text-slate-350 pl-2 border-l border-slate-800 mt-0.5">{log.whatNext}</p>
                        </div>
                      </div>

                      {hasBlocker ? (
                        <div className="p-2.5 rounded bg-amber-500/5 border border-amber-500/15 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-bold text-amber-400 uppercase leading-none block">Flagged Blocker</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">{log.blockers}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>No blockers reported</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
