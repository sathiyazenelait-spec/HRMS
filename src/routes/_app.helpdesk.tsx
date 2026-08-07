import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, Plus, ShieldAlert, Sparkles, User, Calendar, Check, AlertTriangle, FileText, CheckCircle2, Ticket, LifeBuoy, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/helpdesk")({
  head: () => ({
    meta: [
      { title: "Help Desk & Grievances · Zenelait HRMS" },
      { name: "description", content: "Raise internal employee support tickets and track HR, IT, and Finance resolution." },
    ],
  }),
  component: HelpdeskPage,
});

function HelpdeskPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);

  // Raise Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT");
  const [priority, setPriority] = useState("Medium");

  // Filter State
  const [filterCategory, setFilterCategory] = useState("All");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const list = await apiService.getHelpdeskTickets(orgId);
      setTickets(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !title || !description) return;
    setLoading(true);
    try {
      await apiService.saveHelpdeskTicket(orgId, {
        username: loggedInUsername,
        title,
        description,
        category,
        priority,
      });
      setTitle("");
      setDescription("");
      await loadData();
    } catch (e) {
      alert("Failed to raise support ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    if (!orgId) return;
    setLoading(true);
    try {
      await apiService.saveHelpdeskTicket(orgId, {
        id,
        status,
        title: "", // Dummy placeholder matching backend validation parameters
        description: "",
        category: "IT",
        priority: "Medium",
      });
      await loadData();
    } catch (e) {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalCount = tickets.length;
  const openCount = tickets.filter(t => t.status === "Open").length;
  const progressCount = tickets.filter(t => t.status === "In Progress").length;
  const resolvedCount = tickets.filter(t => t.status === "Resolved").length;

  // Filter lists
  const displayedTickets = tickets.filter(t => {
    if (filterCategory === "All") return true;
    return t.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Help Desk & Support Tickets" 
        description="File internal workplace grievances, route tickets to HR, IT, or Finance departments, and track resolution timelines."
      />

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Total Tickets raised</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-slate-100">{totalCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-rose-450 font-semibold">Awaiting Intake (Open)</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-rose-450">{openCount}</span>
            <AlertTriangle className="h-4 w-4 text-rose-450" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">In Progress processing</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-amber-300">{progressCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-450 font-semibold">Resolved grievances</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-emerald-400">{resolvedCount}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Raise ticket Form */}
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Raise Support Ticket</CardTitle>
              <CardDescription>File grievances directly to administrative managers.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRaiseTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ticket-title" className="text-xs text-slate-350">Summary Title</Label>
                  <Input 
                    id="ticket-title" 
                    placeholder="e.g. Keyboard keys not responding" 
                    className="bg-slate-950 border-slate-800 text-xs text-white" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ticket-category" className="text-xs text-slate-350">Category routing</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="ticket-category" className="bg-slate-950 border-slate-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        <SelectItem value="IT">IT Infrastructure</SelectItem>
                        <SelectItem value="HR">HR Department</SelectItem>
                        <SelectItem value="Finance">Finance / Payroll</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ticket-priority" className="text-xs text-slate-350">Priority SLA</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="ticket-priority" className="bg-slate-950 border-slate-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        <SelectItem value="Low">Low Priority</SelectItem>
                        <SelectItem value="Medium">Medium Priority</SelectItem>
                        <SelectItem value="High">High SLA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ticket-desc" className="text-xs text-slate-350">Detailed Description</Label>
                  <Textarea 
                    id="ticket-desc" 
                    placeholder="Please details your request specifics..." 
                    className="bg-slate-950 border-slate-800 text-xs text-white h-28" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                  File Grievance Ticket
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Timeline logs */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <LifeBuoy className="h-4 w-4 text-indigo-500" />
                  Support Grievance Timeline
                </CardTitle>
                <CardDescription>Monitor resolution statuses of active tickets from MySQL.</CardDescription>
              </div>
              <div className="w-full sm:w-44">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                    <SelectValue placeholder="Category routing" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="IT">IT Infrastructure</SelectItem>
                    <SelectItem value="HR">HR Department</SelectItem>
                    <SelectItem value="Finance">Finance / Payroll</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {displayedTickets.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No grievances raised under this category filter.
                </div>
              ) : (
                displayedTickets.map(t => {
                  const catColor = 
                    t.category === "IT" ? "bg-blue-500/10 text-blue-450 border border-blue-500/20" :
                    t.category === "HR" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                    "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"; // Finance
                  
                  const priorityColor = 
                    t.priority === "High" ? "bg-rose-500/15 text-rose-450 border border-rose-500/20" :
                    t.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    "bg-slate-900 text-slate-500";

                  return (
                    <div key={t.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 space-y-2.5">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className={`${catColor} text-[8px] font-semibold uppercase tracking-wider`}>
                            {t.category}
                          </Badge>
                          <Badge variant="outline" className={`${priorityColor} text-[8px] font-semibold`}>
                            {t.priority} SLA
                          </Badge>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {t.username}
                          </span>
                        </div>
                        <Badge className={
                          t.status === "Open" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          t.status === "In Progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }>
                          {t.status}
                        </Badge>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100">{t.title}</h4>
                      <p className="text-xs text-slate-350 leading-relaxed">{t.description}</p>

                      {isAdmin && t.status !== "Resolved" && (
                        <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-900/60">
                          {t.status === "Open" && (
                            <Button
                              size="sm"
                              className="bg-amber-650 hover:bg-amber-600 text-[9px] h-6 cursor-pointer"
                              onClick={() => handleUpdateStatus(t.id, "In Progress")}
                              disabled={loading}
                            >
                              In Progress
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="bg-emerald-650 hover:bg-emerald-600 text-[9px] h-6 cursor-pointer"
                            onClick={() => handleUpdateStatus(t.id, "Resolved")}
                            disabled={loading}
                          >
                            Resolve Grievance
                          </Button>
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
