import { createFileRoute } from "@tanstack/react-router";
import { Receipt, Plus, Users, ShieldAlert, BadgeAlert, Sparkles, User, Calendar, CreditCard, Landmark, DollarSign, Wallet, FileText, Check, X, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User as APIUser } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/expenses")({
  head: () => ({
    meta: [
      { title: "Expense Claims & Reimbursements · Zenelait HRMS" },
      { name: "description", content: "File receipts, process payroll payouts, and audit employee expense claims." },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);
  const [employees, setEmployees] = useState<APIUser[]>([]);

  // Submission Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Software");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [merchant, setMerchant] = useState("");
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split("T")[0]);

  // Filtering ledger
  const [filterUser, setFilterUser] = useState(isAdmin ? "All" : loggedInUsername);

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      setEmployees(uList.filter(u => u.role !== "SUPERADMIN"));

      const logs = await apiService.getExpenseClaims(orgId);
      setClaims(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !title || !amount || !merchant || !claimDate) return;
    setLoading(true);
    try {
      await apiService.saveExpenseClaim(orgId, {
        username: loggedInUsername,
        title,
        category,
        amount: parseFloat(amount),
        currency,
        merchant,
        claimDate,
      });
      setTitle("");
      setAmount("");
      setMerchant("");
      setCategory("Software");
      setCurrency("USD");
      await loadData();
    } catch (e) {
      alert("Failed to submit expense claim");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (claimId: number, status: string) => {
    if (!orgId) return;
    setLoading(true);
    try {
      await apiService.saveExpenseClaim(orgId, {
        id: claimId,
        status,
      });
      await loadData();
    } catch (e) {
      alert("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  // Filtered Claims
  const displayedClaims = claims.filter(c => {
    if (filterUser === "All") return true;
    return c.username === filterUser;
  });

  // Calculate Metrics
  const sumAmount = (status: string) => {
    return displayedClaims
      .filter(c => c.status === status)
      .reduce((sum, c) => sum + c.amount, 0)
      .toFixed(2);
  };

  const pendingSum = sumAmount("Pending");
  const approvedSum = sumAmount("Approved");
  const reimbursedSum = sumAmount("Reimbursed");
  const activeCount = displayedClaims.length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Expense Claims & Reimbursements" 
        description="Track corporate travel hotel expenses, software subscription routing fees, and meals reimbursements."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Pending Claims</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-amber-300">${pendingSum}</span>
            <Wallet className="h-4 w-4 text-amber-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Approved Claims</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-indigo-300">${approvedSum}</span>
            <Check className="h-4 w-4 text-indigo-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-400 font-semibold">Reimbursed</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-emerald-300">${reimbursedSum}</span>
            <Landmark className="h-4 w-4 text-emerald-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Total Claims Filed</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-slate-100">{activeCount}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Submit Form */}
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">File Expense Claim</CardTitle>
              <CardDescription>Submit receipt transactions for manager audit.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitClaim} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="claim-title" className="text-xs text-slate-350">Description Title</Label>
                  <Input 
                    id="claim-title" 
                    placeholder="e.g. Travel lodging in San Francisco" 
                    className="bg-slate-950 border-slate-800 text-xs text-white" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs text-slate-350">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="bg-slate-950 border-slate-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Meals">Meals</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="currency" className="text-xs text-slate-350">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency" className="bg-slate-950 border-slate-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs text-slate-350">Amount</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      min="0.01" 
                      step="0.01" 
                      placeholder="0.00" 
                      className="bg-slate-950 border-slate-800 text-xs text-white" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="date" className="text-xs text-slate-350">Claim Date</Label>
                    <Input 
                      id="date" 
                      type="date" 
                      className="bg-slate-950 border-slate-800 text-xs text-white" 
                      value={claimDate} 
                      onChange={(e) => setClaimDate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="merchant" className="text-xs text-slate-350">Merchant / Supplier</Label>
                  <Input 
                    id="merchant" 
                    placeholder="e.g. Uber Technologies, AWS" 
                    className="bg-slate-950 border-slate-800 text-xs text-white" 
                    value={merchant} 
                    onChange={(e) => setMerchant(e.target.value)} 
                    required 
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                  <Plus className="mr-1.5 h-4 w-4" /> Submit Claim
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Expense Ledger Roster */}
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Expenses Ledger Registry
                </CardTitle>
                <CardDescription>File receipts audit log synced from MySQL.</CardDescription>
              </div>
              {isAdmin && (
                <div className="w-full sm:w-48">
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                      <SelectValue placeholder="Filter Employee" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="All">All Claims</SelectItem>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.username}>{emp.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {displayedClaims.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No expense claims submitted yet. Use the form on the left.
                </div>
              ) : (
                displayedClaims.map((claim) => {
                  const badgeColor = 
                    claim.status === "Pending" ? "bg-amber-500/10 text-amber-450 border border-amber-500/20" :
                    claim.status === "Approved" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                    claim.status === "Rejected" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"; // Reimbursed
                  
                  return (
                    <div key={claim.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${badgeColor} text-[9px] font-semibold`}>
                            {claim.status}
                          </Badge>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {claim.claimDate}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100">{claim.title}</h4>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-450">
                          <span>User: <strong className="text-slate-350">{claim.username}</strong></span>
                          <span>•</span>
                          <span>Category: <strong className="text-slate-350">{claim.category}</strong></span>
                          <span>•</span>
                          <span>Merchant: <strong className="text-slate-350">{claim.merchant}</strong></span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0 self-stretch sm:self-center">
                        <span className="text-sm font-extrabold text-slate-100">
                          {claim.currency === "INR" ? "₹" : claim.currency === "EUR" ? "€" : "$"}
                          {claim.amount.toFixed(2)}
                        </span>
                        
                        {isAdmin && (
                          <div className="flex gap-1.5">
                            {claim.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] border-slate-800 text-red-400 hover:bg-red-500/5 cursor-pointer"
                                  onClick={() => handleUpdateStatus(claim.id, "Rejected")}
                                  disabled={loading}
                                >
                                  <X className="h-3 w-3 mr-0.5" /> Reject
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-6 text-[10px] bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
                                  onClick={() => handleUpdateStatus(claim.id, "Approved")}
                                  disabled={loading}
                                >
                                  <Check className="h-3 w-3 mr-0.5" /> Approve
                                </Button>
                              </>
                            )}
                            {claim.status === "Approved" && (
                              <Button
                                size="sm"
                                className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                                onClick={() => handleUpdateStatus(claim.id, "Reimbursed")}
                                disabled={loading}
                              >
                                <Landmark className="h-3 w-3 mr-1" /> Payout
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
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
