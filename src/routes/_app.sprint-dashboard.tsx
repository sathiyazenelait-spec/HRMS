import { createFileRoute } from "@tanstack/react-router";
import { GaugeCircle, Sparkles, TrendingUp, BarChart3, Users, Award } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiService } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/sprint-dashboard")({
  head: () => ({
    meta: [
      { title: "Sprint Analytics · Zenelait HRMS" },
      { name: "description", content: "Agile burndown logs, developer story point velocities, and load trackers." },
    ],
  }),
  component: SprintDashboardPage,
});

function SprintDashboardPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;

  const [tickets, setTickets] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!orgId) return;
      setLoading(true);
      try {
        const tData = await apiService.getTickets(orgId);
        setTickets(tData);

        const sData = await apiService.getSprints(orgId);
        setSprints(sData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orgId]);

  // Calculate sprint diagnostic metrics
  const activeSprint = sprints.find((s) => s.status === "Active") || { name: "No Active Sprint", goal: "N/A" };
  
  const sprintTickets = tickets.filter((t) => t.sprintId === activeSprint.id || t.sprintId === "sprint-2");
  const totalPoints = sprintTickets.reduce((acc, t) => acc + t.points, 0);
  const donePoints = sprintTickets.filter((t) => t.status === "Done").reduce((acc, t) => acc + t.points, 0);
  const progressPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // Recharts Burndown Data (Day 1 to 10 of sprint)
  const burndownData = [
    { day: "Day 1", Planned: totalPoints, Actual: totalPoints },
    { day: "Day 2", Planned: Math.max(0, totalPoints - 2), Actual: totalPoints },
    { day: "Day 3", Planned: Math.max(0, totalPoints - 4), Actual: Math.max(0, totalPoints - 3) },
    { day: "Day 4", Planned: Math.max(0, totalPoints - 6), Actual: Math.max(0, totalPoints - 3) },
    { day: "Day 5", Planned: Math.max(0, totalPoints - 8), Actual: Math.max(0, totalPoints - 3) },
    { day: "Day 6", Planned: Math.max(0, totalPoints - 10), Actual: Math.max(0, totalPoints - 6) },
    { day: "Day 7", Planned: Math.max(0, totalPoints - 12), Actual: Math.max(0, totalPoints - 11) },
    { day: "Day 8", Planned: Math.max(0, totalPoints - 14), Actual: Math.max(0, totalPoints - 11) },
    { day: "Day 9", Planned: Math.max(0, totalPoints - 16), Actual: Math.max(0, totalPoints - 14) },
    { day: "Day 10", Planned: 0, Actual: Math.max(0, totalPoints - donePoints) },
  ];

  // Recharts Velocity Data (Past Sprints)
  const velocityData = [
    { name: "Sprint 1", Planned: 15, Completed: 15 },
    { name: "Sprint 2 (Current)", Planned: totalPoints || 16, Completed: donePoints || 11 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Sprint Execution Analytics" 
        description={`Performance indicators for the active iteration: ${activeSprint.name}.`} 
      />

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Sprint Points</span>
            <div className="text-2xl font-extrabold text-foreground">{totalPoints} SP</div>
            <span className="text-[10px] text-muted-foreground">Target workload scoped</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Burned Points (Done)</span>
            <div className="text-2xl font-extrabold text-emerald-500">{donePoints} SP</div>
            <span className="text-[10px] text-muted-foreground">Developer tickets completed</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sprint Burn Velocity</span>
            <div className="text-2xl font-extrabold text-indigo-400">{progressPct}%</div>
            <span className="text-[10px] text-muted-foreground">Completion percentage rate</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col gap-1.5">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sprint Goal Metric</span>
            <div className="text-sm font-bold text-foreground leading-snug truncate">{activeSprint.goal}</div>
            <span className="text-[10px] text-muted-foreground">Scrum iteration scope target</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Burndown line chart */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Scrum Sprint Burndown (Remaining SP)
            </CardTitle>
            <CardDescription>Visual comparison of ideal burn gradient vs actual story points completed.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} labelStyle={{ color: "#94a3b8" }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Area type="monotone" dataKey="Planned" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPlanned)" />
                <Area type="monotone" dataKey="Actual" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Velocity bar chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-1.5">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Scrum Velocity History
            </CardTitle>
            <CardDescription>Story points scoped vs points successfully delivered per iteration.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Planned" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
