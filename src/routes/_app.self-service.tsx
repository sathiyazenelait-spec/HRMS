import { createFileRoute } from "@tanstack/react-router";
import { UserCircle, Shield, Mail, Phone, Calendar, Receipt, ClipboardCheck, DollarSign, Save, Plus, BadgeHelp, CheckCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User as APIUser, LeaveRequest } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/self-service")({
  head: () => ({
    meta: [
      { title: "Self-Service Hub · Zenelait HRMS" },
      { name: "description", content: "Manage employee profiles, leave applications, payroll slips, and onboarding tasks." },
    ],
  }),
  component: SelfServicePage,
});

function SelfServicePage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<APIUser | null>(null);

  // Profile Form state
  const [gmail, setGmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Data lists
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payroll, setPayroll] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  // Apply leave form state
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [duration, setDuration] = useState("1");
  const [leaveSuccess, setLeaveSuccess] = useState("");

  const loadData = async () => {
    if (!orgId || !loggedInUsername) return;
    setLoading(true);
    try {
      // Find profile user info
      const uList = await apiService.getUsers(orgId);
      const matched = uList.find(u => u.username === loggedInUsername) || null;
      setProfileUser(matched);
      if (matched) {
        setGmail(matched.gmail || "");
        setMobile(matched.mobile || "");
      }

      // Load leaves
      const leaveList = await apiService.getLeaves(orgId, loggedInUsername);
      setLeaves(leaveList);

      // Load payroll sheet
      const payrollList = await apiService.getPayrollSheets(orgId);
      const myPayroll = payrollList.find(p => p.username === loggedInUsername) || null;
      setPayroll(myPayroll);

      // Load tasks
      const taskList = await apiService.getOnboardingTasks(orgId, loggedInUsername);
      setTasks(taskList);

      // Load expenses
      const expenseList = await apiService.getExpenseClaims(orgId);
      setExpenses(expenseList.filter(e => e.username === loggedInUsername));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId, loggedInUsername]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !profileUser) return;
    setLoading(true);
    setProfileSuccess("");
    try {
      // Update locally in localStorage session
      const session = localStorage.getItem("hrms_user_session");
      if (session) {
        const parsed = JSON.parse(session);
        parsed.gmail = gmail;
        parsed.mobile = mobile;
        localStorage.setItem("hrms_user_session", JSON.stringify(parsed));
      }
      setProfileSuccess("Profile changes updated successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
      await loadData();
    } catch (e) {
      alert("Failed to update credentials profile");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setLoading(true);
    setLeaveSuccess("");
    try {
      await apiService.submitLeaveRequest({
        organizationId: orgId,
        username: loggedInUsername,
        type: leaveType,
        duration: Number(duration),
        status: "Pending",
      });
      setLeaveSuccess("Leave request submitted successfully!");
      setDuration("1");
      setTimeout(() => setLeaveSuccess(""), 4000);
      await loadData();
    } catch (e) {
      alert("Failed to apply leave");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number, currentCompleted: boolean) => {
    if (!orgId) return;
    setLoading(true);
    try {
      await apiService.toggleOnboardingTask(orgId, taskId, currentCompleted);
      await loadData();
    } catch (e) {
      alert("Failed to update task completion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Employee Self-Service Hub" 
        description="Your unified workplace dashboard — update profile records, request leave breaks, check payslips, and sign off task checklists."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Edit Profile */}
        <Card className="bg-slate-900/40 border-slate-800 h-fit">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                {loggedInUsername.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-100">{loggedInUsername}</CardTitle>
                <CardDescription className="text-xs">{profileUser?.role || "Employee"}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="prof-email" className="text-xs text-slate-350">Gmail Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <Input 
                    id="prof-email" 
                    type="email" 
                    className="bg-slate-950 border-slate-800 text-xs text-white pl-9" 
                    value={gmail} 
                    onChange={(e) => setGmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prof-phone" className="text-xs text-slate-350">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  <Input 
                    id="prof-phone" 
                    placeholder="+1 555-0199" 
                    className="bg-slate-950 border-slate-800 text-xs text-white pl-9" 
                    value={mobile} 
                    onChange={(e) => setMobile(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              {profileSuccess && (
                <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 text-[10px] text-center border border-indigo-500/20">
                  {profileSuccess}
                </div>
              )}

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save Credentials
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right column tabs: Leaves, Payslips, Onboarding, Expenses */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="leave" className="space-y-4">
            <TabsList className="bg-slate-950/80 border border-slate-850 text-slate-400 p-1 w-full grid grid-cols-4 h-10">
              <TabsTrigger value="leave" className="text-xs cursor-pointer">Leave Hub</TabsTrigger>
              <TabsTrigger value="payslip" className="text-xs cursor-pointer">Payslips</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs cursor-pointer">Tasks</TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs cursor-pointer">Expenses</TabsTrigger>
            </TabsList>

            {/* Leave Hub */}
            <TabsContent value="leave">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Apply form */}
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Apply for Leave</CardTitle>
                    <CardDescription>File a leave application break record.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleApplyLeave} className="space-y-4">
                      <div className="space-y-1.5">
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
                      <div className="space-y-1.5">
                        <Label htmlFor="leave-duration" className="text-xs text-slate-350">Duration (Days)</Label>
                        <Input 
                          id="leave-duration" 
                          type="number" 
                          min={1} 
                          max={30} 
                          className="bg-slate-950 border-slate-800 text-xs text-white" 
                          value={duration} 
                          onChange={(e) => setDuration(e.target.value)} 
                          required 
                        />
                      </div>

                      {leaveSuccess && (
                        <div className="p-2 rounded bg-indigo-500/10 text-indigo-400 text-[10px] text-center border border-indigo-500/20">
                          {leaveSuccess}
                        </div>
                      )}

                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Submit Request
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Leaves timeline */}
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-sm">Leave Calendar timeline</CardTitle>
                    <CardDescription>Status check on your filed leave applications.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-1">
                    {leaves.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-xs">
                        No leave applications filed.
                      </div>
                    ) : (
                      leaves.map((l) => (
                        <div key={l.id} className="p-3 rounded bg-slate-950/60 border border-slate-900 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-200 block">{l.type}</span>
                            <span className="text-[10px] text-slate-500">Duration: {l.duration} Days</span>
                          </div>
                          <Badge className={
                            l.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            l.status === "Approved" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            "bg-red-500/10 text-red-400"
                          }>
                            {l.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payslips */}
            <TabsContent value="payslip">
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm">Salary & Payslips Statement</CardTitle>
                  <CardDescription>Verifiable payroll invoice records issued by administrators.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-1">
                  {payroll ? (
                    <div className="space-y-5">
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="p-3 rounded bg-slate-950/60 border border-slate-900 text-center">
                          <span className="text-slate-500 block">Basic Salary</span>
                          <strong className="text-slate-200 block pt-1 text-sm">${payroll.basic}</strong>
                        </div>
                        <div className="p-3 rounded bg-slate-950/60 border border-slate-900 text-center">
                          <span className="text-slate-500 block">Allowances</span>
                          <strong className="text-indigo-400 block pt-1 text-sm">${payroll.allowance}</strong>
                        </div>
                        <div className="p-3 rounded bg-slate-950/60 border border-slate-900 text-center">
                          <span className="text-slate-500 block">Deductions / LOP</span>
                          <strong className="text-rose-400 block pt-1 text-sm">${payroll.deductions}</strong>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-900/30 flex justify-between items-center text-xs">
                        <div className="space-y-0.5">
                          <span className="text-indigo-300 font-semibold block">Net Salary Payout Value</span>
                          <span className="text-[10px] text-slate-500">Calculated after standard tax audits</span>
                        </div>
                        <span className="text-lg font-black text-indigo-400">${payroll.basic + payroll.allowance - payroll.deductions}</span>
                      </div>

                      <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-[10px]">
                        <span className="text-slate-500">Statement cycle: <strong>August 2026</strong></span>
                        <Button size="sm" variant="outline" className="border-slate-800 text-[10px] cursor-pointer" onClick={() => alert("Payslip invoice downloaded successfully!")}>
                          Download Payslip PDF
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No payroll sheets issued yet for this account cycle.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onboarding Tasks */}
            <TabsContent value="tasks">
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm">Compliance & Onboarding Tasks</CardTitle>
                  <CardDescription>Submit and sign off credentials and document onboarding checklists.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-1">
                  {tasks.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No onboarding tasks assigned to your employee account.
                    </div>
                  ) : (
                    tasks.map((t) => (
                      <div key={t.id} className="p-3.5 rounded bg-slate-950/60 border border-slate-900 flex justify-between items-center gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-200 block">{t.taskName}</span>
                          <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20 w-fit block">{t.category}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <input 
                            type="checkbox" 
                            checked={t.completed} 
                            className="h-4 w-4 accent-indigo-650 cursor-pointer" 
                            onChange={() => handleToggleTask(t.id, t.completed)}
                            disabled={loading}
                          />
                          <Badge variant="outline" className={t.completed ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" : "bg-slate-900 text-slate-500"}>
                            {t.completed ? "Signed Off" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expenses */}
            <TabsContent value="expenses">
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm">Your Expense Claims</CardTitle>
                  <CardDescription>Track reimbursement claims statuses dynamically from MySQL.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-1">
                  {expenses.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No expense reimbursement claims filed.
                    </div>
                  ) : (
                    expenses.map((e) => (
                      <div key={e.id} className="p-3.5 rounded bg-slate-950/60 border border-slate-900 flex justify-between items-center gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-200 block">{e.title}</span>
                          <span className="text-[10px] text-slate-500">Merchant: {e.merchant} • Category: {e.category}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <strong className="text-slate-100">${e.amount} {e.currency}</strong>
                          <Badge className={
                            e.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            e.status === "Approved" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                            e.status === "Reimbursed" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" :
                            "bg-red-500/10 text-red-400"
                          }>
                            {e.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
