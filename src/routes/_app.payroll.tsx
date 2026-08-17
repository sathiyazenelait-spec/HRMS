import { createFileRoute } from "@tanstack/react-router";
import { Wallet, Receipt, Check, FileDown, PlusCircle, RefreshCw, BadgeAlert, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll & Invoices · Zenelait HRMS" },
      { name: "description", content: "Calculate employee basic salaries, allowances, LOP, and register client invoices." },
    ],
  }),
  component: PayrollPage,
});

function PayrollPage() {
  const currentUser = apiService.getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const orgId = currentUser?.organization?.id;
  const username = currentUser?.username || "Employee";

  const [activeTab, setActiveTab] = useState<"payroll" | "invoices">("payroll");
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [payrollData, setPayrollData] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  // HR forms
  const [clientName, setClientName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [invoiceDue, setInvoiceDue] = useState("");
  const [invoiceSuccess, setInvoiceSuccess] = useState("");

  // Edit salary sheet states
  const [salariesState, setSalariesState] = useState<Record<string, { basic: number; allowance: number; deductions: number }>>({});
  const [payrollSuccess, setPayrollSuccess] = useState("");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      setEmployees(uList);

      const payrollList = await apiService.getPayrollSheets(orgId);
      setPayrollData(payrollList);

      const invoiceList = await apiService.getInvoices(orgId);
      setInvoices(invoiceList);

      // Initialize the salary inputs
      const initialSalaries: Record<string, { basic: number; allowance: number; deductions: number }> = {};
      uList.forEach((emp) => {
        const match = payrollList.find((p) => p.username === emp.username);
        initialSalaries[emp.username] = {
          basic: match ? match.basic : 4000,
          allowance: match ? match.allowance : 1000,
          deductions: match ? match.deductions : 500,
        };
      });
      setSalariesState(initialSalaries);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  // HR modify salary structures
  const handleSalaryChange = (empUsername: string, key: "basic" | "allowance" | "deductions", val: number) => {
    setSalariesState((prev) => ({
      ...prev,
      [empUsername]: {
        ...prev[empUsername],
        [key]: val,
      },
    }));
  };

  // HR Process Payroll Sheet
  const handleProcessPayroll = async () => {
    if (!orgId) return;
    setLoading(true);
    setPayrollSuccess("");
    try {
      const payload = Object.entries(salariesState).map(([empUsername, values]) => ({
        username: empUsername,
        basic: values.basic,
        allowance: values.allowance,
        deductions: values.deductions,
        status: "Processed",
      }));
      await apiService.processPayroll(orgId, payload);
      setPayrollSuccess("Salary checks processed and locked for current cycle!");
      loadData();
      setTimeout(() => setPayrollSuccess(""), 3000);
    } catch (e) {
      alert("Failed to process payroll");
    } finally {
      setLoading(false);
    }
  };

  // HR Create Client Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setLoading(true);
    setInvoiceSuccess("");
    try {
      await apiService.createInvoice(orgId, {
        client: clientName,
        amount: invoiceAmount,
        dueDate: invoiceDue,
        status: "Unpaid",
      });
      setInvoiceSuccess(`Invoice created successfully for ${clientName}!`);
      setClientName("");
      setInvoiceAmount(0);
      setInvoiceDue("");
      loadData();
      setTimeout(() => setInvoiceSuccess(""), 3000);
    } catch (e) {
      alert("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  // HR Auto-Calculate Payroll LOP Deductions
  const handleAutoCalculatePayroll = async () => {
    if (!orgId) return;
    setLoading(true);
    setPayrollSuccess("");
    try {
      const calculated = await apiService.calculatePayroll(orgId);
      const updatedSalaries: Record<string, { basic: number; allowance: number; deductions: number }> = {};
      calculated.forEach((c) => {
        updatedSalaries[c.username] = {
          basic: c.basic,
          allowance: c.allowance,
          deductions: c.deductions
        };
      });
      setSalariesState(updatedSalaries);
      setPayrollSuccess("Calculated LOP deductions based on attendance logs successfully!");
      setTimeout(() => setPayrollSuccess(""), 4000);
    } catch (e) {
      alert("Failed to calculate payroll from attendance logs");
    } finally {
      setLoading(false);
    }
  };

  // HR Auto-Generate Client Invoices from Project Burn Rates
  const handleAutoGenerateInvoices = async () => {
    if (!orgId) return;
    setLoading(true);
    setInvoiceSuccess("");
    try {
      const res = await apiService.autoGenerateInvoices(orgId);
      loadData();
      setInvoiceSuccess(`Generated ${res.count || 0} client invoices automatically based on project expenditures!`);
      setTimeout(() => setInvoiceSuccess(""), 4000);
    } catch (e) {
      alert("Failed to auto-generate client invoices");
    } finally {
      setLoading(false);
    }
  };

  // HR Toggle Invoice Status
  const handleToggleInvoice = async (id: string, currentStatus: "Paid" | "Unpaid") => {
    if (!orgId) return;
    try {
      const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
      await apiService.updateInvoiceStatus(orgId, id, newStatus);
      loadData();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  // Employee Download Payslip simulator
  const handleDownloadPayslip = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob([`Zenelait Payslip Summary for ${username}\nBasic Salary: $${myPayroll?.basic || 4500}\nAllowances: $${myPayroll?.allowance || 1200}\nDeductions: $${myPayroll?.deductions || 650}\nNet Salary: $${(myPayroll?.basic || 4500) + (myPayroll?.allowance || 1200) - (myPayroll?.deductions || 650)}`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${username}_payslip_august.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1000);
  };

  const myPayroll = payrollData.find((p) => p.username.toLowerCase() === username.toLowerCase());
  const myNet = myPayroll ? myPayroll.basic + myPayroll.allowance - myPayroll.deductions : 5050;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Financial Workspace" 
        description={
          isAdmin 
            ? "Calculate payroll metrics, issue customer invoices and balance transaction ledgers." 
            : "Review payslips, salary allocations and access dynamic tax deduction breakdowns."
        } 
      />

      {/* Tabs Menu */}
      {isAdmin && (
        <div className="flex border-b border-border gap-2">
          <button
            onClick={() => setActiveTab("payroll")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "payroll" 
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Payroll Calculations
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "invoices" 
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Client Invoices
          </button>
        </div>
      )}

      {/* ADMIN VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          {activeTab === "payroll" && (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <CardTitle className="text-base flex items-center gap-1.5">
                      <Wallet className="h-5 w-5 text-indigo-500" />
                      Organization Salary Sheets
                    </CardTitle>
                    <CardDescription>Adjust basic pay scale, bonuses/allowances, and statutory deductions for the current calendar cycle.</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button onClick={handleAutoCalculatePayroll} disabled={loading} variant="outline" className="border-indigo-600/30 hover:bg-indigo-500/10 cursor-pointer text-xs h-9">
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Auto-Calculate LOP
                    </Button>
                    <Button onClick={handleProcessPayroll} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs h-9">
                      Process Salary Sheet
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {payrollSuccess && (
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-450 font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    {payrollSuccess}
                  </div>
                )}

                <div className="overflow-x-auto border rounded-lg border-muted/30">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="py-3 px-4 font-semibold text-muted-foreground">Employee</th>
                        <th className="py-3 px-4 font-semibold text-muted-foreground">Basic Pay ($)</th>
                        <th className="py-3 px-4 font-semibold text-muted-foreground">Allowances ($)</th>
                        <th className="py-3 px-4 font-semibold text-muted-foreground">Deductions ($)</th>
                        <th className="py-3 px-4 font-semibold text-muted-foreground">Calculated Net ($)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/30">
                      {employees.map((emp) => {
                        const vals = salariesState[emp.username] || { basic: 4000, allowance: 1000, deductions: 500 };
                        const net = vals.basic + vals.allowance - vals.deductions;
                        return (
                          <tr key={emp.username} className="hover:bg-muted/10">
                            <td className="py-3 px-4 font-semibold">{emp.username}</td>
                            <td className="py-2 px-4">
                              <Input
                                type="number"
                                value={vals.basic}
                                onChange={(e) => handleSalaryChange(emp.username, "basic", Number(e.target.value))}
                                className="h-8 max-w-[120px] text-xs"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <Input
                                type="number"
                                value={vals.allowance}
                                onChange={(e) => handleSalaryChange(emp.username, "allowance", Number(e.target.value))}
                                className="h-8 max-w-[120px] text-xs"
                              />
                            </td>
                            <td className="py-2 px-4">
                              <Input
                                type="number"
                                value={vals.deductions}
                                onChange={(e) => handleSalaryChange(emp.username, "deductions", Number(e.target.value))}
                                className="h-8 max-w-[120px] text-xs"
                              />
                            </td>
                            <td className="py-3 px-4 font-bold text-indigo-400">${net}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "invoices" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form to raise invoice */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <PlusCircle className="h-5 w-5 text-indigo-500" />
                    Issue Client Invoice
                  </CardTitle>
                  <CardDescription>Register billables and track corporate receivables.</CardDescription>
                </CardHeader>
                <CardContent>
                  {invoiceSuccess && (
                    <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-455 font-semibold">
                      {invoiceSuccess}
                    </div>
                  )}

                  <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Client Name</label>
                      <Input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Wayne Enterprises"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Billed Amount ($)</label>
                      <Input
                        type="number"
                        required
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground font-medium">Due Date</label>
                      <Input
                        type="date"
                        required
                        value={invoiceDue}
                        onChange={(e) => setInvoiceDue(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-xs">
                      Generate Invoice
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Invoices register list */}
              <Card className="lg:col-span-8">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-1.5">
                        <Receipt className="h-5 w-5 text-indigo-500" />
                        Invoice Transaction Register
                      </CardTitle>
                    </div>
                    <Button onClick={handleAutoGenerateInvoices} disabled={loading} variant="outline" className="border-indigo-600/30 hover:bg-indigo-500/10 cursor-pointer text-xs h-9 shrink-0">
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Auto-Generate Invoices
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {invoices.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-xs font-semibold">No invoices registered.</div>
                  ) : (
                    <div className="overflow-x-auto border rounded-lg border-muted/30">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/20">
                            <th className="py-2.5 px-3 font-semibold text-muted-foreground">Invoice ID</th>
                            <th className="py-2.5 px-3 font-semibold text-muted-foreground">Client</th>
                            <th className="py-2.5 px-3 font-semibold text-muted-foreground">Amount</th>
                            <th className="py-2.5 px-3 font-semibold text-muted-foreground">Due</th>
                            <th className="py-2.5 px-3 font-semibold text-muted-foreground">Status</th>
                            <th className="py-2.5 px-3 font-semibold text-muted-foreground text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-muted/30">
                          {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-muted/10">
                              <td className="py-3 px-3 font-semibold">{inv.id}</td>
                              <td className="py-3 px-3 text-muted-foreground">{inv.client}</td>
                              <td className="py-3 px-3 font-bold">${inv.amount.toLocaleString()}</td>
                              <td className="py-3 px-3 text-muted-foreground">{inv.dueDate}</td>
                              <td className="py-3 px-3">
                                <Badge 
                                  variant="outline" 
                                  className={
                                    inv.status === "Paid" 
                                      ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" 
                                      : "text-rose-500 border-rose-500/20 bg-rose-500/5"
                                  }
                                >
                                  {inv.status}
                                </Badge>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleToggleInvoice(inv.id, inv.status)}
                                  className="text-[10px] bg-slate-900 border border-slate-800 text-slate-350 cursor-pointer"
                                >
                                  Mark as {inv.status === "Paid" ? "Unpaid" : "Paid"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* EMPLOYEE PORTAL */}
      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Pay Slip overview */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <Coins className="h-5 w-5 text-indigo-500" />
                    My Current Payslip Breakdown
                  </CardTitle>
                  <CardDescription>Salary components for current month calendar cycle.</CardDescription>
                </div>
                {myPayroll && (
                  <Button onClick={handleDownloadPayslip} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs flex items-center gap-1">
                    <FileDown className="h-4 w-4" />
                    Download Payslip
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!myPayroll ? (
                <div className="text-center py-10 space-y-2">
                  <BadgeAlert className="h-10 w-10 text-amber-500 mx-auto" />
                  <h3 className="text-sm font-semibold text-foreground">Payslip Not Generated Yet</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Your salary breakdown and PF ledger for this calendar month are pending calculation and release by HR.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm border-b pb-2.5 border-muted/20">
                    <span className="text-muted-foreground font-medium">Basic Pay Rate</span>
                    <span className="font-bold text-foreground">${myPayroll.basic.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2.5 border-muted/20">
                    <span className="text-muted-foreground font-medium">Bonuses & Allowances (HRA/Medical)</span>
                    <span className="font-semibold text-emerald-450">+${myPayroll.allowance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-b pb-2.5 border-muted/20">
                    <span className="text-muted-foreground font-medium">Statutory Taxes & PF Deductions</span>
                    <span className="font-semibold text-rose-500">-${myPayroll.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-md pt-2">
                    <span className="font-bold text-indigo-500">Net Take-Home Salary</span>
                    <span className="font-extrabold text-foreground text-lg">${myNet.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payroll status indicator card */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8 space-y-4">
              {myPayroll ? (
                <>
                  <div className="rounded-full bg-emerald-500/10 w-12 h-12 flex items-center justify-center mx-auto text-emerald-500">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Salary Processed</h3>
                    <p className="text-xs text-muted-foreground mt-1">Your salary has been approved and dispatched to your registered bank routing account.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-amber-500/10 w-12 h-12 flex items-center justify-center mx-auto text-amber-500">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Pending Processing</h3>
                    <p className="text-xs text-muted-foreground mt-1">HR is currently auditing the monthly roster logs. Breakdown details will display once finalized.</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
