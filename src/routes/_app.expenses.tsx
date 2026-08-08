import { createFileRoute } from "@tanstack/react-router";
import { Receipt, Plus, Users, ShieldAlert, BadgeAlert, Sparkles, User, Calendar, CreditCard, Landmark, DollarSign, Wallet, FileText, Check, X, RotateCcw, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User as APIUser } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [selectedVoucherClaim, setSelectedVoucherClaim] = useState<any | null>(null);

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

  const handleDownloadPDF = async () => {
    const element = document.getElementById("voucher-sheet");
    if (!element || !selectedVoucherClaim) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `Voucher_${selectedVoucherClaim.username}_${selectedVoucherClaim.claimDate}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("PDF Generation error:", error);
      alert("Failed to generate PDF. Please try again.");
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
                        
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] border-slate-850 text-indigo-400 hover:bg-indigo-500/5 cursor-pointer"
                            onClick={() => setSelectedVoucherClaim(claim)}
                          >
                            <FileText className="h-3.5 w-3.5 mr-0.5" /> Voucher
                          </Button>

                          {isAdmin && (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedVoucherClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 print:p-0">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative text-left flex flex-col gap-4 print:border-0 print:bg-white print:p-0 print:shadow-none">
            
            {/* Modal Header (Hidden on Print) */}
            <div className="flex justify-between items-center print:hidden border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-1.5 text-slate-200">
                <FileText className="h-4.5 w-4.5 text-indigo-400" />
                Expense Reimbursement Voucher
              </h3>
              <button
                onClick={() => setSelectedVoucherClaim(null)}
                className="text-slate-500 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable Voucher Paper Sheet */}
            <div id="voucher-sheet" className="bg-white text-slate-900 p-6 rounded-xl border border-slate-250 shadow-inner font-sans print:border-0 print:shadow-none print:p-0">
              {/* Company Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                    {currentUser?.organization?.name || "ZENELAIT HRMS"}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                    Corporate Expense & Reimbursement Registry
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Voucher Document
                  </span>
                  <div className="text-xs font-mono font-bold mt-2 text-slate-850">
                    Voucher ID: EV-{new Date(selectedVoucherClaim.claimDate).getFullYear()}-{(10000 + selectedVoucherClaim.id).toString().slice(1)}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-xs mt-6 border-b border-slate-200 pb-6">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Claimant Employee</span>
                  <span className="font-bold text-slate-800">{selectedVoucherClaim.username}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Voucher Date</span>
                  <span className="font-bold text-slate-800">{selectedVoucherClaim.claimDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Expense Category</span>
                  <span className="font-semibold text-slate-700">{selectedVoucherClaim.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Merchant / Vendor</span>
                  <span className="font-semibold text-slate-700">{selectedVoucherClaim.merchant}</span>
                </div>
              </div>

              {/* Description / Summary Table */}
              <div className="mt-6">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Itemized Summary</span>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-650 font-bold border-b border-slate-200">
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-205">
                      <td className="py-3 px-3 font-semibold text-slate-800">{selectedVoucherClaim.title}</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {selectedVoucherClaim.currency === "INR" ? "₹" : selectedVoucherClaim.currency === "EUR" ? "€" : "$"}
                        {selectedVoucherClaim.amount.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="py-2 px-3 text-right text-[10px] text-slate-500 uppercase">Total Settlement Value:</td>
                      <td className="py-2 px-3 text-right text-sm">
                        {selectedVoucherClaim.currency === "INR" ? "₹" : selectedVoucherClaim.currency === "EUR" ? "€" : "$"}
                        {selectedVoucherClaim.amount.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Workflow Audit Trail */}
              <div className="grid grid-cols-3 gap-4 text-[10px] text-slate-500 mt-6 border-b border-slate-200 pb-6">
                <div>
                  <span className="font-bold block uppercase tracking-wider text-slate-400">Workflow Node</span>
                  <span className="font-semibold text-slate-700">Audit Status: {selectedVoucherClaim.status}</span>
                </div>
                <div>
                  <span className="font-bold block uppercase tracking-wider text-slate-400">Assigned Organization</span>
                  <span className="font-semibold text-slate-700">{currentUser?.organization?.name}</span>
                </div>
                <div>
                  <span className="font-bold block uppercase tracking-wider text-slate-400">Audit Stamp</span>
                  <span className="font-mono text-slate-600">ID-{selectedVoucherClaim.id}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-4">
                <div className="border-t border-dashed border-slate-400 text-center pt-2">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Employee Signature</div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">Claimant: {selectedVoucherClaim.username}</span>
                </div>
                <div className="border-t border-dashed border-slate-400 text-center pt-2">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Verified By</div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">HR System Admin</span>
                </div>
                <div className="border-t border-dashed border-slate-400 text-center pt-2">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Accounts Clearance</div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">Authorized Signatory</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls (Hidden on Print) */}
            <div className="flex justify-end gap-3 mt-2 border-t border-slate-800 pt-4 print:hidden">
              <Button
                variant="outline"
                onClick={() => setSelectedVoucherClaim(null)}
                className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                Close View
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={loading}
                className="bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Print Voucher Sheet
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed, .fixed * {
            visibility: visible;
          }
          .fixed {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:bg-white {
            background: white !important;
            color: black !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
