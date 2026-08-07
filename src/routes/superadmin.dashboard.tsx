import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { apiService, Organization, LandingPageBlock } from "../lib/api-service";
import {
  Sparkles,
  Users,
  Briefcase,
  LogOut,
  Plus,
  Mail,
  Phone,
  CheckCircle,
  Copy,
  TrendingUp,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Settings,
  Database,
  Server,
  Activity,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/superadmin/dashboard")({
  head: () => ({
    meta: [
      { title: "Superadmin Control Panel · Zenelait HRMS" },
      { name: "description", content: "Management console for system organizations." },
    ],
  }),
  component: SuperadminDashboard,
});

function SuperadminDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "orgs" | "plans" | "notifications" | "builder">("overview");
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Plan creation and notification states
  const [plans, setPlans] = useState<any[]>([]);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState(99);
  const [newPlanMaxUsers, setNewPlanMaxUsers] = useState(50);
  const [newPlanAllowedModules, setNewPlanAllowedModules] = useState("ATTENDANCE,PAYROLL");
  const [planSuccess, setPlanSuccess] = useState("");
  const [currency, setCurrency] = useState<"USD" | "INR">("INR");

  const [queries, setQueries] = useState<any[]>([]);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertContent, setAlertContent] = useState("");
  const [alertTargetOrgId, setAlertTargetOrgId] = useState<string>("");
  const [alertSuccess, setAlertSuccess] = useState("");

  // Form Fields for Creation
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState("IT");
  const [ownerGmail, setOwnerGmail] = useState("");
  const [ownerMobile, setOwnerMobile] = useState("");
  const [planType, setPlanType] = useState("STANDARD");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal State
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrgType, setEditOrgType] = useState("IT");
  const [editOwnerGmail, setEditOwnerGmail] = useState("");
  const [editOwnerMobile, setEditOwnerMobile] = useState("");
  const [editPlanType, setEditPlanType] = useState("STANDARD");
  const [editOtpCode, setEditOtpCode] = useState("");
  const [editError, setEditError] = useState("");

  // Page Builder State
  const [blocks, setBlocks] = useState<LandingPageBlock[]>([]);
  const [builderSuccess, setBuilderSuccess] = useState("");

  const [systemStatus, setSystemStatus] = useState<any>({
    javaVersion: "...",
    processors: 0,
    freeMemory: "...",
    totalMemory: "...",
    activeProfile: "...",
    redisCache: "...",
    kafkaBroker: "..."
  });

  useEffect(() => {
    // Check if logged in as SUPERADMIN
    const user = apiService.getCurrentUser();
    if (!user || user.role !== "SUPERADMIN") {
      window.location.href = "/superadmin";
      return;
    }

    setAuthorized(true);
    loadOrganizations();
    loadSystemStatus();
    loadPlans();
    loadQueries();
    setBlocks(apiService.getLandingPageSchema());
  }, []);

  const loadPlans = async () => {
    try {
      const data = await apiService.getSubscriptionPlans();
      setPlans(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadQueries = async () => {
    try {
      const data = await apiService.getContactQueries();
      setQueries(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSuccess("");
    try {
      await apiService.createSubscriptionPlan(newPlanName, newPlanPrice, newPlanMaxUsers, newPlanAllowedModules);
      setPlanSuccess(`Successfully created pricing plan "${newPlanName}"!`);
      setNewPlanName("");
      setNewPlanPrice(99);
      setNewPlanMaxUsers(50);
      loadPlans();
      setTimeout(() => setPlanSuccess(""), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to create subscription plan");
    }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSuccess("");
    try {
      const targetId = alertTargetOrgId === "" ? null : Number(alertTargetOrgId);
      await apiService.sendSystemNotification(alertTitle, alertContent, targetId);
      setAlertSuccess("Direct notification dispatched successfully!");
      setAlertTitle("");
      setAlertContent("");
      setAlertTargetOrgId("");
      setTimeout(() => setAlertSuccess(""), 3000);
    } catch (e) {
      alert("Failed to send notification alert");
    }
  };

  const handleToggleModule = async (orgId: number, moduleName: string, isCurrentlyAllowed: boolean) => {
    const org = orgs.find((o) => o.id === orgId);
    if (!org) return;

    let activeList = org.modulesActive ? org.modulesActive.split(",") : ["ATTENDANCE", "PAYROLL", "SPRINTS", "TICKETS"];
    if (isCurrentlyAllowed) {
      activeList = activeList.filter((m: string) => m !== moduleName);
    } else {
      activeList.push(moduleName);
    }

    try {
      await apiService.toggleOrgModules(orgId, activeList.join(","));
      loadOrganizations();
    } catch (e) {
      alert("Failed to toggle module feature");
    }
  };

  const loadSystemStatus = async () => {
    try {
      const status = await apiService.getSystemStatus();
      setSystemStatus(status);
    } catch (e) {
      console.error("Failed to load system status", e);
    }
  };

  const loadOrganizations = async () => {
    try {
      const data = await apiService.getOrganizations();
      setOrgs(data);
    } catch (e) {
      console.error("Failed to load organizations", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      const newOrg = await apiService.createOrganization({
        name,
        orgType,
        ownerGmail,
        ownerMobile,
        planType,
      });

      setFormSuccess(`Successfully provisioned organization: ${newOrg.name}`);
      setName("");
      setOwnerGmail("");
      setOwnerMobile("");
      loadOrganizations();
    } catch (err: any) {
      setFormError(err.message || "Failed to create organization");
    }
  };

  const handleEditClick = (org: Organization) => {
    setEditingOrg(org);
    setEditName(org.name);
    setEditOrgType(org.orgType);
    setEditOwnerGmail(org.ownerGmail);
    setEditOwnerMobile(org.ownerMobile);
    setEditPlanType(org.planType);
    setEditOtpCode(org.otpCode);
    setEditError("");
  };

  const handleUpdateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setEditError("");

    try {
      await apiService.updateOrganization(editingOrg.id, {
        name: editName,
        orgType: editOrgType as any,
        ownerGmail: editOwnerGmail,
        ownerMobile: editOwnerMobile,
        planType: editPlanType as any,
        otpCode: editOtpCode,
      });

      setEditingOrg(null);
      loadOrganizations();
    } catch (err: any) {
      setEditError(err.message || "Failed to update organization");
    }
  };

  const handleDeleteOrg = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this organization? This action is irreversible.")) return;

    try {
      await apiService.deleteOrganization(id);
      loadOrganizations();
    } catch (err: any) {
      alert(err.message || "Failed to delete organization");
    }
  };

  const handleLogout = () => {
    apiService.logout();
    window.location.href = "/superadmin";
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Drag and Drop simulation functions
  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    // Swap
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;

    setBlocks(newBlocks);
  };

  const handleBlockChange = (index: number, fields: Partial<LandingPageBlock>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...fields };
    setBlocks(newBlocks);
  };

  const handleSaveLayout = () => {
    apiService.saveLandingPageSchema(blocks);
    setBuilderSuccess("Layout successfully published to the live landing page!");
    setTimeout(() => setBuilderSuccess(""), 3000);
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Verifying administrator credentials...
      </div>
    );
  }

  // Calculate Overview Diagnostics
  const totalOrgs = orgs.length;
  const standardCount = orgs.filter(o => o.planType === "STANDARD").length;
  const midlevelCount = orgs.filter(o => o.planType === "MIDLEVEL").length;
  const enterpriseCount = orgs.filter(o => o.planType === "ENTERPRISE").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-35">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_0_12px_rgba(79,70,229,0.3)]">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-md">Zenelait Superadmin</span>
            <span className="text-[10px] text-indigo-400 block font-semibold uppercase tracking-wider">Workforce Network</span>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => setActiveSubTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === "overview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab("orgs")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === "orgs" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tenants
          </button>
          <button
            onClick={() => setActiveSubTab("plans")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === "plans" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Plans & Features
          </button>
          <button
            onClick={() => setActiveSubTab("notifications")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === "notifications" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Notifications & Inquiries
          </button>
          <button
            onClick={() => setActiveSubTab("builder")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === "builder" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Page Builder
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-300">System Operator</div>
            <div className="text-[10px] text-slate-500">role: superadmin</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs font-semibold hover:bg-slate-850 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8">
        
        {/* SUBTAB 1: Overview */}
        {activeSubTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Tenants</span>
                  <Database className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="text-3xl font-extrabold">{totalOrgs}</div>
                <span className="text-[10px] text-slate-505">Active MySQL DB clusters</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Standard Plans</span>
                  <Briefcase className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold">{standardCount}</div>
                <span className="text-[10px] text-slate-505">Up to 150 seats</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Midlevel Plans</span>
                  <Briefcase className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold">{midlevelCount}</div>
                <span className="text-[10px] text-slate-505">Up to 500 seats</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-900 rounded-xl p-6 flex flex-col gap-2">
                <div className="flex justify-between items-center text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Enterprise Plans</span>
                  <Briefcase className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold">{enterpriseCount}</div>
                <span className="text-[10px] text-slate-550">Unlimited custom clusters</span>
              </div>
            </div>

            {/* Performance status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-6 lg:col-span-2 flex flex-col gap-4">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                  System Cluster Availability
                </h3>
                <div className="space-y-4">
                  {[
                    { label: "Java Environment Runtime", status: `Active (JDK ${systemStatus.javaVersion || 'Loading...'}) - ${systemStatus.activeProfile || 'Loading'} Profile`, perf: `${systemStatus.processors} cores` },
                    { label: "Redis Caching Node", status: systemStatus.redisCache, perf: `Free Mem: ${systemStatus.freeMemory}` },
                    { label: "Kafka Audit Producer Streams", status: systemStatus.kafkaBroker, perf: `Total Mem: ${systemStatus.totalMemory}` },
                  ].map((sys) => (
                    <div key={sys.label} className="flex justify-between items-center border-b border-slate-900 pb-3 text-xs">
                      <div>
                        <div className="font-semibold">{sys.label}</div>
                        <div className="text-emerald-400 text-[10px] mt-0.5">{sys.status}</div>
                      </div>
                      <span className="bg-slate-900 px-2.5 py-1 rounded text-slate-400 font-medium">{sys.perf}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plans description widget */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-6 flex flex-col gap-4">
                <h3 className="font-bold text-sm text-slate-300 flex items-center gap-1.5">
                  <Layers className="h-4.5 w-4.5 text-purple-400" />
                  Subscription Plan Schemes
                </h3>
                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-lg">
                    <span className="font-bold text-emerald-450 uppercase text-[9px] block">STANDARD</span>
                    <p className="text-slate-400 mt-1">Geared for startups. Provides standard IT/Marketing dashboards and base employee directory.</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-lg">
                    <span className="font-bold text-purple-450 uppercase text-[9px] block">MIDLEVEL</span>
                    <p className="text-slate-400 mt-1">Geared for growing firms. Custom widgets, active sprint velocity models, and payroll estimators.</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-900 p-3 rounded-lg">
                    <span className="font-bold text-amber-500 uppercase text-[9px] block">ENTERPRISE</span>
                    <p className="text-slate-400 mt-1">Full database integration, custom assembly schedules, safety logging, and Dedicated cluster pipelines.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: Organizations CRUD */}
        {activeSubTab === "orgs" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Left Side: Create Organization Form */}
            <section className="lg:col-span-4 flex flex-col gap-6">
              <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 backdrop-blur shadow-xl">
                <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-400" />
                  <span>Create Organization</span>
                </h2>
                <p className="text-xs text-slate-500 mb-6">Provision a new company workspace, auto-generate codes, and allocate subscriptions.</p>

                {formError && (
                  <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-455">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400 font-semibold">
                    {formSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateOrg} className="flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Organization Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corp"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Type</label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="IT">IT</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="SALES">Sales</option>
                      <option value="CORPORATE">Corporate</option>
                      <option value="MANUFACTURING">Manufacturing</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Owner Gmail</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. owner@acme.com"
                      value={ownerGmail}
                      onChange={(e) => setOwnerGmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Owner Mobile Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={ownerMobile}
                      onChange={(e) => setOwnerMobile(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Subscription Plan</label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="STANDARD">Standard Plan</option>
                      <option value="MIDLEVEL">Midlevel Plan</option>
                      <option value="ENTERPRISE">Enterprise Plan</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    Provision Workspace
                  </button>
                </form>
              </div>
            </section>

            {/* Right Side: Registered Organizations List */}
            <section className="lg:col-span-8 flex flex-col gap-6">
              <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 backdrop-blur shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-lg font-bold">Registered Organizations</h2>
                    <p className="text-xs text-slate-500">Live listings registered in the database cluster.</p>
                  </div>
                  <span className="text-xs font-semibold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    Total: {orgs.length}
                  </span>
                </div>

                {loading ? (
                  <div className="py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
                    <div className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <span>Loading database instances...</span>
                  </div>
                ) : orgs.length === 0 ? (
                  <div className="py-16 text-center text-slate-650 text-xs">
                    No active tenant slots registered yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-900">
                    <table className="w-full border-collapse text-left text-xs text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-900 bg-slate-950/60 font-semibold text-slate-400">
                          <th className="px-4 py-3">Company</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Plan</th>
                          <th className="px-4 py-3">Org Code</th>
                          <th className="px-4 py-3">OTP</th>
                          <th className="px-4 py-3">Owner Contacts</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 bg-slate-950/10">
                        {orgs.map((org) => (
                          <tr key={org.id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-100">{org.name}</td>
                            <td className="px-4 py-3">
                              <span className="bg-slate-900/60 border border-slate-850 px-2 py-0.5 rounded text-[10px] uppercase font-semibold text-indigo-400">
                                {org.orgType}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium">
                              <span className={`text-[10px] font-semibold ${
                                org.planType === "ENTERPRISE" ? "text-amber-500" :
                                org.planType === "MIDLEVEL" ? "text-purple-400" : "text-emerald-400"
                              }`}>
                                {org.planType}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-900 text-[10px] text-slate-400">{org.orgCode}</span>
                                <button
                                  onClick={() => copyToClipboard(org.orgCode, `${org.id}-code`)}
                                  className="text-slate-500 hover:text-white p-1 transition-colors cursor-pointer"
                                  title="Copy Org Code"
                                >
                                  {copiedId === `${org.id}-code` ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-amber-500">
                              <div className="flex items-center gap-1">
                                <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">{org.otpCode}</span>
                                <button
                                  onClick={() => copyToClipboard(org.otpCode, `${org.id}-otp`)}
                                  className="text-slate-500 hover:text-white p-1 transition-colors cursor-pointer"
                                  title="Copy OTP"
                                >
                                  {copiedId === `${org.id}-otp` ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="flex items-center gap-1 text-slate-400"><Mail className="h-3 w-3 text-slate-500" /> {org.ownerGmail}</span>
                                <span className="flex items-center gap-1 text-slate-450"><Phone className="h-3 w-3 text-slate-500" /> {org.ownerMobile}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditClick(org)}
                                  className="text-indigo-400 hover:text-indigo-300 p-1 hover:bg-slate-900 rounded cursor-pointer transition-colors"
                                  title="Edit Organization"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrg(org.id)}
                                  className="text-rose-500 hover:text-rose-400 p-1 hover:bg-slate-900 rounded cursor-pointer transition-colors"
                                  title="Delete Organization"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* SUBTAB 3: Plans & Features */}
        {activeSubTab === "plans" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
            {/* Create Pricing Plan Form */}
            <div className="lg:col-span-1 bg-slate-900/30 border border-slate-900 rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-350 flex items-center gap-1.5">
                  Create Subscription Plan
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">Configure customized subscription pricing tiers for new clients.</p>
              </div>

              {planSuccess && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-450 font-semibold">
                  {planSuccess}
                </div>
              )}

              <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Select Billing Currency</label>
                  <div className="flex bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCurrency("USD")}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-colors ${
                        currency === "USD" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      USD ($)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency("INR")}
                      className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-colors ${
                        currency === "INR" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      INR (₹)
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    placeholder="e.g. PROFESSIONAL"
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Price per Month ({currency === "USD" ? "$" : "₹"})</label>
                  <input
                    type="number"
                    required
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Max User Count</label>
                  <input
                    type="number"
                    required
                    value={newPlanMaxUsers}
                    onChange={(e) => setNewPlanMaxUsers(Number(e.target.value))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Allowed Modules (comma-separated)</label>
                  <input
                    type="text"
                    required
                    value={newPlanAllowedModules}
                    onChange={(e) => setNewPlanAllowedModules(e.target.value)}
                    placeholder="ATTENDANCE,PAYROLL,SPRINTS"
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Create Plan Tier
                </button>
              </form>
            </div>

            {/* List Toggles */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-300 mb-4">Pricing Plan Catalog</h3>
                <div className="space-y-3">
                  {plans.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500 font-semibold">No custom plans configured.</div>
                  ) : (
                    plans.map((p) => (
                      <div key={p.id} className="p-3 bg-slate-955/40 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-200">{p.name}</span>
                          <span className="text-[10px] text-slate-500 block">Up to {p.maxUsers} active users</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-indigo-400 font-extrabold">{currency === "USD" ? "$" : "₹"}{p.price}/mo</span>
                          <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-2 py-0.5 rounded font-semibold">{p.allowedModules}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modules Toggles per organization */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-300 mb-2">Tenant Operational Feature Switches</h3>
                <p className="text-[11px] text-slate-500 mb-4">Selectively activate or deactivate features and dashboard modules for organizations.</p>

                <div className="overflow-x-auto border border-slate-900 rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 bg-slate-950/40">
                        <th className="py-2.5 px-3 font-semibold text-slate-400">Organization</th>
                        <th className="py-2.5 px-3 font-semibold text-slate-400 text-center">Attendance</th>
                        <th className="py-2.5 px-3 font-semibold text-slate-400 text-center">Payroll</th>
                        <th className="py-2.5 px-3 font-semibold text-slate-400 text-center">Sprints</th>
                        <th className="py-2.5 px-3 font-semibold text-slate-400 text-center">Tickets</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {orgs.map((org) => {
                        const activeList = org.modulesActive ? org.modulesActive.split(",") : ["ATTENDANCE", "PAYROLL", "SPRINTS", "TICKETS"];
                        return (
                          <tr key={org.id} className="hover:bg-slate-900/10">
                            <td className="py-3 px-3 font-bold">{org.name}</td>
                            {["ATTENDANCE", "PAYROLL", "SPRINTS", "TICKETS"].map((mod) => {
                              const isAllowed = activeList.includes(mod);
                              return (
                                <td key={mod} className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isAllowed}
                                    onChange={() => handleToggleModule(org.id, mod, isAllowed)}
                                    className="h-3.5 w-3.5 accent-indigo-600 cursor-pointer"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: Notifications & Inquiries */}
        {activeSubTab === "notifications" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
            
            {/* HR Alert Drawer Form */}
            <div className="lg:col-span-1 bg-slate-900/30 border border-slate-900 rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <h3 className="font-bold text-sm text-slate-300">Broadcast HR System Alert</h3>
                <p className="text-[11px] text-slate-500 mt-1">Send a dynamic alert or notification warning straight to organization dashboards.</p>
              </div>

              {alertSuccess && (
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-450 font-semibold">
                  {alertSuccess}
                </div>
              )}

              <form onSubmit={handleSendAlert} className="space-y-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Target HR Workspace</label>
                  <select
                    value={alertTargetOrgId}
                    onChange={(e) => setAlertTargetOrgId(e.target.value)}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Broadcast to All Organizations</option>
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Alert Title</label>
                  <input
                    type="text"
                    required
                    value={alertTitle}
                    onChange={(e) => setAlertTitle(e.target.value)}
                    placeholder="e.g. Scheduled System Upgrade"
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-slate-400 font-semibold">Content Message</label>
                  <textarea
                    required
                    rows={4}
                    value={alertContent}
                    onChange={(e) => setAlertContent(e.target.value)}
                    placeholder="Provide details..."
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold cursor-pointer"
                >
                  Send Alert
                </button>
              </form>
            </div>

            {/* Queries & Expirations lists */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Expiration logs */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-300 mb-2">Tenant Plan Expiration Monitor</h3>
                <p className="text-[11px] text-slate-500 mb-4">Monitors organization expiration dates. Send a quick alert reminder if trial cycles are ending.</p>

                <div className="space-y-3">
                  {orgs.map((org) => {
                    const daysRemaining = org.id === 1 ? 5 : org.id === 2 ? 18 : 30;
                    return (
                      <div key={org.id} className="p-3 bg-slate-955/40 border border-slate-900 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-200">{org.name}</span>
                          <span className="text-[10px] text-slate-500 block">Plan Tier: {org.planType}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold ${daysRemaining <= 5 ? "text-rose-500" : "text-amber-500"}`}>
                            Expiring in {daysRemaining} days
                          </span>
                          <button
                            onClick={() => {
                              setAlertTargetOrgId(String(org.id));
                              setAlertTitle("Subscription Expiration Warning");
                              setAlertContent(`Dear ${org.name} Administrator,\nYour current subscription plan ${org.planType} is expiring in ${daysRemaining} days. Please update billing routing credentials to prevent workspace interruption.`);
                            }}
                            className="bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-850 px-2 py-1 rounded text-[10px] font-semibold cursor-pointer"
                          >
                            Warn HR
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Public visitor queries */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-300 mb-4">Public Landing Inquiries</h3>
                <div className="space-y-4">
                  {queries.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500 font-semibold">No queries submitted from public landing page.</div>
                  ) : (
                    queries.map((q) => (
                      <div key={q.id} className="p-4 bg-slate-955/40 border border-slate-900 rounded-xl text-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-indigo-400">{q.name} ({q.email})</span>
                          <span className="text-[10px] text-slate-500">{new Date(q.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 font-medium leading-relaxed">{q.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 5: Draggable Layout Page Builder */}
        {activeSubTab === "builder" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 backdrop-blur shadow-xl text-left">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-400" />
                    <span>Public Landing Page Editor</span>
                  </h2>
                  <p className="text-xs text-slate-500">Drag/reorder elements, customize headers, edit copy, and toggle block visibility on the live landing page.</p>
                </div>
                <button
                  onClick={handleSaveLayout}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/10 cursor-pointer transition-colors"
                >
                  Publish Layout Changes
                </button>
              </div>

              {builderSuccess && (
                <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-450 font-semibold">
                  {builderSuccess}
                </div>
              )}

              {/* Block List Draggable Simulation */}
              <div className="space-y-4">
                {blocks.map((block, idx) => (
                  <div
                    key={block.id}
                    className={`border rounded-xl p-5 flex flex-col gap-4 bg-slate-950/40 transition-colors ${
                      block.visible ? "border-slate-800" : "border-slate-900 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div className="flex items-center gap-3">
                        {/* Drag Handle simulation */}
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => moveBlock(idx, "up")}
                            disabled={idx === 0}
                            className="text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => moveBlock(idx, "down")}
                            disabled={idx === blocks.length - 1}
                            className="text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {block.type} Block
                          </span>
                          <h4 className="font-bold text-sm text-slate-200 mt-1">{block.title}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleBlockChange(idx, { visible: !block.visible })}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            block.visible
                              ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400"
                              : "bg-slate-900 border-slate-800 text-slate-500"
                          }`}
                          title={block.visible ? "Hide Block" : "Show Block"}
                        >
                          {block.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Block inputs */}
                    {block.visible && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-slate-500 font-semibold">Block Headline / Title</label>
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) => handleBlockChange(idx, { title: e.target.value })}
                            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-slate-500 font-semibold">Subtitle / Body Description</label>
                          <input
                            type="text"
                            value={block.subtitle}
                            onChange={(e) => handleBlockChange(idx, { subtitle: e.target.value })}
                            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        {block.type === "hero" && (
                          <>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-slate-500 font-semibold">Call-To-Action Button Label</label>
                              <input
                                type="text"
                                value={block.ctaText || ""}
                                onChange={(e) => handleBlockChange(idx, { ctaText: e.target.value })}
                                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-slate-500 font-semibold">Hero Background Image URL</label>
                              <input
                                type="text"
                                value={block.imageUrl || ""}
                                onChange={(e) => handleBlockChange(idx, { imageUrl: e.target.value })}
                                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                              />
                            </div>
                          </>
                        )}
                        {block.contentList && (
                          <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-slate-500 font-semibold">Block Feature Items (comma-separated list)</label>
                            <textarea
                              rows={2}
                              value={block.contentList.join(", ")}
                              onChange={(e) =>
                                handleBlockChange(idx, {
                                  contentList: e.target.value.split(",").map((s) => s.trim()),
                                })
                              }
                              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal Dialog */}
      {editingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl relative text-left">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-indigo-400 animate-spin" />
              <span>Modify Organization Settings</span>
            </h3>

            {editError && (
              <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateOrg} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-semibold">Organization Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 focus:border-indigo-500 focus:outline-none text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-semibold">Type</label>
                <select
                  value={editOrgType}
                  onChange={(e) => setEditOrgType(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 focus:border-indigo-500 focus:outline-none text-slate-355"
                >
                  <option value="IT">IT</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="SALES">Sales</option>
                  <option value="CORPORATE">Corporate</option>
                  <option value="MANUFACTURING">Manufacturing</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-semibold">Owner Gmail</label>
                <input
                  type="email"
                  required
                  value={editOwnerGmail}
                  onChange={(e) => setEditOwnerGmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 focus:border-indigo-500 focus:outline-none text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-semibold">Owner Mobile Number</label>
                <input
                  type="text"
                  required
                  value={editOwnerMobile}
                  onChange={(e) => setEditOwnerMobile(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 focus:border-indigo-500 focus:outline-none text-slate-100"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-semibold">Subscription Plan</label>
                <select
                  value={editPlanType}
                  onChange={(e) => setEditPlanType(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 focus:border-indigo-500 focus:outline-none text-slate-355"
                >
                  <option value="STANDARD">Standard Plan</option>
                  <option value="MIDLEVEL">Midlevel Plan</option>
                  <option value="ENTERPRISE">Enterprise Plan</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500 font-semibold">OTP Registration Bypass Code</label>
                <input
                  type="text"
                  required
                  value={editOtpCode}
                  onChange={(e) => setEditOtpCode(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 focus:border-indigo-500 focus:outline-none text-slate-100 font-mono text-center text-sm font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-900">
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
                  className="px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
