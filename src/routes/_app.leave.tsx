import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CalendarRange, Plus, CheckCircle, XCircle, Clock, Check, X, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, LeaveRequest } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/leave")({
  head: () => ({
    meta: [
      { title: "Leave Management · Zenelait HRMS" },
      { name: "description", content: "Manage and approve casual, sick, earned, and WFH leaves." },
    ],
  }),
  component: LeaveManagementPage,
});

const LEAVE_TYPES = [
  { key: "Casual Leave", label: "Casual Leave (CL)", limit: 6, color: "text-blue-400 bg-blue-500/10 border-blue-500/25" },
  { key: "Sick Leave", label: "Sick Leave (SL)", limit: 6, color: "text-rose-400 bg-rose-500/10 border-rose-500/25" },
  { key: "Earned Leave", label: "Earned Leave (EL)", limit: 6, color: "text-amber-400 bg-amber-500/10 border-amber-500/25" },
  { key: "Work From Home", label: "Work From Home (WFH)", limit: 30, color: "text-purple-400 bg-purple-500/10 border-purple-500/25" },
];

function LeaveManagementPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const username = currentUser?.username || "Employee";

  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);

  // Leave Request Form State
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [duration, setDuration] = useState("1");
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const list = isAdmin 
        ? await apiService.getLeaves(orgId)
        : await apiService.getLeaves(orgId, username);
      setLeaves(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setLoading(true);
    setSuccessMsg("");
    try {
      await apiService.submitLeaveRequest({
        username,
        type: leaveType,
        duration: parseInt(duration),
        organizationId: orgId
      } as any);
      setDuration("1");
      setSuccessMsg("Leave request submitted successfully!");
      await loadData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e) {
      alert("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, approved: boolean) => {
    if (!orgId) return;
    setLoading(true);
    try {
      await apiService.approveLeave(orgId, id, approved ? "APPROVED" : "REJECTED");
      await loadData();
    } catch (e) {
      alert("Failed to complete action");
    } finally {
      setLoading(false);
    }
  };

  // Balance calculations (Baseline limit of 18 days for CL+SL+EL)
  const approvedLeaves = leaves.filter(l => l.status === "APPROVED" && l.type !== "Work From Home");
  const approvedDaysCount = approvedLeaves.reduce((sum, l) => sum + l.duration, 0);
  const remainingBalance = Math.max(0, 18 - approvedDaysCount);

  // Per category calculation
  const getCategorySpent = (type: string) => {
    return leaves
      .filter(l => l.status === "APPROVED" && l.type === type)
      .reduce((sum, l) => sum + l.duration, 0);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Leave Management Workspace" 
        description="Submit leave requests, check policy-driven balances, and audit employee vacation logs dynamically."
      />

      {/* Roster of category limits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {LEAVE_TYPES.map(lt => {
          const spent = getCategorySpent(lt.key);
          const rem = Math.max(0, lt.limit - spent);
          return (
            <Card key={lt.key} className="bg-slate-900/40 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-slate-300">{lt.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-slate-200">{rem} Days</span>
                  <span className="text-[10px] text-slate-500">of {lt.limit} max</span>
                </div>
                <Badge variant="outline" className={`${lt.color} text-[9px] py-0 px-1`}>
                  {spent} Days Consumed
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Log/Audit Table */}
        <Card className="md:col-span-2 bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-base flex items-center gap-1.5">
              <CalendarRange className="h-4 w-4 text-indigo-500" />
              {isAdmin ? "Company Leave Roster Log" : "My Submitted Leaves Log"}
            </CardTitle>
            <CardDescription>
              {isAdmin ? "Review, approve, or reject employee leave requests." : "Track your pending approvals and leave history."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-450 tracking-wider">
                    {isAdmin && <th className="py-2.5 px-3">Employee</th>}
                    <th className="py-2.5 px-3">Leave Type</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Requested At</th>
                    <th className="py-2.5 px-3">Status</th>
                    {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(req => (
                    <tr key={req.id} className="border-b border-slate-800/60 hover:bg-slate-900/20 transition-colors">
                      {isAdmin && <td className="py-3 px-3 font-semibold text-slate-200">{req.username}</td>}
                      <td className="py-3 px-3">{req.type}</td>
                      <td className="py-3 px-3 font-medium">{req.duration} {req.duration === 1 ? 'Day' : 'Days'}</td>
                      <td className="py-3 px-3 text-slate-400">{req.requestedAt}</td>
                      <td className="py-3 px-3">
                        <Badge 
                          className={
                            req.status === "APPROVED" 
                              ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[10px]" 
                              : req.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-550 border border-rose-500/20 text-[10px]"
                              : "bg-amber-500/10 text-amber-450 border border-amber-500/20 text-[10px]"
                          }
                        >
                          {req.status}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-3 text-right">
                          {req.status === "PENDING" ? (
                            <div className="flex justify-end gap-1.5">
                              <Button 
                                size="icon" 
                                className="h-6 w-6 bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                                onClick={() => req.id !== undefined && handleApprove(req.id, true)}
                                disabled={loading}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="icon" 
                                className="h-6 w-6 bg-rose-600 hover:bg-rose-500 cursor-pointer"
                                onClick={() => req.id !== undefined && handleApprove(req.id, false)}
                                disabled={loading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500">Settled</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}

                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 4} className="text-center py-10 text-slate-500">
                        No leave requests submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Application / Info Form Panel */}
        <div className="space-y-6">
          {!isAdmin && (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm">Submit Leave Request</CardTitle>
                <CardDescription>File a new vacation or sick leave request.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="leave-type" className="text-xs text-slate-350">Leave Type</Label>
                    <Select value={leaveType} onValueChange={setLeaveType}>
                      <SelectTrigger id="leave-type" className="bg-slate-950 border-slate-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        <SelectItem value="Casual Leave">Casual Leave (CL)</SelectItem>
                        <SelectItem value="Sick Leave">Sick Leave (SL)</SelectItem>
                        <SelectItem value="Earned Leave">Earned Leave (EL)</SelectItem>
                        <SelectItem value="Work From Home">Work From Home (WFH)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-xs text-slate-350">Duration (Days)</Label>
                    <Input 
                      id="duration" 
                      type="number" 
                      min="1" 
                      max="14"
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                    />
                  </div>
                  {successMsg && <p className="text-[11px] text-emerald-450 font-medium">{successMsg}</p>}
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                    <Plus className="mr-1.5 h-4 w-4" /> Submit Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className="bg-indigo-950/20 border-indigo-900/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                Remaining Balance Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[11px] text-slate-400 space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Personal Annual Leave Quote:</span>
                <span className="font-bold text-slate-200">18 Days</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                <span>Consumed (CL+SL+EL):</span>
                <span className="font-bold text-rose-500">-{approvedDaysCount} Days</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-indigo-400">Total Available Balance:</span>
                <span className="font-extrabold text-slate-100 text-xs">{remainingBalance} Days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
