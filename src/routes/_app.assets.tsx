import { createFileRoute } from "@tanstack/react-router";
import { Laptop, Plus, Check, ClipboardList, PenTool, ShieldAlert, Sparkles, User, Key, UserCheck, Settings, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User as APIUser } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/assets")({
  head: () => ({
    meta: [
      { title: "Asset Management · Zenelait HRMS" },
      { name: "description", content: "Assign, maintain, and audit corporate hardware assets." },
    ],
  }),
  component: AssetManagementPage,
});

function AssetManagementPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<APIUser[]>([]);

  // Asset creation form state
  const [newTag, setNewTag] = useState("");
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("In Stock");
  const [newAssignee, setNewAssignee] = useState("Unassigned");

  // Re-assignment helper states
  const [editingAssetId, setEditingAssetId] = useState<number | null>(null);
  const [editAssignee, setEditAssignee] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      setEmployees(uList.filter(u => u.role !== "SUPERADMIN"));

      const assetList = isAdmin
        ? await apiService.getAssets(orgId)
        : await apiService.getAssets(orgId, loggedInUsername);
      setAssets(assetList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  useEffect(() => {
    if (assets.length > 0) {
      const tagNums = assets
        .map(a => {
          const match = a.assetTag?.match(/AST-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter(n => n > 0);
      const nextNum = tagNums.length > 0 ? Math.max(...tagNums) + 1 : 101;
      setNewTag(`AST-${nextNum}`);
    } else {
      setNewTag("AST-101");
    }
  }, [assets]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newTag || !newName) return;
    setLoading(true);
    try {
      await apiService.saveAsset(orgId, {
        assetTag: newTag,
        name: newName,
        status: newStatus,
        assignee: newAssignee,
      });
      setNewName("");
      setNewStatus("In Stock");
      setNewAssignee("Unassigned");
      await loadData();
    } catch (e) {
      alert("Failed to catalog asset");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAssign = async (assetId: number) => {
    if (!orgId) return;
    setLoading(true);
    try {
      await apiService.assignAsset(orgId, assetId, editAssignee, editStatus);
      setEditingAssetId(null);
      await loadData();
    } catch (e) {
      alert("Failed to assign asset");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (asset: any) => {
    setEditingAssetId(asset.id);
    setEditAssignee(asset.assignee);
    setEditStatus(asset.status);
  };

  // Metrics
  const totalCount = assets.length;
  const allocatedCount = assets.filter(a => a.status === "Allocated").length;
  const inStockCount = assets.filter(a => a.status === "In Stock").length;
  const maintenanceCount = assets.filter(a => a.status === "Maintenance").length;

  const getManufacturerBreakdown = () => {
    let apple = 0, dell = 0, lenovo = 0, other = 0;
    assets.forEach(a => {
      const nameLower = (a.name || "").toLowerCase();
      if (nameLower.includes("apple") || nameLower.includes("macbook") || nameLower.includes("iphone")) {
        apple++;
      } else if (nameLower.includes("dell") || nameLower.includes("xps")) {
        dell++;
      } else if (nameLower.includes("lenovo") || nameLower.includes("thinkpad")) {
        lenovo++;
      } else {
        other++;
      }
    });
    const total = assets.length || 1;
    return {
      Apple: { count: apple, pct: Math.round((apple * 100) / total) },
      Dell: { count: dell, pct: Math.round((dell * 100) / total) },
      Lenovo: { count: lenovo, pct: Math.round((lenovo * 100) / total) },
      Other: { count: other, pct: Math.round((other * 100) / total) },
    };
  };

  const manufacturerBreakdown = getManufacturerBreakdown();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Catalog & Assignment"
        description={
          isAdmin
            ? "Catalog company hardware, manage employee asset allocations, and track maintenance lifecycles."
            : "Review the development hardware, access keys, and mobile equipment assigned to you."
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Total Assets</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-slate-100">{totalCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Allocated</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-indigo-300">{allocatedCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-400 font-semibold">In Stock</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-emerald-300">{inStockCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-amber-300">{maintenanceCount}</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Asset Roster */}
        <Card className="md:col-span-2 bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-base flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-indigo-500" />
              {isAdmin ? "Company Asset Registry" : "My Handed-Over Equipment"}
            </CardTitle>
            <CardDescription>
              {isAdmin ? "Catalog records of all laptops, phones and secure hardware devices." : "Review details of items assigned to your profile."}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-450 tracking-wider">
                    <th className="py-2.5 px-3">Asset Tag</th>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Assignee</th>
                    {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {assets.map(a => {
                    const isEditing = editingAssetId === a.id;
                    return (
                      <tr key={a.id} className="border-b border-slate-800/60 hover:bg-slate-900/20 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-200">{a.assetTag}</td>
                        <td className="py-3 px-3 text-slate-200">{a.name}</td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <Select value={editStatus} onValueChange={setEditStatus}>
                              <SelectTrigger className="h-7 bg-slate-950 border-slate-800 text-[11px] text-white w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-950 border-slate-800 text-white">
                                <SelectItem value="In Stock">In Stock</SelectItem>
                                <SelectItem value="Allocated">Allocated</SelectItem>
                                <SelectItem value="Maintenance">Maintenance</SelectItem>
                                <SelectItem value="Retired">Retired</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge
                              className={
                                a.status === "Allocated"
                                  ? "bg-blue-500/10 text-blue-450 border border-blue-500/20"
                                  : a.status === "In Stock"
                                  ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20"
                                  : a.status === "Maintenance"
                                  ? "bg-amber-500/10 text-amber-450 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-550 border border-rose-500/20"
                              }
                            >
                              {a.status}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <Select value={editAssignee} onValueChange={setEditAssignee}>
                              <SelectTrigger className="h-7 bg-slate-950 border-slate-800 text-[11px] text-white w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-950 border-slate-800 text-white">
                                <SelectItem value="Unassigned">Unassigned</SelectItem>
                                {employees.map(emp => (
                                  <SelectItem key={emp.id} value={emp.username}>{emp.username}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-slate-350">{a.assignee}</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-3 text-right">
                            {isEditing ? (
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  className="h-6 w-12 bg-emerald-600 hover:bg-emerald-500 text-[10px] cursor-pointer"
                                  onClick={() => handleQuickAssign(a.id)}
                                  disabled={loading}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 w-12 border-slate-800 text-[10px] cursor-pointer"
                                  onClick={() => setEditingAssetId(null)}
                                  disabled={loading}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 border-slate-800 hover:border-slate-700 text-[10px] cursor-pointer"
                                onClick={() => startEdit(a)}
                              >
                                <Settings className="h-3 w-3 mr-1" /> Manage
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                  {assets.length === 0 && (
                    <tr>
                      <td colSpan={isAdmin ? 5 : 4} className="text-center py-10 text-slate-500">
                        No assets cataloged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* HR Cataloging Form / Info Panel */}
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5">
                <Laptop className="h-4 w-4" />
                Manufacturer Fleet Share
              </CardTitle>
              <CardDescription className="text-[10px]">Dynamic MySQL distribution for IT Company Org.</CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-slate-350 space-y-3.5 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-200">Apple Inc.</span>
                  <span className="text-slate-450">{manufacturerBreakdown.Apple.count} units ({manufacturerBreakdown.Apple.pct}%)</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${manufacturerBreakdown.Apple.pct}%` }} />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-200">Dell Technologies</span>
                  <span className="text-slate-450">{manufacturerBreakdown.Dell.count} units ({manufacturerBreakdown.Dell.pct}%)</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${manufacturerBreakdown.Dell.pct}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-200">Lenovo Group</span>
                  <span className="text-slate-450">{manufacturerBreakdown.Lenovo.count} units ({manufacturerBreakdown.Lenovo.pct}%)</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${manufacturerBreakdown.Lenovo.pct}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-medium text-slate-200">Other / Access Cards</span>
                  <span className="text-slate-450">{manufacturerBreakdown.Other.count} units ({manufacturerBreakdown.Other.pct}%)</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${manufacturerBreakdown.Other.pct}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {isAdmin ? (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm">Catalog New Asset</CardTitle>
                <CardDescription>Add a new hardware device to the inventory.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAsset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="asset-tag" className="text-xs text-slate-350">Asset Tag ID</Label>
                    <Input
                      id="asset-tag"
                      placeholder="e.g. AST-108"
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-name" className="text-xs text-slate-350">Asset Description / Name</Label>
                    <Input
                      id="asset-name"
                      placeholder="e.g. Apple MacBook Pro M3"
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-status" className="text-xs text-slate-350">Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger id="asset-status" className="bg-slate-950 border-slate-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Allocated">Allocated</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Retired">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="asset-assignee" className="text-xs text-slate-350">Assignee</Label>
                    <Select value={newAssignee} onValueChange={setNewAssignee}>
                      <SelectTrigger id="asset-assignee" className="bg-slate-950 border-slate-800 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-950 border-slate-800 text-white">
                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.username}>{emp.username}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                    <Plus className="mr-1.5 h-4 w-4" /> Add Asset to Catalog
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-amber-950/20 border-amber-900/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-amber-450 font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  Hardware Policy Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-400 leading-relaxed space-y-2">
                <p>
                  You are responsible for all physical assets assigned to your profile. Laptops, phone stubs, and key cards must be returned upon exit.
                </p>
                <div className="flex gap-1 items-center font-semibold text-slate-200">
                  <Wrench className="h-3 w-3 text-amber-400" />
                  <span>Report Damage:</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Submit a ticket under self-service or contact your Welcome Buddy if an item requires repair or IT troubleshooting.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
