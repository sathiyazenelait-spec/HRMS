import { createFileRoute } from "@tanstack/react-router";
import { Rocket, Plus, Check, Calendar, Activity, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/sprints")({
  head: () => ({
    meta: [
      { title: "Sprints Management · Zenelait HRMS" },
      { name: "description", content: "Create sprints, track team goals and agile velocities." },
    ],
  }),
  component: SprintsPage,
});

function SprintsPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [success, setSuccess] = useState("");

  const loadSprints = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const data = await apiService.getSprints(orgId);
      setSprints(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSprints();
  }, [orgId]);

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setLoading(true);
    setSuccess("");

    try {
      await apiService.createSprint(orgId, {
        name,
        goal,
        startDate,
        endDate,
        status: "Future",
      });
      setSuccess(`Sprint "${name}" created successfully!`);
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      loadSprints();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      alert("Failed to create sprint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Agile Sprints" 
        description="Schedule sprint iterations, set velocity goals, and manage your scrum timelines." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Sprint form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1.5">
              <Plus className="h-5 w-5 text-indigo-500" />
              Create New Sprint
            </CardTitle>
            <CardDescription>Setup details for the next sprint iteration.</CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-450 font-semibold">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateSprint} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Sprint Name</label>
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sprint 3: Core Security"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Sprint Goal</label>
                <Input
                  type="text"
                  required
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Encrypt sensitive columns"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">Start Date</label>
                <Input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground font-semibold">End Date</label>
                <Input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-xs">
                Initialize Sprint
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sprints checklist table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1.5">
              <Rocket className="h-5 w-5 text-indigo-500" />
              Sprints Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 text-xs text-muted-foreground">Loading sprints...</div>
            ) : sprints.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs font-semibold">No sprints initialized. Use the form to start one.</div>
            ) : (
              <div className="space-y-4">
                {sprints.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-muted/30 bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-muted-foreground/20 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{s.name}</span>
                        <Badge 
                          variant={s.status === "Active" ? "default" : s.status === "Completed" ? "secondary" : "outline"}
                          className={s.status === "Active" ? "bg-indigo-600 text-white" : ""}
                        >
                          {s.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.goal}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-1.5">
                        <Calendar className="h-3 w-3" />
                        <span>{s.startDate} to {s.endDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
