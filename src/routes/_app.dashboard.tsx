import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertCircle,
  BadgeCheck,
  CalendarDays,
  DollarSign,
  Rocket,
  Ticket,
  UserMinus,
  UserPlus,
  Users,
  Users2,
  Megaphone,
  Target,
  Factory,
  ShieldAlert,
  Percent,
  Award,
  Layers,
  Lock,
  Activity,
  FolderKanban,
} from "lucide-react";
import { apiService } from "../lib/api-service";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Zenelait HRMS" },
      { name: "description", content: "Company-wide HR, payroll and delivery KPIs at a glance." },
      { property: "og:title", content: "Dashboard · Zenelait HRMS" },
      { property: "og:description", content: "Company-wide HR, payroll and delivery KPIs at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const growth = [
  { m: "Jan", employees: 1180, joiners: 22, exits: 9 },
  { m: "Feb", employees: 1205, joiners: 31, exits: 6 },
  { m: "Mar", employees: 1240, joiners: 44, exits: 9 },
  { m: "Apr", employees: 1268, joiners: 36, exits: 8 },
  { m: "May", employees: 1295, joiners: 39, exits: 12 },
  { m: "Jun", employees: 1322, joiners: 41, exits: 14 },
  { m: "Jul", employees: 1358, joiners: 48, exits: 12 },
  { m: "Aug", employees: 1394, joiners: 45, exits: 9 },
];

const attendance = [
  { d: "Mon", present: 92, remote: 5, absent: 3 },
  { d: "Tue", present: 94, remote: 4, absent: 2 },
  { d: "Wed", present: 90, remote: 7, absent: 3 },
  { d: "Thu", present: 93, remote: 5, absent: 2 },
  { d: "Fri", present: 88, remote: 9, absent: 3 },
  { d: "Sat", present: 41, remote: 3, absent: 56 },
];

const payrollCost = [
  { m: "Mar", cost: 1.82 },
  { m: "Apr", cost: 1.86 },
  { m: "May", cost: 1.91 },
  { m: "Jun", cost: 1.94 },
  { m: "Jul", cost: 1.98 },
  { m: "Aug", cost: 2.05 },
];

const velocity = [
  { s: "S-21", planned: 62, done: 58 },
  { s: "S-22", planned: 66, done: 61 },
  { s: "S-23", planned: 70, done: 72 },
  { s: "S-24", planned: 74, done: 69 },
  { s: "S-25", planned: 78, done: 80 },
  { s: "S-26", planned: 82, done: 79 },
];

const leaves = [
  { name: "Casual", value: 42 },
  { name: "Sick", value: 28 },
  { name: "Earned", value: 55 },
  { name: "WFH", value: 61 },
  { name: "Comp-off", value: 14 },
];

const pipeline = [
  { stage: "Applied", count: 312 },
  { stage: "Screen", count: 148 },
  { stage: "Interview", count: 74 },
  { stage: "Offer", count: 22 },
  { stage: "Hired", count: 11 },
];

const pieColors = [
  "hsl(221 83% 53%)",
  "hsl(160 60% 45%)",
  "hsl(35 92% 55%)",
  "hsl(280 65% 60%)",
  "hsl(340 75% 55%)",
];

function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const currentUser = apiService.getCurrentUser();
  const orgType = currentUser?.organization?.orgType || "IT";
  const orgName = currentUser?.organization?.name || "Zenelait";

  const [sysAlerts, setSysAlerts] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.organization?.id) {
      apiService.getSystemNotifications(currentUser.organization.id)
        .then(setSysAlerts)
        .catch(console.error);

      setStatsLoading(true);
      apiService.getDashboardStats(currentUser.organization.id)
        .then((data) => {
          setDashboardStats(data);
          setStatsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setStatsLoading(false);
        });
    }
  }, [currentUser?.organization?.id]);

  if (currentUser?.role === "EMPLOYEE") {
    return <EmployeeDashboard user={currentUser} />;
  }

  // Data customization based on orgType
  const stats = dashboardStats || {
    totalEmployees: 1394,
    activeEmployees: 1321,
    newJoiners: 45,
    resigned: 9,
    attendanceRate: 92.4,
    leaveRequests: 38,
    payrollCost: 2050000,
    activeProjects: 27,
    activeSprints: 14,
    pendingTickets: 182,
    velocity: velocity,
    pipeline: pipeline,
    recentActivity: [
      { who: "Priya S.", what: "approved 3 leave requests", when: "2m ago" },
      { who: "Recruitment", what: "moved 4 candidates to Interview", when: "18m ago" },
      { who: "Finance", what: "locked August payroll for review", when: "1h ago" },
      { who: "Team Atlas", what: "closed sprint S-25 at 103% velocity", when: "3h ago" },
      { who: "IT Assets", what: "issued 6 laptops to new joiners", when: "yesterday" },
    ],
    payrollCostTrend: payrollCost,
    growth: growth,
    leaves: leaves,
    attendanceTrend: [
      { d: "Mon", present: 92, remote: 5, absent: 3 },
      { d: "Tue", present: 94, remote: 4, absent: 2 },
      { d: "Wed", present: 93, remote: 5, absent: 2 },
      { d: "Thu", present: 95, remote: 3, absent: 2 },
      { d: "Fri", present: 90, remote: 7, absent: 3 },
      { d: "Sat", present: 40, remote: 2, absent: 58 }
    ],
    payrollProcessed: 1208,
    payrollOnHold: 14,
    payrollExceptions: 6
  };

  let leavesData = stats.leaves;
  let attendanceData = stats.attendanceTrend;
  let payrollCostData = stats.payrollCostTrend;

  let kpis = [
    { label: "Total Employees", value: stats.totalEmployees.toLocaleString(), delta: 2.6, hint: "", icon: Users },
    { label: "Active", value: stats.activeEmployees.toLocaleString(), delta: 0, hint: `${stats.totalEmployees - stats.activeEmployees} on leave`, icon: BadgeCheck },
    { label: "New Joiners", value: stats.newJoiners.toLocaleString(), delta: 12, hint: "This month", icon: UserPlus },
    { label: "Resigned", value: stats.resigned.toLocaleString(), delta: -25, hint: "This month", icon: UserMinus },
    { label: "Attendance", value: `${stats.attendanceRate}%`, delta: 0.8, hint: "", icon: CalendarDays },
    { label: "Leave Requests", value: stats.leaveRequests.toString(), delta: 0, hint: "Pending approval", icon: CalendarDays },
    { label: "Payroll", value: stats.payrollCost >= 1000000 ? `$${(stats.payrollCost / 1000000).toFixed(2)}M` : `₹${stats.payrollCost.toLocaleString()}`, delta: 3.5, hint: "Aug run · processing", icon: DollarSign },
    { label: "Active Projects", value: stats.activeProjects.toString(), delta: 0, hint: "", icon: Rocket },
    { label: "Active Sprints", value: stats.activeSprints.toString(), delta: 0, hint: "", icon: Rocket },
    { label: "Pending Tickets", value: stats.pendingTickets.toString(), delta: -8, hint: "", icon: Ticket },
  ];

  let velocityTitle = "Sprint velocity";
  let velocitySubtitle = "Planned vs delivered points";
  let velocityData = stats.velocity;
  let velocityKeys = { planned: "planned", done: "done", plannedColor: "hsl(221 83% 53%)", doneColor: "hsl(160 60% 45%)" };

  let growthTitle = "Employee growth";
  let growthSubtitle = "Headcount, joiners and exits · last 8 months";
  let growthData = stats.growth;
  let growthLines = [
    { key: "employees", color: "hsl(221 83% 53%)", type: "area" },
    { key: "joiners", color: "hsl(160 60% 45%)", type: "line" },
    { key: "exits", color: "hsl(340 75% 55%)", type: "line" }
  ];

  let pipelineTitle = "Recruitment pipeline";
  let pipelineSubtitle = "Candidates by stage · all open reqs";
  let pipelineData = stats.pipeline;

  let activityData = stats.recentActivity;

  if (orgType === "MARKETING") {
    kpis = [
      { label: "Total Marketers", value: "148", delta: 4.2, hint: "", icon: Users },
      { label: "Active Campaigns", value: "12", delta: 0, hint: "4 launching next week", icon: Megaphone },
      { label: "Ad Spend (Aug)", value: "$84.5K", delta: 12.5, hint: "Google & Meta", icon: DollarSign },
      { label: "Avg ROAS", value: "3.8x", delta: 8.4, hint: "Target 3.5x", icon: Award },
      { label: "Lead Conversion", value: "4.2%", delta: 0.5, hint: "Visitor to SQL", icon: Percent },
      { label: "Content Output", value: "68 assets", delta: 0, hint: "8 articles, 60 graphics", icon: Layers },
      { label: "Marketing Payroll", value: "$112K", delta: 0, hint: "August run", icon: DollarSign },
      { label: "Content Writers", value: "18", delta: 0, hint: "6 freelancers", icon: Users },
      { label: "Graphic Designers", value: "6", delta: 0, hint: "2 senior leads", icon: Users },
      { label: "Pending Creative Briefs", value: "8", delta: -15, hint: "Requires signoff", icon: Ticket },
    ];

    velocityTitle = "Campaign Conversion Goal";
    velocitySubtitle = "Target vs Achieved conversions (leads in thousands)";
    velocityData = [
      { s: "C-11", planned: 45, done: 48 },
      { s: "C-12", planned: 50, done: 49 },
      { s: "C-13", planned: 55, done: 58 },
      { s: "C-14", planned: 60, done: 54 },
      { s: "C-15", planned: 65, done: 71 },
      { s: "C-16", planned: 70, done: 68 },
    ];
    velocityKeys = { planned: "planned", done: "done", plannedColor: "hsl(280 65% 60%)", doneColor: "hsl(160 60% 45%)" };

    growthTitle = "Marketing Qualified Leads (MQL)";
    growthSubtitle = "Incoming MQLs vs Sales Qualified Leads (SQL) · last 8 months";
    growthData = [
      { m: "Jan", employees: 2500, joiners: 320, exits: 90 },
      { m: "Feb", employees: 2800, joiners: 350, exits: 100 },
      { m: "Mar", employees: 3100, joiners: 420, exits: 110 },
      { m: "Apr", employees: 2900, joiners: 380, exits: 95 },
      { m: "May", employees: 3400, joiners: 460, exits: 130 },
      { m: "Jun", employees: 3800, joiners: 510, exits: 140 },
      { m: "Jul", employees: 4200, joiners: 580, exits: 160 },
      { m: "Aug", employees: 4500, joiners: 620, exits: 180 },
    ];
    growthLines = [
      { key: "employees", color: "hsl(280 65% 60%)", type: "area" }, // Total Leads
      { key: "joiners", color: "hsl(160 60% 45%)", type: "line" },    // MQL
      { key: "exits", color: "hsl(35 92% 55%)", type: "line" }       // SQL
    ];

    pipelineTitle = "Content pipeline";
    pipelineSubtitle = "Assets by production stage";
    pipelineData = [
      { stage: "Drafting", count: 42 },
      { stage: "SEO Review", count: 28 },
      { stage: "Design Prep", count: 19 },
      { stage: "Legal Compliance", count: 12 },
      { stage: "Published", count: 9 },
    ];

    activityData = [
      { who: "Mark C.", what: "approved ad creative for Q3 launch", when: "5m ago" },
      { who: "Content Team", what: "published 3 articles on Zenelait blog", when: "25m ago" },
      { who: "Google Ads", what: "reached daily lead target (+120 MQLs)", when: "1h ago" },
      { who: "Finance", what: "approved $15K budget increase for Social Ads", when: "4h ago" },
      { who: "HR Team", what: "hired 2 junior content coordinators", when: "yesterday" },
    ];

  } else if (orgType === "SALES") {
    kpis = [
      { label: "Total Sales Reps", value: "84", delta: 1.8, hint: "", icon: Users },
      { label: "Open Pipeline", value: "$3.4M", delta: 0, hint: "Weighted pipeline", icon: Target },
      { label: "Closed Won", value: "$1.2M", delta: 18.5, hint: "This quarter", icon: DollarSign },
      { label: "Quota Attainment", value: "88.2%", delta: 2.1, hint: "Team average", icon: Award },
      { label: "Avg Deal Cycle", value: "24 days", delta: 0, hint: "Target 30 days", icon: CalendarDays },
      { label: "Deals In Progress", value: "42", delta: 0, hint: "6 in final negotiation", icon: Rocket },
      { label: "Sales Payroll", value: "$182K", delta: 0, hint: "Base + commissions", icon: DollarSign },
      { label: "Commissions Paid", value: "$34K", delta: 15.0, hint: "August payout", icon: DollarSign },
      { label: "Outstanding Invoices", value: "15", delta: 0, hint: "Net 30 terms", icon: Ticket },
      { label: "Client Demos Run", value: "112", delta: 8.6, hint: "This month", icon: Users },
    ];

    velocityTitle = "Deal Pipeline Velocity";
    velocitySubtitle = "Deals Closed Won: Target vs Actual (USD thousands)";
    velocityData = [
      { s: "Mar", planned: 80, done: 85 },
      { s: "Apr", planned: 90, done: 92 },
      { s: "May", planned: 100, done: 98 },
      { s: "Jun", planned: 110, done: 121 },
      { s: "Jul", planned: 120, done: 115 },
      { s: "Aug", planned: 130, done: 142 },
    ];
    velocityKeys = { planned: "planned", done: "done", plannedColor: "hsl(35 92% 55%)", doneColor: "hsl(160 60% 45%)" };

    growthTitle = "Sales Revenue Funnel";
    growthSubtitle = "Pipeline Value vs Closed Won vs Target · USD thousands";
    growthData = [
      { m: "Jan", employees: 2100, joiners: 850, exits: 800 },
      { m: "Feb", employees: 2300, joiners: 920, exits: 850 },
      { m: "Mar", employees: 2450, joiners: 1050, exits: 900 },
      { m: "Apr", employees: 2600, joiners: 1100, exits: 950 },
      { m: "May", employees: 2800, joiners: 1250, exits: 1100 },
      { m: "Jun", employees: 3000, joiners: 1400, exits: 1200 },
      { m: "Jul", employees: 3200, joiners: 1550, exits: 1350 },
      { m: "Aug", employees: 3400, joiners: 1680, exits: 1500 },
    ];
    growthLines = [
      { key: "employees", color: "hsl(35 92% 55%)", type: "area" }, // Pipeline
      { key: "joiners", color: "hsl(160 60% 45%)", type: "line" },    // Closed Won
      { key: "exits", color: "hsl(221 83% 53%)", type: "line" }       // Target
    ];

    pipelineTitle = "Deals pipeline";
    pipelineSubtitle = "Opportunities by sales stage";
    pipelineData = [
      { stage: "Discovery", count: 184 },
      { stage: "Proposal Sent", count: 96 },
      { stage: "Negotiation", count: 42 },
      { stage: "Contract Sent", count: 21 },
      { stage: "Closed Won", count: 15 },
    ];

    activityData = [
      { who: "Sarah P.", what: "closed Enterprise deal with IBM ($120K ARR)", when: "1m ago" },
      { who: "Sales Operations", what: "updated commission payouts for August", when: "32m ago" },
      { who: "Marcus J.", what: "scheduled 4 new client demos for Friday", when: "2h ago" },
      { who: "System", what: "lead assigned to Midmarket sales team", when: "5h ago" },
      { who: "HR Team", what: "issued job offer to Senior Sales Executive", when: "yesterday" },
    ];

  } else if (orgType === "CORPORATE" || orgType === "MANUFACTURING") {
    kpis = [
      { label: "Total Workers", value: "824", delta: 3.4, hint: "", icon: Users },
      { label: "Active Shift", value: "782", delta: 0, hint: "42 off/sick leave", icon: BadgeCheck },
      { label: "Shift Fulfillment", value: "98.4%", delta: 1.2, hint: "Target 97%", icon: Percent },
      { label: "Safety Incidents", value: "0", delta: 0, hint: "180 days incident-free", icon: ShieldAlert },
      { label: "Assembly Lines", value: "8 / 8", delta: 0, hint: "Full operational capacity", icon: Factory },
      { label: "Production Rate", value: "94%", delta: -1.5, hint: "Units per hour efficiency", icon: Factory },
      { label: "Operations Payroll", value: "$450K", delta: 0, hint: "August run", icon: DollarSign },
      { label: "OEE Effectiveness", value: "86%", delta: 2.3, hint: "Industry standard 85%", icon: Award },
      { label: "Maintenance Tasks", value: "24", delta: 0, hint: "4 high priority", icon: Ticket },
      { label: "Inventory Requisitions", value: "12", delta: 10, hint: "Pending procurement", icon: Ticket },
    ];

    velocityTitle = "Production Output vs Target";
    velocitySubtitle = "Daily production batch count vs target (thousand units)";
    velocityData = [
      { s: "Mon", planned: 45, done: 44 },
      { s: "Tue", planned: 45, done: 46 },
      { s: "Wed", planned: 45, done: 47 },
      { s: "Thu", planned: 45, done: 43 },
      { s: "Fri", planned: 45, done: 46 },
      { s: "Sat", planned: 30, done: 32 },
    ];
    velocityKeys = { planned: "planned", done: "done", plannedColor: "hsl(340 75% 55%)", doneColor: "hsl(160 60% 45%)" };

    growthTitle = "Plant Resource Allocation";
    growthSubtitle = "Total Plant Personnel vs On-Shift vs Off-Shift · last 8 months";
    growthData = [
      { m: "Jan", employees: 720, joiners: 680, exits: 40 },
      { m: "Feb", employees: 735, joiners: 690, exits: 45 },
      { m: "Mar", employees: 750, joiners: 710, exits: 40 },
      { m: "Apr", employees: 768, joiners: 730, exits: 38 },
      { m: "May", employees: 790, joiners: 750, exits: 40 },
      { m: "Jun", employees: 805, joiners: 765, exits: 40 },
      { m: "Jul", employees: 818, joiners: 778, exits: 40 },
      { m: "Aug", employees: 824, joiners: 782, exits: 42 },
    ];
    growthLines = [
      { key: "employees", color: "hsl(340 75% 55%)", type: "area" }, // Total Workers
      { key: "joiners", color: "hsl(160 60% 45%)", type: "line" },    // On-Shift
      { key: "exits", color: "hsl(221 83% 53%)", type: "line" }       // Off-Shift
    ];

    pipelineTitle = "Plant hiring pool";
    pipelineSubtitle = "Candidates by role specialization";
    pipelineData = [
      { stage: "Floor Operator", count: 86 },
      { stage: "Quality Inspector", count: 42 },
      { stage: "Maintenance Engineer", count: 19 },
      { stage: "Safety Lead", count: 8 },
      { stage: "Plant Director", count: 3 },
    ];

    activityData = [
      { who: "Line 4", what: "completed monthly maintenance overhaul", when: "8m ago" },
      { who: "Safety Committee", what: "logged weekly inspection reports (0 findings)", when: "45m ago" },
      { who: "Shift Supervisor", what: "allocated 12 replacement workers for Line 2", when: "3h ago" },
      { who: "Warehouse", what: "received component shipment (A-102 batch)", when: "6h ago" },
      { who: "HR Team", what: "onboarded 8 new assembly line specialists", when: "yesterday" },
    ];
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`${orgName} Dashboard`} description={`Live KPIs for your ${orgType} organization.`} />

      {sysAlerts.length > 0 && (
        <div className="space-y-3">
          {sysAlerts.map((alert) => (
            <div key={alert.id} className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4 text-xs flex flex-col gap-1 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <div className="flex justify-between items-center font-bold text-indigo-400">
                <span>{alert.title}</span>
                <span className="text-[10px] text-slate-500 font-semibold">{new Date(alert.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-slate-350 leading-relaxed mt-1 font-medium">{alert.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} label={kpi.label} value={kpi.value} delta={kpi.delta} hint={kpi.hint} icon={kpi.icon} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title={growthTitle} subtitle={growthSubtitle} className="lg:col-span-2">
          <AreaChart data={growthData} margin={{ left: -10, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={growthLines[0].color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={growthLines[0].color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="m" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey={growthLines[0].key} stroke={growthLines[0].color} fill="url(#g1)" />
            <Line type="monotone" dataKey={growthLines[1].key} stroke={growthLines[1].color} dot={false} />
            <Line type="monotone" dataKey={growthLines[2].key} stroke={growthLines[2].color} dot={false} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Leave analytics" subtitle="Requests this quarter">
          <PieChart>
            <Pie data={leavesData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {leavesData.map((_: any, i: number) => (
                <Cell key={i} fill={pieColors[i % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Attendance trend" subtitle="This week (%)">
          <BarChart data={attendanceData} margin={{ left: -10, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="d" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="present" stackId="a" fill="hsl(160 60% 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="remote" stackId="a" fill="hsl(221 83% 53%)" />
            <Bar dataKey="absent" stackId="a" fill="hsl(340 75% 55%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Payroll cost" subtitle="Total run · USD millions">
          <LineChart data={payrollCostData} margin={{ left: -10, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="m" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="cost" stroke="hsl(35 92% 55%)" strokeWidth={2} dot />
          </LineChart>
        </ChartCard>

        <ChartCard title={velocityTitle} subtitle={velocitySubtitle}>
          <BarChart data={velocityData} margin={{ left: -10, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="s" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey={velocityKeys.planned} fill={velocityKeys.plannedColor} radius={[4, 4, 0, 0]} />
            <Bar dataKey={velocityKeys.done} fill={velocityKeys.doneColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{pipelineTitle}</CardTitle>
            <p className="text-xs text-muted-foreground">{pipelineSubtitle}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipelineData.map((p: any) => {
              const pct = Math.round((p.count / pipelineData[0].count) * 100);
              return (
                <div key={p.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{p.stage}</span>
                    <span className="text-muted-foreground">{p.count} entries</span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Payroll status</CardTitle>
            <p className="text-xs text-muted-foreground">August run</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>Processed</span>
                <span className="text-muted-foreground">{stats.payrollProcessed.toLocaleString()} / {stats.totalEmployees.toLocaleString()}</span>
              </div>
              <Progress value={stats.totalEmployees > 0 ? Math.round((stats.payrollProcessed * 100) / stats.totalEmployees) : 0} />
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">On hold</div>
                <div className="mt-1 text-lg font-semibold">{stats.payrollOnHold}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Exceptions</div>
                <div className="mt-1 text-lg font-semibold text-destructive">{stats.payrollExceptions}</div>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              Bank file cutoff: 27 Aug, 6 pm IST.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
            <p className="text-xs text-muted-foreground">Across HR, payroll and delivery</p>
          </div>
          <Badge variant="secondary" className="gap-1"><Users2 className="h-3 w-3" /> Live</Badge>
        </CardHeader>
        <CardContent className="divide-y">
          {activityData.map((r: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-3 text-sm">
              <div>
                <span className="font-medium text-foreground">{r.who}</span>{" "}
                <span className="text-muted-foreground">{r.what}</span>
              </div>
              <span className="text-xs text-muted-foreground">{r.when}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface EmployeeDashboardProps {
  user: any;
}

function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const orgId = user?.organization?.id;
  const orgName = user?.organization?.name || "Zenelait";
  const orgType = user?.organization?.orgType || "IT";
  const workMode = user?.organization?.workMode || "SPRINT_BASED";

  const [leaveType, setLeaveType] = useState("Casual");
  const [leaveDays, setLeaveDays] = useState(1);
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  const [stats, setStats] = useState<any>({
    remainingLeave: 12,
    attendanceRate: 98.2,
    pendingTasks: 4,
    holidayDate: "15 Aug",
    holidayName: "Independence Day"
  });
  const [leavesList, setLeavesList] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [activeSprint, setActiveSprint] = useState<any>(null);
  const [currentTasks, setCurrentTasks] = useState<any[]>([]);
  const [pastSprints, setPastSprints] = useState<any[]>([]);
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [allUserTickets, setAllUserTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    if (!orgId) return;
    try {
      const s = await apiService.getEmployeeDashboardStats(orgId, user.username);
      setStats(s);
      const list = await apiService.getLeaves(orgId, user.username);
      setLeavesList(list);
      const notifications = await apiService.getSystemNotifications(orgId);
      setAnnouncements(notifications.slice(0, 5));

      // Load sprints & tickets
      const sprints = await apiService.getSprints(orgId);
      const active = sprints.find((sp) => sp.status === "Active") || sprints[0];
      setActiveSprint(active);

      const past = sprints.filter((sp) => sp.status === "Completed" || sp.id !== active?.id).slice(0, 3);
      setPastSprints(past);

      const tickets = await apiService.getTickets(orgId);
      const userTickets = tickets.filter((t) => t.assignee === user.username);
      setAllUserTickets(userTickets);

      if (workMode === "SPRINT_BASED" && active) {
        const activeTasks = userTickets.filter((t) => String(t.sprintId) === String(active.id) || String(t.sprintId) === `sprint-${active.id}`);
        setCurrentTasks(activeTasks);
      } else {
        const unresolved = userTickets.filter((t) => t.status !== "Done");
        setCurrentTasks(unresolved);
      }

      const completed = userTickets.filter((t) => t.status === "Done").slice(0, 3);
      setCompletedTasks(completed);
    } catch (err) {
      console.error("Error loading employee metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [orgId]);

  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveSuccess(false);
    if (!orgId) return;

    try {
      await apiService.submitLeaveRequest({
        username: user.username,
        type: leaveType + " Leave",
        duration: leaveDays,
        status: "PENDING",
        organizationId: orgId,
      });
      setLeaveSuccess(true);
      loadDashboardData();
    } catch (err) {
      alert("Failed to submit leave request");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (newPwd !== confirmPwd) {
      setPwdError("Passwords do not match");
      return;
    }

    try {
      await apiService.changePassword(user.username, currentPwd, newPwd);
      setPwdSuccess("Password updated successfully!");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err: any) {
      setPwdError(err.message || "Failed to update password");
    }
  };

  const kpis = [
    { label: "Remaining Leave Balance", value: `${stats.remainingLeave} Days`, hint: "Total allocation: 18 days", icon: CalendarDays },
    { label: "My Attendance (Month)", value: `${stats.attendanceRate}%`, hint: "Calculated from database clock-ins", icon: BadgeCheck },
    { label: "My Tasks Pending", value: `${stats.pendingTasks} Tasks`, hint: "Assigned in active sprints", icon: Ticket },
    { label: "Next Company Holiday", value: stats.holidayDate, hint: stats.holidayName, icon: Megaphone }
  ];

  return (
    <div className="space-y-6 text-left">
      <PageHeader 
        title={`Welcome back, ${user.username}!`} 
        description={`Here is your personal workspace overview at ${orgName} (${orgType}).`} 
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} label={kpi.label} value={kpi.value} delta={0} hint={kpi.hint} icon={kpi.icon} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-indigo-500" />
              My Profile Details
            </CardTitle>
            <p className="text-xs text-muted-foreground">Your employee credentials and status.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm border-b pb-2 border-muted/30">
                <span className="text-muted-foreground">Username</span>
                <span className="font-semibold">{user.username}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2 border-muted/30">
                <span className="text-muted-foreground">Gmail</span>
                <span className="font-medium text-indigo-400">{user.gmail}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2 border-muted/30">
                <span className="text-muted-foreground">Mobile</span>
                <span className="font-medium">{user.mobile || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2 border-muted/30">
                <span className="text-muted-foreground">Organization</span>
                <span className="font-semibold">{orgName}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2 border-muted/30">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-500" />
              Change Password
            </CardTitle>
            <p className="text-xs text-muted-foreground">Update your login security credentials.</p>
          </CardHeader>
          <CardContent>
            {pwdError && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-550">
                {pwdError}
              </div>
            )}
            {pwdSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-450 font-semibold">
                {pwdSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Current Password</label>
                <Input 
                  type="password" 
                  required 
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">New Password</label>
                <Input 
                  type="password" 
                  required 
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Enter new password" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Confirm New Password</label>
                <Input 
                  type="password" 
                  required 
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Confirm new password" 
                />
              </div>
              <Button type="submit" className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-xs">
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              Quick Leave Request
            </CardTitle>
            <p className="text-xs text-muted-foreground">Submit a leave request for HR approval.</p>
          </CardHeader>
          <CardContent>
            {leaveSuccess && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-450 font-semibold">
                Leave request submitted successfully!
              </div>
            )}

            <form onSubmit={handleRequestLeave} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Earned">Earned Leave</option>
                  <option value="WFH">WFH Request</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Duration (Days)</label>
                <Input 
                  type="number" 
                  min={1} 
                  max={30} 
                  required 
                  value={leaveDays}
                  onChange={(e) => setLeaveDays(Number(e.target.value))}
                />
              </div>
              <Button type="submit" className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-xs">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-indigo-500" />
              Announcements
            </CardTitle>
            <p className="text-xs text-muted-foreground">Updates from company HR & Admin.</p>
          </CardHeader>
          <CardContent className="divide-y divide-muted/30">
            {announcements.length === 0 ? (
              <div className="py-4 text-center text-xs text-muted-foreground font-semibold">No recent announcements from HR.</div>
            ) : (
              announcements.map((ann, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 text-sm">
                  <div className="font-semibold text-foreground">{ann.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{new Date(ann.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              My Leave Requests Log
            </CardTitle>
            <p className="text-xs text-muted-foreground">History and status of your leave requests.</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-muted">
                    <th className="py-2.5 font-semibold text-muted-foreground">Type</th>
                    <th className="py-2.5 font-semibold text-muted-foreground">Duration</th>
                    <th className="py-2.5 font-semibold text-muted-foreground">Status</th>
                    <th className="py-2.5 font-semibold text-muted-foreground text-right">Requested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted/30">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground font-semibold">Loading leave requests history...</td>
                    </tr>
                  ) : leavesList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-muted-foreground font-semibold">No leave requests logged.</td>
                    </tr>
                  ) : (
                    leavesList.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3 font-semibold">{log.type}</td>
                        <td className="py-3 text-muted-foreground font-semibold">{log.duration} Days</td>
                        <td className="py-3">
                          <Badge 
                            variant="outline" 
                            className={
                              log.status === "APPROVED" 
                                ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 font-bold" 
                                : log.status === "REJECTED" 
                                ? "text-rose-500 border-rose-500/20 bg-rose-500/5 font-bold"
                                : "text-amber-500 border-amber-500/20 bg-amber-500/5 font-bold"
                            }
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground text-right font-medium">
                          {new Date(log.requestedAt || Date.now()).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sprints & Tasks Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Current Active Sprint / Active Tasks */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-indigo-500" />
                {workMode === "SPRINT_BASED" ? `Current Sprint: ${activeSprint?.name || "None"}` : "My Active Tasks"}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {workMode === "SPRINT_BASED"
                  ? `Goal: ${activeSprint?.goal || "No active sprint goal set."}`
                  : "Your unresolved deliverables."}
              </p>
            </div>
            {workMode === "SPRINT_BASED" && activeSprint && (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 font-bold">
                {activeSprint.status}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {currentTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground font-semibold">
                No active tasks assigned to you.
              </div>
            ) : (
              <div className="space-y-3.5">
                {currentTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded-xl bg-slate-900/10 hover:bg-slate-900/20 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-bold py-0 px-1">{t.ticketCode || t.id}</Badge>
                        <span className="font-semibold text-sm">{t.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description || "No description provided."}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px]">{t.points} pts</Badge>
                      <Badge 
                        variant={t.priority === "High" ? "destructive" : "secondary"} 
                        className="text-[10px]"
                      >
                        {t.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-bold text-indigo-400 border-indigo-500/20">
                        {t.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Previous 3 Sprints / Completed Tasks */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              {workMode === "SPRINT_BASED" ? "Previous 3 Sprints" : "Recently Completed Tasks"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {workMode === "SPRINT_BASED" ? "Performance overview of past cycles." : "Your last 3 resolved tasks."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {workMode === "SPRINT_BASED" ? (
              pastSprints.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground font-semibold">No completed sprints logged.</div>
              ) : (
                pastSprints.map((s) => {
                  const sTasks = allUserTickets.filter((t) => String(t.sprintId) === String(s.id) || String(t.sprintId) === `sprint-${s.id}`);
                  const compPoints = sTasks.filter((t) => t.status === "Done").reduce((sum, t) => sum + t.points, 0);
                  const totPoints = sTasks.reduce((sum, t) => sum + t.points, 0);
                  const velocity = totPoints > 0 ? Math.round((compPoints * 100) / totPoints) : 0;
                  return (
                    <div key={s.id} className="space-y-2 border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center text-sm font-semibold">
                        <span>{s.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(s.endDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Delivery Rate: {velocity}%</span>
                        <span>{compPoints} / {totPoints} pts completed</span>
                      </div>
                      <Progress value={velocity} />
                    </div>
                  );
                })
              )
            ) : (
              completedTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground font-semibold">No completed tasks yet.</div>
              ) : (
                completedTasks.map((t) => (
                  <div key={t.id} className="flex justify-between items-center p-2.5 border rounded-lg bg-emerald-500/5 border-emerald-500/10 text-xs">
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{t.ticketCode || t.id}</span>
                        {t.title}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">Points: {t.points} pts</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Done</Badge>
                  </div>
                ))
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}