import { createFileRoute } from "@tanstack/react-router";
import { ListTodo, Plus, Check, BadgeAlert, Trophy, ShieldQuestion } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/backlog")({
  head: () => ({
    meta: [
      { title: "Product Backlog · Zenelait HRMS" },
      { name: "description", content: "Agile backlog catalog, user stories, and technical debt lists." },
    ],
  }),
  component: BacklogPage,
});

function BacklogPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;

  const [tickets, setTickets] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [points, setPoints] = useState(3);
  const [priority, setPriority] = useState("Medium");
  const [assignee, setAssignee] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const tData = await apiService.getTickets(orgId);
      setTickets(tData);

      const sData = await apiService.getSprints(orgId);
      setSprints(sData);

      const uData = await apiService.getUsers(orgId);
      setEmployees(uData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setLoading(true);
    setSuccess("");

    try {
      await apiService.createTicket(orgId, {
        title,
        desc,
        points,
        priority,
        assignee: assignee || currentUser?.username || "unassigned",
        sprintId: sprintId || "backlog",
        status: "To Do",
      });
      setSuccess(`Ticket "${title}" successfully raised!`);
      setTitle("");
      setDesc("");
      setPoints(3);
      setPriority("Medium");
      setAssignee("");
      setSprintId("");
      loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      alert("Failed to raise ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Product Backlog" 
        description="Raise tickets, estimate story points, assign developers, and catalog items to active sprints." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Raise Backlog Ticket Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1.5">
              <Plus className="h-5 w-5 text-indigo-500" />
              Raise Backlog Ticket
            </CardTitle>
            <CardDescription>Add stories, bug tasks, or technical debt spikes.</CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-450 font-semibold">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Title</label>
                <Input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Integrate Slack webhooks"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Description</label>
                <textarea
                  required
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Provide scope details..."
                  className="w-full min-h-[70px] text-xs bg-background border border-input rounded-md p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-semibold">Story Points</label>
                  <Input
                    type="number"
                    min={1}
                    max={21}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground font-semibold">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-xs bg-background border border-input rounded-md p-2 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Assignee</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full text-xs bg-background border border-input rounded-md p-2 focus:outline-none"
                >
                  <option value="">Choose Developer</option>
                  {employees.map((emp) => (
                    <option key={emp.username} value={emp.username}>{emp.username}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Sprint Allocation</label>
                <select
                  value={sprintId}
                  onChange={(e) => setSprintId(e.target.value)}
                  className="w-full text-xs bg-background border border-input rounded-md p-2 focus:outline-none"
                >
                  <option value="">Keep in Backlog</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-xs">
                Raise Ticket
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Backlog items catalog */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1.5">
              <ListTodo className="h-5 w-5 text-indigo-500" />
              Backlog Catalog
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 text-xs text-muted-foreground">Loading backlog...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs font-semibold">No backlog tickets found. Raise a ticket.</div>
            ) : (
              <div className="overflow-x-auto border rounded-lg border-muted/30">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="py-2.5 px-3 font-semibold text-muted-foreground">ID</th>
                      <th className="py-2.5 px-3 font-semibold text-muted-foreground">Title</th>
                      <th className="py-2.5 px-3 font-semibold text-muted-foreground">Points</th>
                      <th className="py-2.5 px-3 font-semibold text-muted-foreground">Priority</th>
                      <th className="py-2.5 px-3 font-semibold text-muted-foreground">Assignee</th>
                      <th className="py-2.5 px-3 font-semibold text-muted-foreground text-right">Sprint</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-muted/30">
                    {tickets.map((t) => {
                      const sprintName = sprints.find((s) => s.id === t.sprintId)?.name || "Backlog";
                      return (
                        <tr key={t.id} className="hover:bg-muted/10">
                          <td className="py-3 px-3 font-semibold">{t.id}</td>
                          <td className="py-3 px-3 font-medium">
                            <div>
                              <span>{t.title}</span>
                              <span className="text-[10px] text-muted-foreground block font-normal">{t.desc}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-indigo-400">{t.points} SP</td>
                          <td className="py-3 px-3">
                            <Badge 
                              variant="outline"
                              className={
                                t.priority === "High" 
                                  ? "text-rose-500 border-rose-500/20" 
                                  : t.priority === "Medium" 
                                  ? "text-amber-500 border-amber-500/20" 
                                  : "text-slate-400"
                              }
                            >
                              {t.priority}
                            </Badge>
                          </td>
                          <td className="py-3 px-3 font-semibold text-muted-foreground">{t.assignee}</td>
                          <td className="py-3 px-3 text-right font-medium text-indigo-500">{sprintName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
