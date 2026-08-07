import { createFileRoute } from "@tanstack/react-router";
import { Settings, Check, RefreshCw, KeyRound, Sliders, Shield, Factory } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel · Zenelait HRMS" },
      { name: "description", content: "Configure company workspace workflows and settings." },
    ],
  }),
  component: AdminPanel,
});

function AdminPanel() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const orgName = currentUser?.organization?.name || "Zenelait";

  const [workMode, setWorkMode] = useState<"TASK_BASED" | "SPRINT_BASED">("TASK_BASED");
  const [attendanceMode, setAttendanceMode] = useState<"CLOCK_IN_OUT" | "EXCEL_GRID">("CLOCK_IN_OUT");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser?.organization) {
      setWorkMode(currentUser.organization.workMode || "TASK_BASED");
      setAttendanceMode(currentUser.organization.attendanceMode || "CLOCK_IN_OUT");
    }
  }, [currentUser]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await apiService.updateOrgSettings(orgId, workMode, attendanceMode);
      setSuccess("Settings updated successfully! Application workspace navigation updated.");
      setTimeout(() => {
        window.location.reload(); // Reload to refresh sidebar configuration
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Admin Settings Panel" 
        description="Configure your organization's work tracking, attendance models, and system integrations." 
      />

      <div className="grid gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sliders className="h-5 w-5 text-indigo-500" />
              Workflow Configurations
            </CardTitle>
            <CardDescription>Tailor Zenelait to match your organization's delivery methodology and tracking preferences.</CardDescription>
          </CardHeader>
          <CardContent>
            {success && (
              <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-450 font-semibold flex items-center gap-2">
                <Check className="h-4.5 w-4.5" />
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-500 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Work Delivery Selector */}
              <div className="border-b pb-6 border-muted/30">
                <h3 className="text-sm font-semibold text-foreground mb-2">Work Tracking System</h3>
                <p className="text-xs text-muted-foreground mb-4">Select how tasks and deliverables are distributed and tracked in your team.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label 
                    onClick={() => setWorkMode("TASK_BASED")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                      workMode === "TASK_BASED" 
                        ? "border-indigo-600 bg-indigo-500/5" 
                        : "border-muted hover:border-muted-foreground/35 bg-card"
                    }`}
                  >
                    <span className="font-bold text-sm">Task-Based with Deadlines</span>
                    <span className="text-xs text-muted-foreground">Best for operations, sales, support and simple workflow tracking. Assign direct tasks with calendar deadlines.</span>
                  </label>
                  <label 
                    onClick={() => setWorkMode("SPRINT_BASED")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                      workMode === "SPRINT_BASED" 
                        ? "border-indigo-600 bg-indigo-500/5" 
                        : "border-muted hover:border-muted-foreground/35 bg-card"
                    }`}
                  >
                    <span className="font-bold text-sm">Sprint/Scrum Agile Model</span>
                    <span className="text-xs text-muted-foreground">Best for engineering and product delivery teams. Enables 2-week sprints, product backlog catalogs, ticket lanes, and burn down dashboards.</span>
                  </label>
                </div>
              </div>

              {/* Attendance Tracker Selector */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Attendance Logging Model</h3>
                <p className="text-xs text-muted-foreground mb-4">Configure how employee check-ins are recorded and verified daily.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label 
                    onClick={() => setAttendanceMode("CLOCK_IN_OUT")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                      attendanceMode === "CLOCK_IN_OUT" 
                        ? "border-indigo-600 bg-indigo-500/5" 
                        : "border-muted hover:border-muted-foreground/35 bg-card"
                    }`}
                  >
                    <span className="font-bold text-sm">Web Clock-In / Clock-Out</span>
                    <span className="text-xs text-muted-foreground">Employees check in manually via a web interface widget with geolocation logs and checkin history.</span>
                  </label>
                  <label 
                    onClick={() => setAttendanceMode("EXCEL_GRID")}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 relative ${
                      attendanceMode === "EXCEL_GRID" 
                        ? "border-indigo-600 bg-indigo-500/5" 
                        : "border-muted hover:border-muted-foreground/35 bg-card"
                    }`}
                  >
                    <span className="font-bold text-sm">Manual Grid & Spreadsheet Import</span>
                    <span className="text-xs text-muted-foreground">Attendance is imported in bulk from card swipe machines via CSV/Excel spreadsheets, or entered directly in an editable monthly sheet.</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-muted/30">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer px-6"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Save Configuration"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Company Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Tenant & Organization Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-muted/20">
                <span className="text-muted-foreground font-medium">Organization Name:</span>
                <span className="font-bold">{orgName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-muted/20">
                <span className="text-muted-foreground font-medium">Tenant ID Code:</span>
                <span className="font-semibold">{currentUser?.organization?.orgCode || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-muted/20">
                <span className="text-muted-foreground font-medium">Admin Registered Email:</span>
                <span className="font-semibold">{currentUser?.gmail || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-muted/20">
                <span className="text-muted-foreground font-medium">Subscription Level:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentUser?.organization?.planType || "STANDARD"}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-muted/20">
                <span className="text-muted-foreground font-medium">Platform Role:</span>
                <span className="font-bold">{currentUser?.role || "ADMIN"}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-muted/20">
                <span className="text-muted-foreground font-medium">Database Node Status:</span>
                <span className="font-semibold text-emerald-500">Live (Isolated Cluster)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
