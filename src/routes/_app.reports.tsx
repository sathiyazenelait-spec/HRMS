import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Download, RefreshCw, Layers, Sparkles, TrendingUp, Users, DollarSign, Award, ArrowUpRight, ShieldCheck, Box } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User as APIUser } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics · Zenelait HRMS" },
      { name: "description", content: "Generate recruitment funnels, audit expenses, and export custom reports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;

  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<APIUser[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Ad-Hoc Builder State
  const [selectedModule, setSelectedModule] = useState("candidates");
  const [builderData, setBuilderData] = useState<any[]>([]);

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      setUsers(uList.filter(u => u.role !== "SUPERADMIN"));

      const candList = await apiService.getCandidates(orgId);
      setCandidates(candList);

      const jobList = await apiService.getJobs(orgId);
      setJobs(jobList);

      const assetList = await apiService.getAssets(orgId);
      setAssets(assetList);

      const revList = await apiService.getPerformanceReviews(orgId);
      setReviews(revList);

      const expList = await apiService.getExpenseClaims(orgId);
      setExpenses(expList);

      const logList = await apiService.getWorkLogs(orgId);
      setLogs(logList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  // Load preview data when selected module changes
  useEffect(() => {
    let data: any[] = [];
    if (selectedModule === "candidates") {
      data = candidates;
    } else if (selectedModule === "assets") {
      data = assets;
    } else if (selectedModule === "reviews") {
      data = reviews;
    } else if (selectedModule === "expenses") {
      data = expenses;
    } else if (selectedModule === "logs") {
      data = logs;
    }
    setBuilderData(data);
  }, [selectedModule, candidates, assets, reviews, expenses, logs]);

  const handleExportCSV = () => {
    if (builderData.length === 0) return;
    
    // Assemble headers dynamically
    const headers = Object.keys(builderData[0]).filter(k => k !== "organizationId" && k !== "organization");
    let csvRows = [headers.join(",")];

    for (const row of builderData) {
      const values = headers.map(header => {
        const val = row[header];
        const strVal = val === null || val === undefined ? "" : String(val);
        // Escape quotes
        return `"${strVal.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zenelait_report_${selectedModule}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations
  const headCount = users.length;
  const openingsCount = jobs.filter(j => j.status === "Open").length;
  const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2);
  const avgPerf = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Recruitment funnel stage metrics
  const countStage = (stg: string) => candidates.filter(c => c.stage === stg).length;
  const stageApplied = countStage("Applied");
  const stageScreening = countStage("Screening");
  const stageOffered = countStage("Offered");
  const stageHired = countStage("Hired");
  const totalCandidates = candidates.length;

  // Assets stats
  const assetsInStock = assets.filter(a => a.status === "In Stock").length;
  const assetsAllocated = assets.filter(a => a.status === "Allocated").length;

  // Expenses stats
  const expPending = expenses.filter(e => e.status === "Pending").reduce((sum, e) => sum + e.amount, 0).toFixed(2);
  const expReimbursed = expenses.filter(e => e.status === "Reimbursed").reduce((sum, e) => sum + e.amount, 0).toFixed(2);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports & Analytics Dashboard" 
        description="Audit company KPIs, review hiring funnels, track expenditures, and generate CSV sheets dynamically."
      />

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Active Headcount</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center justify-between">
            <span className="text-xl font-bold text-slate-100">{headCount}</span>
            <Users className="h-4 w-4 text-slate-500" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Open Requisitions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center justify-between">
            <span className="text-xl font-bold text-indigo-300">{openingsCount}</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-400 font-semibold">Total Expenditures</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center justify-between">
            <span className="text-xl font-bold text-emerald-300">${totalExp}</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Average performance rating</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center justify-between">
            <span className="text-xl font-bold text-amber-300">{avgPerf} / 5.0</span>
            <Award className="h-4 w-4 text-amber-400" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recruitment Funnel Card */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-slate-200">Recruitment Pipeline Funnel</CardTitle>
              <CardDescription>Candidates count distributed across ATS stages.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px]">
              {totalCandidates} Applicants
            </Badge>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Applied Stage</span>
                <span className="font-semibold">{stageApplied} candidates</span>
              </div>
              <Progress value={totalCandidates > 0 ? (stageApplied / totalCandidates) * 100 : 0} className="h-2 bg-slate-950" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Screening / Interview Stage</span>
                <span className="font-semibold">{stageScreening} candidates</span>
              </div>
              <Progress value={totalCandidates > 0 ? (stageScreening / totalCandidates) * 100 : 0} className="h-2 bg-slate-950" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Offered Contracts</span>
                <span className="font-semibold">{stageOffered} candidates</span>
              </div>
              <Progress value={totalCandidates > 0 ? (stageOffered / totalCandidates) * 100 : 0} className="h-2 bg-slate-950" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Hired & Onboarded</span>
                <span className="font-semibold">{stageHired} candidates</span>
              </div>
              <Progress value={totalCandidates > 0 ? (stageHired / totalCandidates) * 100 : 0} className="h-2 bg-slate-950" />
            </div>
          </CardContent>
        </Card>

        {/* Expenses & Assets Split summary */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm font-semibold text-slate-200">Reimbursement Ledger Analytics</CardTitle>
              <CardDescription>Aggregate claims values processed across the organization.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center text-xs p-3 bg-slate-950/60 rounded border border-slate-900">
                <span className="text-slate-400">Claims Awaiting Approvals (Pending)</span>
                <span className="font-bold text-amber-300">${expPending}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-3 bg-slate-950/60 rounded border border-slate-900">
                <span className="text-slate-400">Total Settled Reimbursements (Reimbursed)</span>
                <span className="font-bold text-emerald-300">${expReimbursed}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-3 bg-slate-950/60 rounded border border-slate-900">
                <span className="text-slate-400">Cataloged Hardware Assets Value</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Box className="h-4 w-4 text-slate-400" />
                  {assetsAllocated} Allocated / {assetsInStock} In Stock
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ad-Hoc Report Builder */}
      <Card className="bg-slate-900/40 border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Ad-Hoc Report Builder
            </CardTitle>
            <CardDescription>Select any database module, generate previews, and download verifiable CSV sheets.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="w-40">
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-slate-800 text-white">
                  <SelectItem value="candidates">Candidates List</SelectItem>
                  <SelectItem value="assets">Assets Inventory</SelectItem>
                  <SelectItem value="reviews">Performance scorecards</SelectItem>
                  <SelectItem value="expenses">Expense claims</SelectItem>
                  <SelectItem value="logs">Work logs directory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-xs gap-1.5 cursor-pointer h-9"
              onClick={handleExportCSV}
              disabled={builderData.length === 0}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto rounded border border-slate-800/85">
            <table className="w-full border-collapse text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[9px] tracking-wider font-semibold">
                <tr>
                  {builderData.length > 0 ? (
                    Object.keys(builderData[0])
                      .filter(k => k !== "organizationId" && k !== "organization")
                      .slice(0, 6)
                      .map((key) => (
                        <th key={key} className="px-4 py-3 font-semibold">{key}</th>
                      ))
                  ) : (
                    <th className="px-4 py-3">No fields loaded</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 bg-slate-950/20">
                {builderData.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    {Object.keys(row)
                      .filter(k => k !== "organizationId" && k !== "organization")
                      .slice(0, 6)
                      .map((key) => {
                        const cell = row[key];
                        return (
                          <td key={key} className="px-4 py-3 truncate max-w-[200px]">
                            {cell === null || cell === undefined ? "" : String(cell)}
                          </td>
                        );
                      })}
                  </tr>
                ))}
                {builderData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-500 italic">
                      No records found in selection
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {builderData.length > 5 && (
            <div className="pt-3 text-[10px] text-slate-500 text-right">
              Showing top 5 entries. Click "Export CSV" to download all {builderData.length} records.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
