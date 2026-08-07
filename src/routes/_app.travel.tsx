import { createFileRoute } from "@tanstack/react-router";
import { Plane, Plus, ShieldAlert, Sparkles, User, Calendar, Check, AlertTriangle, FileText, CheckCircle2, DollarSign, Wallet, MapPin, Briefcase } from "lucide-react";
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

export const Route = createFileRoute("/_app/travel")({
  head: () => ({
    meta: [
      { title: "Business Travel Requests · Zenelait HRMS" },
      { name: "description", content: "End-to-end corporate travel requests, approvals, flight bookings, and settlements." },
    ],
  }),
  component: TravelPage,
});

function TravelPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  // Travel Form State
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [startDate, setStartDate] = useState("2026-08-20");
  const [endDate, setEndDate] = useState("2026-08-25");
  const [estimatedCost, setEstimatedCost] = useState("");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const list = await apiService.getTravelRequests(orgId);
      setRequests(list);
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
    if (!orgId || !destination || !purpose || !startDate || !endDate || !estimatedCost) return;
    setLoading(true);
    try {
      await apiService.saveTravelRequest(orgId, {
        username: loggedInUsername,
        destination,
        purpose,
        startDate,
        endDate,
        estimatedCost: parseFloat(estimatedCost),
      });
      setDestination("");
      setPurpose("");
      setEstimatedCost("");
      await loadData();
    } catch (e) {
      alert("Failed to submit travel request");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string, advanceDisbursement?: number) => {
    if (!orgId) return;
    setLoading(true);
    try {
      await apiService.saveTravelRequest(orgId, {
        id,
        status,
        advanceDisbursement,
        // Match backend parameters validation rules
        destination: "Dummy",
        purpose: "Dummy",
        startDate: "2026-08-20",
        endDate: "2026-08-25",
        estimatedCost: 0.0,
      });
      await loadData();
    } catch (e) {
      alert("Failed to update travel status");
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const approvedCount = requests.filter(r => r.status === "Approved" || r.status === "Settled").length;
  const totalBudget = requests.reduce((acc, r) => acc + (r.estimatedCost || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Business Travel & Settles" 
        description="Submit travel requisitions, calculate per diem allowances, disburse pre-trip cash advances, and finalize post-trip settlements."
      />

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Total Requests</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-slate-100">{totalCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Awaiting Approval</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-amber-300">{pendingCount}</span>
            <AlertTriangle className="h-4 w-4 text-amber-300" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-450 font-semibold">Approved & Cleared</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-emerald-400">{approvedCount}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Estimated Budget Split</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-indigo-300">${totalBudget.toLocaleString()}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Submit Requisition Form */}
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Submit Travel Request</CardTitle>
              <CardDescription>File a new business trip application for manager routing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="travel-destination" className="text-xs text-slate-350">Destination City / Country</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="travel-destination" 
                      placeholder="e.g. San Francisco, CA" 
                      className="bg-slate-950 border-slate-800 text-xs text-white pl-9" 
                      value={destination} 
                      onChange={(e) => setDestination(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="travel-start" className="text-xs text-slate-350">Start Date</Label>
                    <Input 
                      id="travel-start" 
                      type="date"
                      className="bg-slate-950 border-slate-800 text-xs text-white" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="travel-end" className="text-xs text-slate-350">End Date</Label>
                    <Input 
                      id="travel-end" 
                      type="date"
                      className="bg-slate-950 border-slate-800 text-xs text-white" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="travel-cost" className="text-xs text-slate-350">Estimated Budget Cost ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="travel-cost" 
                      type="number"
                      placeholder="e.g. 1500" 
                      className="bg-slate-950 border-slate-800 text-xs text-white pl-9" 
                      value={estimatedCost} 
                      onChange={(e) => setEstimatedCost(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="travel-purpose" className="text-xs text-slate-350">Business Purpose details</Label>
                  <Textarea 
                    id="travel-purpose" 
                    placeholder="Details flight codes, business meetings, or vendor integrations scope..." 
                    className="bg-slate-950 border-slate-800 text-xs text-white h-24" 
                    value={purpose} 
                    onChange={(e) => setPurpose(e.target.value)} 
                    required 
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-650 hover:bg-indigo-600 cursor-pointer text-xs" disabled={loading}>
                  File Travel Application
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Trip Timeline logs */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Plane className="h-4 w-4 text-indigo-500" />
                Active Corporate Travel Board
              </CardTitle>
              <CardDescription>Track trip approvals, advances, and expense settlements from MySQL.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No travel applications filed in this organization.
                </div>
              ) : (
                requests.map(r => {
                  const statusColor = 
                    r.status === "Pending" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    r.status === "Approved" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                    r.status === "Settled" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    "bg-rose-500/10 text-rose-400 border border-rose-500/20"; // Rejected

                  return (
                    <div key={r.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                            {r.destination}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {r.username}
                          </span>
                        </div>
                        <Badge className={statusColor}>
                          {r.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2.5 rounded bg-slate-950 border border-slate-900/60 text-[10px]">
                        <div>
                          <span className="text-slate-500 block uppercase text-[8px] font-semibold">Start Date</span>
                          <span className="text-slate-300 font-bold">{r.startDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase text-[8px] font-semibold">End Date</span>
                          <span className="text-slate-300 font-bold">{r.endDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase text-[8px] font-semibold">Estimated Cost</span>
                          <span className="text-slate-300 font-bold">${r.estimatedCost?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block uppercase text-[8px] font-semibold">Pre-Trip Advance</span>
                          <span className="text-emerald-400 font-bold">${r.advanceDisbursement?.toLocaleString() || "0"}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-350 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-900/40">
                        <span className="font-semibold text-slate-200 block text-[9px] uppercase mb-1">Business Purpose:</span>
                        {r.purpose}
                      </div>

                      {isAdmin && (
                        <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-900/60">
                          {r.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-650 hover:bg-emerald-600 text-[9px] h-6 cursor-pointer"
                                onClick={() => handleUpdateStatus(r.id, "Approved", 0.0)}
                                disabled={loading}
                              >
                                Approve Trip
                              </Button>
                              <Button
                                size="sm"
                                className="bg-rose-650 hover:bg-rose-600 text-[9px] h-6 cursor-pointer"
                                onClick={() => handleUpdateStatus(r.id, "Rejected", 0.0)}
                                disabled={loading}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {r.status === "Approved" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-indigo-650 hover:bg-indigo-600 text-[9px] h-6 cursor-pointer flex items-center gap-1"
                                onClick={() => handleUpdateStatus(r.id, "Approved", Math.round(r.estimatedCost * 0.5))}
                                disabled={loading || r.advanceDisbursement > 0}
                              >
                                <Wallet className="h-3 w-3" />
                                Disburse 50% Advance
                              </Button>
                              <Button
                                size="sm"
                                className="bg-emerald-650 hover:bg-emerald-600 text-[9px] h-6 cursor-pointer"
                                onClick={() => handleUpdateStatus(r.id, "Settled", r.estimatedCost)}
                                disabled={loading}
                              >
                                Mark Settled & Reimburse
                              </Button>
                            </>
                          )}
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
