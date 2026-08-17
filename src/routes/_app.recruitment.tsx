import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Briefcase, Plus, Mail, ArrowRight, ArrowLeft, MoreHorizontal, User, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/recruitment")({
  head: () => ({
    meta: [
      { title: "Recruitment · Zenelait HRMS" },
      { name: "description", content: "Requisitions, job postings, candidates, interviews and offers." },
    ],
  }),
  component: RecruitmentPage,
});

const PIPELINE_STAGES = [
  { key: "Applied", label: "Applied", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { key: "Screening", label: "Screening", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { key: "Interview", label: "Interview", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  { key: "Offered", label: "Offered", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  { key: "Hired", label: "Hired", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  { key: "Rejected", label: "Rejected", color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
];

function RecruitmentPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";

  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  // Dialog Open States
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);

  // New Job Form State
  const [newJob, setNewJob] = useState({ title: "", department: "" });
  
  // New Candidate Form State
  const [newCandidate, setNewCandidate] = useState({ name: "", email: "", jobRequisitionId: "" });

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const jobList = await apiService.getJobs(orgId);
      setJobs(jobList);
      const candidateList = await apiService.getCandidates(orgId);
      setCandidates(candidateList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newJob.title || !newJob.department) return;
    setLoading(true);
    try {
      await apiService.createJob(orgId, newJob);
      setNewJob({ title: "", department: "" });
      setJobModalOpen(false);
      await loadData();
    } catch (e) {
      alert("Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newCandidate.name || !newCandidate.email || !newCandidate.jobRequisitionId) return;
    setLoading(true);
    try {
      await apiService.createCandidate(orgId, {
        name: newCandidate.name,
        email: newCandidate.email,
        jobRequisitionId: parseInt(newCandidate.jobRequisitionId)
      });
      setNewCandidate({ name: "", email: "", jobRequisitionId: "" });
      setCandidateModalOpen(false);
      await loadData();
    } catch (e) {
      alert("Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStage = async (candidateId: number, currentStage: string, direction: "next" | "prev") => {
    if (!orgId) return;
    const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === currentStage);
    let nextIdx = currentIdx;
    if (direction === "next" && currentIdx < PIPELINE_STAGES.length - 1) {
      nextIdx = currentIdx + 1;
    } else if (direction === "prev" && currentIdx > 0) {
      nextIdx = currentIdx - 1;
    }

    if (nextIdx === currentIdx) return;
    const nextStage = PIPELINE_STAGES[nextIdx].key;

    setLoading(true);
    try {
      await apiService.updateCandidateStage(orgId, candidateId, nextStage);
      await loadData();
    } catch (e) {
      alert("Failed to update stage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Recruitment Workspace" 
        description="Streamline job postings, manage candidates, and track screening stages with a dynamic Kanban pipeline."
      />

      <Tabs defaultValue="pipeline" className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Candidates Pipeline
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              Job Openings ({jobs.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap gap-2">
            {isAdmin && (
              <>
                <Dialog open={jobModalOpen} onOpenChange={setJobModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs flex items-center gap-1">
                      <Plus className="h-4 w-4" /> Add Job Requisition
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 border border-slate-800 text-white">
                    <form onSubmit={handleCreateJob}>
                      <DialogHeader>
                        <DialogTitle>New Job Requisition</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Create an open position requisition. Once saved, candidates can apply.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="job-title" className="text-slate-350">Job Title</Label>
                          <Input 
                            id="job-title" 
                            placeholder="e.g. Senior Java Developer" 
                            className="bg-slate-900 border-slate-800 text-white"
                            value={newJob.title}
                            onChange={(e) => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="job-dept" className="text-slate-350">Department</Label>
                          <Select 
                            value={newJob.department}
                            onValueChange={(val) => setNewJob(prev => ({ ...prev, department: val }))}
                          >
                            <SelectTrigger id="job-dept" className="bg-slate-900 border-slate-800 text-white">
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 text-white">
                              <SelectItem value="Engineering">Engineering</SelectItem>
                              <SelectItem value="Product">Product Management</SelectItem>
                              <SelectItem value="Design">Design</SelectItem>
                              <SelectItem value="Human Resources">Human Resources</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setJobModalOpen(false)} className="text-slate-350 hover:bg-slate-900">
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={loading}>
                          Create Requisition
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={candidateModalOpen} onOpenChange={setCandidateModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900/50 text-slate-350 hover:bg-slate-850 cursor-pointer text-xs flex items-center gap-1">
                      <UserPlus className="h-4 w-4" /> Add Candidate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-950 border border-slate-800 text-white">
                    <form onSubmit={handleCreateCandidate}>
                      <DialogHeader>
                        <DialogTitle>Add Candidate Application</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Log a new applicant profile into the active recruitment workspace.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="cand-name" className="text-slate-350">Candidate Name</Label>
                          <Input 
                            id="cand-name" 
                            placeholder="e.g. Alice Smith" 
                            className="bg-slate-900 border-slate-800 text-white"
                            value={newCandidate.name}
                            onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cand-email" className="text-slate-350">Email Address</Label>
                          <Input 
                            id="cand-email" 
                            type="email"
                            placeholder="e.g. alice.smith@gmail.com" 
                            className="bg-slate-900 border-slate-800 text-white"
                            value={newCandidate.email}
                            onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cand-job" className="text-slate-350">Applying For</Label>
                          <Select 
                            value={newCandidate.jobRequisitionId}
                            onValueChange={(val) => setNewCandidate(prev => ({ ...prev, jobRequisitionId: val }))}
                          >
                            <SelectTrigger id="cand-job" className="bg-slate-900 border-slate-800 text-white">
                              <SelectValue placeholder="Select Job Position" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-slate-800 text-white">
                              {jobs.filter(j => j.status === "Open").map(j => (
                                <SelectItem key={j.id} value={j.id.toString()}>{j.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setCandidateModalOpen(false)} className="text-slate-350 hover:bg-slate-900">
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500" disabled={loading}>
                          Add Candidate
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={loadData} className="text-slate-350 hover:bg-slate-900 cursor-pointer">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* pipeline Tab */}
        <TabsContent value="pipeline" className="outline-none">
          <div className="w-full overflow-x-auto pb-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:min-w-[1000px]">
            {PIPELINE_STAGES.map(stage => {
              const stageCandidates = candidates.filter(c => c.stage === stage.key);
              return (
                <div key={stage.key} className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-3 space-y-3 flex flex-col min-h-[500px]">
                  {/* Column Header */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-300">{stage.label}</span>
                    <Badge variant="outline" className={`${stage.color} text-[10px] px-1.5 py-0.2`}>
                      {stageCandidates.length}
                    </Badge>
                  </div>

                  {/* Candidate Cards List */}
                  <div className="flex-1 space-y-2 overflow-y-auto">
                    {stageCandidates.map(cand => {
                      const matchedJob = jobs.find(j => j.id === cand.jobRequisitionId);
                      return (
                        <Card key={cand.id} className="bg-slate-950 border-slate-850 hover:border-indigo-500/40 transition-colors p-2.5 space-y-2.5">
                          <div className="space-y-1">
                            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                              <User className="h-3 w-3 text-slate-400" />
                              {cand.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                              <Mail className="h-2.5 w-2.5" />
                              {cand.email}
                            </p>
                          </div>

                          <div className="border-t border-slate-900 pt-1.5 flex justify-between items-center">
                            <span className="text-[9px] text-indigo-400 font-medium truncate max-w-[80px]">
                              {matchedJob ? matchedJob.title : "Unknown Position"}
                            </span>
                            
                            {isAdmin && (
                              <div className="flex gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-5 w-5 hover:bg-slate-850 cursor-pointer"
                                  disabled={stage.key === "Applied" || loading}
                                  onClick={() => handleMoveStage(cand.id, cand.stage, "prev")}
                                >
                                  <ArrowLeft className="h-3 w-3 text-slate-400" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-5 w-5 hover:bg-slate-850 cursor-pointer"
                                  disabled={stage.key === "Rejected" || loading}
                                  onClick={() => handleMoveStage(cand.id, cand.stage, "next")}
                                >
                                  <ArrowRight className="h-3 w-3 text-slate-400" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}

                    {stageCandidates.length === 0 && (
                      <div className="h-full flex items-center justify-center border border-dashed border-slate-850 rounded-lg p-4">
                        <span className="text-[10px] text-slate-500 text-center">Empty column</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {jobs.map(job => (
              <Card key={job.id} className="bg-slate-900/40 border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4 text-indigo-500" />
                        {job.title}
                      </CardTitle>
                      <CardDescription className="text-xs">{job.department}</CardDescription>
                    </div>
                    <Badge className={job.status === "Open" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" : "bg-slate-500/10 text-slate-400"}>
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p>Requisition Code: REQ-{1000 + job.id}</p>
                    <p>Candidates in pipeline: {candidates.filter(c => c.jobRequisitionId === job.id).length}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {jobs.length === 0 && (
              <div className="col-span-full text-center py-10 border border-dashed border-slate-800 rounded-lg">
                <p className="text-sm text-slate-400">No active job requisitions found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
