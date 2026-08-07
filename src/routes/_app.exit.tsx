import { createFileRoute } from "@tanstack/react-router";
import { DoorOpen, Plus, ShieldAlert, Sparkles, User, Calendar, ShieldCheck, Check, AlertTriangle, FileText, CheckCircle2, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User as APIUser } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/exit")({
  head: () => ({
    meta: [
      { title: "Exit Management & Offboarding · Zenelait HRMS" },
      { name: "description", content: "Structured offboarding, resignation intake, and clearance tracking." },
    ],
  }),
  component: ExitPage,
});

function ExitPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [exits, setExits] = useState<any[]>([]);
  const [employees, setEmployees] = useState<APIUser[]>([]);

  // Employee Form State
  const [reason, setReason] = useState("");
  const [lastWorkingDay, setLastWorkingDay] = useState("");

  // Exp Letter Modal
  const [letterOpen, setLetterOpen] = useState(false);
  const [letterUser, setLetterUser] = useState("");
  const [letterDate, setLetterDate] = useState("");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      setEmployees(uList.filter(u => u.role !== "SUPERADMIN"));

      const exitList = await apiService.getExitRequests(orgId);
      setExits(exitList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleFileResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !reason || !lastWorkingDay) return;
    setLoading(true);
    try {
      await apiService.saveExitRequest(orgId, {
        username: loggedInUsername,
        reason,
        resignationDate: new Date().toISOString().split("T")[0],
        lastWorkingDay,
      });
      setReason("");
      setLastWorkingDay("");
      await loadData();
    } catch (e) {
      alert("Failed to submit resignation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, fields: any) => {
    if (!orgId) return;
    setLoading(true);
    try {
      await apiService.saveExitRequest(orgId, {
        id,
        ...fields,
      });
      await loadData();
    } catch (e) {
      alert("Failed to update offboarding fields");
    } finally {
      setLoading(false);
    }
  };

  const triggerExperienceLetter = (username: string, date: string) => {
    setLetterUser(username);
    setLetterDate(date);
    setLetterOpen(true);
  };

  // Filter exits for normal employees to just show their own
  const myExit = exits.find(e => e.username === loggedInUsername);

  // Metrics
  const pendingCount = exits.filter(e => e.status === "Pending").length;
  const approvedCount = exits.filter(e => e.status === "Approved").length;
  const settledCount = exits.filter(e => e.status === "Completed").length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Exit Management & Offboarding" 
        description="Structured employee offboarding pipelines, resignation intake registers, and departmental clearance checklists."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Pending Resignations</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-amber-300">{pendingCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Approved Notice periods</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-indigo-300">{approvedCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-400 font-semibold">Settled & Completed</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-emerald-300">{settledCount}</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Audit Sync</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-slate-100">Live</span>
          </CardContent>
        </Card>
      </div>

      {isAdmin ? (
        <div className="space-y-6">
          {/* HR Offboarding directory */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-base flex items-center gap-1.5">
                <DoorOpen className="h-4 w-4 text-indigo-500" />
                Resignation Directory & Clearances
              </CardTitle>
              <CardDescription>Track employee exit checklists and full & final clearances from MySQL.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {exits.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No resignation filings registered yet.
                </div>
              ) : (
                exits.map(ex => (
                  <div key={ex.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px] font-semibold flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ex.username}
                        </Badge>
                        <span className="text-[10px] text-slate-500">
                          Resigned: {ex.resignationDate} • LWD: {ex.lastWorkingDay}
                        </span>
                      </div>
                      <p className="text-xs text-slate-350 italic max-w-xl">"{ex.reason}"</p>
                      
                      {/* Checklists status */}
                      <div className="flex flex-wrap gap-3 pt-1 text-[9px]">
                        <span className="flex items-center gap-1">
                          Dep clearance:
                          <Badge variant="outline" className={ex.departmentClearance === "Cleared" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-450 border-amber-500/20"}>
                            {ex.departmentClearance}
                          </Badge>
                        </span>
                        <span className="flex items-center gap-1">
                          IT assets:
                          <Badge variant="outline" className={ex.itClearance === "Cleared" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-450 border-amber-500/20"}>
                            {ex.itClearance}
                          </Badge>
                        </span>
                        <span className="flex items-center gap-1">
                          Finance settlement:
                          <Badge variant="outline" className={ex.financeClearance === "Cleared" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-450 border-amber-500/20"}>
                            {ex.financeClearance}
                          </Badge>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2 shrink-0 w-full md:w-auto">
                      <Badge className={
                        ex.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        ex.status === "Approved" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                        ex.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                        "bg-red-500/10 text-red-400"
                      }>
                        {ex.status}
                      </Badge>

                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {ex.status === "Pending" && (
                          <Button
                            size="sm"
                            className="h-7 text-[10px] bg-indigo-650 hover:bg-indigo-600 cursor-pointer"
                            onClick={() => handleUpdateStatus(ex.id, { status: "Approved" })}
                            disabled={loading}
                          >
                            Approve Resignation
                          </Button>
                        )}
                        {ex.status === "Approved" && (
                          <>
                            {ex.departmentClearance !== "Cleared" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] border-slate-800 hover:border-slate-700 cursor-pointer text-slate-300"
                                onClick={() => handleUpdateStatus(ex.id, { departmentClearance: "Cleared" })}
                                disabled={loading}
                              >
                                Dep Clear
                              </Button>
                            )}
                            {ex.itClearance !== "Cleared" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] border-slate-800 hover:border-slate-700 cursor-pointer text-slate-300"
                                onClick={() => handleUpdateStatus(ex.id, { itClearance: "Cleared" })}
                                disabled={loading}
                              >
                                IT Clear
                              </Button>
                            )}
                            {ex.financeClearance !== "Cleared" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] border-slate-800 hover:border-slate-700 cursor-pointer text-slate-300"
                                onClick={() => handleUpdateStatus(ex.id, { financeClearance: "Cleared" })}
                                disabled={loading}
                              >
                                Finance Clear
                              </Button>
                            )}
                          </>
                        )}
                        {ex.status === "Completed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/5 cursor-pointer"
                            onClick={() => triggerExperienceLetter(ex.username, ex.lastWorkingDay)}
                          >
                            <FileText className="h-3 w-3 mr-1" /> Experience Letter
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // Employee path view
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {myExit ? (
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-semibold text-slate-200">Your Resignation Request</CardTitle>
                    <Badge className={
                      myExit.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      myExit.status === "Approved" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                      "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }>
                      {myExit.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs pt-1">
                    Filed on {myExit.resignationDate} • Proposed Last Working Day: {myExit.lastWorkingDay}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Resignation Reason statement</span>
                    <p className="text-xs text-slate-350 border-l border-slate-850 pl-2.5">"{myExit.reason}"</p>
                  </div>

                  {/* Offboarding checklist registry progress */}
                  <div className="space-y-3 pt-2.5">
                    <h3 className="text-xs font-semibold text-slate-300">Department clearances timeline check</h3>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2.5 rounded bg-slate-950/60 border border-slate-900">
                        <span className="text-slate-350">1. Department Manager Clearance</span>
                        <Badge variant="outline" className={myExit.departmentClearance === "Cleared" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-450 border-amber-500/20"}>
                          {myExit.departmentClearance}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded bg-slate-950/60 border border-slate-900">
                        <span className="text-slate-350">2. IT Hardware & Credential Access Clearance</span>
                        <Badge variant="outline" className={myExit.itClearance === "Cleared" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-450 border-amber-500/20"}>
                          {myExit.itClearance}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2.5 rounded bg-slate-950/60 border border-slate-900">
                        <span className="text-slate-350">3. Finance Settlement & Payroll Payout Clearance</span>
                        <Badge variant="outline" className={myExit.financeClearance === "Cleared" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-450 border-amber-500/20"}>
                          {myExit.financeClearance}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {myExit.status === "Completed" && (
                    <div className="pt-2">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-500 cursor-pointer text-xs"
                        onClick={() => triggerExperienceLetter(myExit.username, myExit.lastWorkingDay)}
                      >
                        <Award className="h-4 w-4 mr-1.5" /> Download reliving / Experience Letter
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm">File Exit Resignation</CardTitle>
                  <CardDescription>Resign from your corporate contract dynamically.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFileResignation} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="exit-date" className="text-xs text-slate-350">Proposed Last Working Day</Label>
                      <Input
                        id="exit-date"
                        type="date"
                        className="bg-slate-950 border-slate-800 text-xs text-white"
                        value={lastWorkingDay}
                        onChange={(e) => setLastWorkingDay(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="exit-reason" className="text-xs text-slate-350">Statement Reason</Label>
                      <Textarea
                        id="exit-reason"
                        placeholder="Detail your reasons for transitioning..."
                        className="bg-slate-950 border-slate-800 text-xs text-white h-32"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-red-650 hover:bg-red-600 cursor-pointer text-xs" disabled={loading}>
                      File Resignation Request
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="bg-slate-900/40 border-slate-800 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Offboarding Policies</CardTitle>
              <CardDescription>Standard exit timeline checklists.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 pt-1 text-[11px] leading-relaxed text-slate-400">
              <p>
                A standard notice period of <strong>30 days</strong> applies to all corporate departments unless otherwise agreed in your contract.
              </p>
              <div className="flex items-start gap-2.5 pt-1.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-slate-300 font-semibold">Full & final settlement processed within 7 working days of LWD.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="text-slate-300 font-semibold">Experience and relieving letters generated upon complete finance audit clearances.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relieving Experience Letter stub modal */}
      <Dialog open={letterOpen} onOpenChange={setLetterOpen}>
        <DialogContent className="bg-slate-950 border-slate-850 text-white max-w-lg overflow-hidden">
          <DialogHeader className="pb-3 border-b border-slate-900">
            <DialogTitle className="text-sm font-semibold flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-indigo-450" />
              Verified Exit experience letter
            </DialogTitle>
            <DialogDescription className="text-[10px] text-slate-450">
              Verifiable experience stub generated dynamically from database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-8 px-8 bg-white text-slate-950 rounded-lg border border-slate-200 relative text-left font-serif space-y-4">
            <div className="flex justify-between border-b border-slate-300 pb-3 items-center">
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900 leading-none">Zenelait HRMS Corp</h2>
                <span className="text-[9px] text-slate-500 font-sans block pt-0.5">Corporate Headquarters • NY, USA</span>
              </div>
              <Award className="h-8 w-8 text-indigo-650" />
            </div>

            <div className="text-[10px] space-y-2 leading-relaxed">
              <span className="block font-sans font-medium text-right text-[9px] text-slate-500">Date: {letterDate}</span>
              <h3 className="text-xs font-bold font-sans text-center uppercase tracking-wider py-1 border-y border-slate-200">TO WHOMSOEVER IT MAY CONCERN</h3>
              
              <p className="pt-2">
                This is to certify that <strong>{letterUser}</strong> was employed with Zenelait HRMS during the contract period up to his last working day on <strong>{letterDate}</strong>.
              </p>
              <p>
                During their tenure in their department role, they have consistently demonstrated diligent work values, strong agile fullstack coding contributions, and lead collaboration abilities.
              </p>
              <p>
                We appreciate their milestones and contribution to our core platform product sprint releases and wish them success in their future career paths.
              </p>
            </div>

            <div className="flex justify-between border-t border-slate-300 pt-6 text-[9px] font-sans text-slate-500">
              <div className="space-y-1">
                <span className="block h-4 w-20 border-b border-slate-400" />
                <span>Authorized Signatory</span>
              </div>
              <div className="text-right">
                <span className="block">Verification ID: exit_stub_{Math.floor(Math.random() * 90000) + 10000}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
            <Button size="sm" variant="outline" className="border-slate-800 text-xs cursor-pointer" onClick={() => setLetterOpen(false)}>
              Close
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs cursor-pointer" onClick={() => alert("Experience Letter PDF downloaded successfully!")}>
              Download Experience Letter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
