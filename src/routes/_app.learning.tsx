import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Award, BookOpen, Clock, Plus, Compass, Play, CheckCircle2, User, Trophy, FileBadge, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User as APIUser } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/learning")({
  head: () => ({
    meta: [
      { title: "Learning Paths · Zenelait HRMS" },
      { name: "description", content: "Catalog, assign and complete training certifications." },
    ],
  }),
  component: LearningPage,
});

function LearningPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [progresses, setProgresses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<APIUser[]>([]);

  // HR Catalog Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("10");
  const [newRole, setNewRole] = useState("All");
  const [newDesc, setNewDesc] = useState("");
  const [newDriveLink, setNewDriveLink] = useState("");

  // HR Audit View State
  const [selectedUser, setSelectedUser] = useState("");
  const [auditProgress, setAuditProgress] = useState<any[]>([]);

  // Certificate Modal State
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [certCourseTitle, setCertCourseTitle] = useState("");
  const [certUser, setCertUser] = useState("");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      const filtered = uList.filter(u => u.role !== "SUPERADMIN");
      setEmployees(filtered);

      const courseList = await apiService.getCourses(orgId);
      setCourses(courseList);

      if (isAdmin) {
        const defaultUser = filtered[0]?.username || loggedInUsername;
        setSelectedUser(defaultUser);
        await loadAuditProgress(defaultUser);
      } else {
        const myProgress = await apiService.getCourseProgress(orgId, loggedInUsername);
        setProgresses(myProgress);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditProgress = async (username: string) => {
    if (!orgId || !username) return;
    try {
      const prog = await apiService.getCourseProgress(orgId, username);
      setAuditProgress(prog);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !newTitle) return;
    setLoading(true);
    try {
      await apiService.saveCourse(orgId, {
        title: newTitle,
        duration: parseInt(newDuration),
        targetRole: newRole,
        description: newDesc,
        driveLink: newDriveLink,
      });
      setNewTitle("");
      setNewDuration("10");
      setNewRole("All");
      setNewDesc("");
      setNewDriveLink("");
      await loadData();
    } catch (e) {
      alert("Failed to catalog course");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (val: string) => {
    setSelectedUser(val);
    await loadAuditProgress(val);
  };

  const handleUpdateProgress = async (courseId: number, currentProgress: number, change: number) => {
    if (!orgId) return;
    const targetUser = isAdmin ? selectedUser : loggedInUsername;
    const newProgress = Math.min(100, Math.max(0, currentProgress + change));
    setLoading(true);
    try {
      await apiService.updateCourseProgress(orgId, targetUser, courseId, newProgress);
      if (isAdmin) {
        await loadAuditProgress(targetUser);
      } else {
        const myProgress = await apiService.getCourseProgress(orgId, loggedInUsername);
        setProgresses(myProgress);
      }
    } catch (e) {
      alert("Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  const triggerCertificate = (courseTitle: string, user: string) => {
    setCertCourseTitle(courseTitle);
    setCertUser(user);
    setCertModalOpen(true);
  };

  // Metrics
  const myCompletedCount = progresses.filter(p => p.status === "Completed").length;
  const myTotalHours = progresses
    .filter(p => p.status === "Completed")
    .reduce((sum, p) => {
      const course = courses.find(c => c.id === p.courseId);
      return sum + (course ? course.duration : 0);
    }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Paths & Certifications"
        description={
          isAdmin
            ? "Configure standard courses, audit employee progress checklists, and track training hours."
            : "Expand your skill capabilities, complete assigned courses, and download certified stubs."
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Courses Cataloged</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-slate-100">{courses.length}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Completed Certs</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-indigo-300">
              {isAdmin ? "Total Fleet" : myCompletedCount}
            </span>
            <Award className="h-4 w-4 text-indigo-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-400 font-semibold">Training Hours</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-emerald-300">
              {isAdmin ? "Standard" : `${myTotalHours}h`}
            </span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Status Sync</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-amber-300">Online</span>
          </CardContent>
        </Card>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* HR Course progress tracker audit panel */}
          <Card className="md:col-span-2 bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <User className="h-4 w-4 text-indigo-500" />
                  Employee Progress Audit
                </CardTitle>
                <CardDescription>Track certification completions dynamically from MySQL.</CardDescription>
              </div>
              <div className="w-full sm:w-56">
                <Select value={selectedUser} onValueChange={handleSelectUser}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.username}>{emp.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {courses.map(c => {
                const prog = auditProgress.find(p => p.courseId === c.id);
                const pct = prog ? prog.progress : 0;
                return (
                  <div key={c.id} className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                        {c.title}
                      </span>
                      <p className="text-[10px] text-slate-450 max-w-md">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="text-right space-y-1 min-w-[70px]">
                        <Badge variant="outline" className={pct === 100 ? "bg-emerald-500/10 text-emerald-450 border-emerald-500/20 text-[9px]" : "bg-blue-500/10 text-blue-450 border-blue-500/20 text-[9px]"}>
                          {pct}% complete
                        </Badge>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[10px] border-slate-800 hover:border-slate-700 cursor-pointer"
                          onClick={() => handleUpdateProgress(c.id, pct, -20)}
                          disabled={loading || pct === 0}
                        >
                          -20%
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-[10px] bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
                          onClick={() => handleUpdateProgress(c.id, pct, 20)}
                          disabled={loading || pct === 100}
                        >
                          +20%
                        </Button>
                        {c.driveLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] border-indigo-550/30 text-indigo-450 hover:bg-indigo-500/5 cursor-pointer"
                            onClick={() => window.open(c.driveLink, "_blank")}
                          >
                            <Play className="h-3 w-3 mr-1" /> Play
                          </Button>
                        )}
                        {pct === 100 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/5 cursor-pointer"
                            onClick={() => triggerCertificate(c.title, selectedUser)}
                          >
                            <Award className="h-3 w-3 mr-1" /> Cert
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Catalog New Course Form */}
          <Card className="bg-slate-900/40 border-slate-800 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Catalog Course</CardTitle>
              <CardDescription>Register a new training course to target roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course-title" className="text-xs text-slate-350">Course Title</Label>
                  <Input
                    id="course-title"
                    placeholder="e.g. Advanced Docker Configs"
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-duration" className="text-xs text-slate-350">Duration (Hours)</Label>
                  <Input
                    id="course-duration"
                    type="number"
                    min="1"
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-role" className="text-xs text-slate-350">Target Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger id="course-role" className="bg-slate-950 border-slate-800 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="All">All Roles</SelectItem>
                      <SelectItem value="IT">IT / Development</SelectItem>
                      <SelectItem value="HR">HR / Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-desc" className="text-xs text-slate-350">Description</Label>
                  <Textarea
                    id="course-desc"
                    placeholder="Summary of course modules..."
                    className="bg-slate-950 border-slate-800 text-xs text-white h-20"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course-link" className="text-xs text-slate-350">Google Drive Material / Video Link</Label>
                  <Input
                    id="course-link"
                    placeholder="e.g. https://drive.google.com/drive/folders/..."
                    className="bg-slate-950 border-slate-800 text-xs text-white"
                    value={newDriveLink}
                    onChange={(e) => setNewDriveLink(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                  <Plus className="mr-1.5 h-4 w-4" /> Add to Catalog
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Employee path view
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {courses.map(c => {
              const prog = progresses.find(p => p.courseId === c.id);
              const pct = prog ? prog.progress : 0;
              return (
                <Card key={c.id} className="bg-slate-900/40 border-slate-800 overflow-hidden">
                  <CardHeader className="pb-2 border-b border-slate-950">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Compass className="h-3.5 w-3.5 text-indigo-400" />
                        Target: {c.targetRole} Department
                      </span>
                      <Badge variant="outline" className={pct === 100 ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 text-[9px]" : "bg-blue-500/10 text-blue-450 border border-blue-500/20 text-[9px]"}>
                        {pct === 100 ? "Completed" : pct > 0 ? "In Progress" : "Not Started"}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-slate-100 pt-1">{c.title}</CardTitle>
                    <CardDescription className="text-xs pt-1.5 leading-relaxed text-slate-400">{c.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1 w-full sm:w-72">
                      <div className="flex justify-between text-[10px] text-slate-450">
                        <span>Course syllabus progress</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5 bg-slate-950" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 cursor-pointer"
                        onClick={() => handleUpdateProgress(c.id, pct, 20)}
                        disabled={loading || pct === 100}
                      >
                        <Play className="h-3 w-3 mr-1" /> {pct > 0 ? "Study 20%" : "Start"}
                      </Button>
                      {c.driveLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-indigo-550/30 text-indigo-450 hover:bg-indigo-555/5 cursor-pointer"
                          onClick={() => window.open(c.driveLink, "_blank")}
                        >
                          <Play className="h-3.5 w-3.5 mr-1" /> Play Material
                        </Button>
                      )}
                      {pct === 100 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/5 cursor-pointer"
                          onClick={() => triggerCertificate(c.title, loggedInUsername)}
                        >
                          <Award className="h-3.5 w-3.5 mr-1" /> Get Certificate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-slate-900/40 border-slate-800 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">Assigned Roadmap</CardTitle>
              <CardDescription>Standard training milestones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-200 leading-tight block">Cybersecurity Compliance</span>
                  <span className="text-[9px] text-slate-500">2h syllabus • Mandatory</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-200 leading-tight block">State Management hooks</span>
                  <span className="text-[9px] text-slate-500">12h syllabus • IT Path</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <BookOpen className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-200 leading-tight block">Spring Boot & JPA</span>
                  <span className="text-[9px] text-slate-500">20h syllabus • IT Path</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Certified PDF Stub Generator Dialog Modal Overlay */}
      <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-850 text-white max-w-lg overflow-hidden">
          <DialogHeader className="pb-3 border-b border-slate-900">
            <DialogTitle className="text-sm font-semibold flex items-center gap-1.5">
              <FileBadge className="h-4 w-4 text-indigo-400" />
              Verified Certification Stub
            </DialogTitle>
            <DialogDescription className="text-[10px] text-slate-450">
              Downloadable certificate of completion generated from the MySQL database.
            </DialogDescription>
          </DialogHeader>
          <div className="py-8 px-6 text-center space-y-6 bg-radial-gradient from-indigo-950/20 to-slate-950 rounded-lg border border-slate-900 relative">
            <div className="absolute top-4 left-4">
              <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
            </div>
            <div className="absolute bottom-4 right-4">
              <Trophy className="h-5 w-5 text-indigo-500 opacity-60" />
            </div>

            <div className="space-y-2">
              <GraduationCap className="h-12 w-12 text-indigo-400 mx-auto" />
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-indigo-400 pt-2">Certificate of Completion</h2>
              <p className="text-[10px] text-slate-450">This verifies that the team member</p>
              <h3 className="text-lg font-bold text-slate-100">{certUser}</h3>
              <p className="text-[10px] text-slate-450">has successfully finished all modules of</p>
              <h4 className="text-sm font-bold text-slate-200">{certCourseTitle}</h4>
            </div>

            <div className="flex justify-between border-t border-slate-900 pt-4 text-[9px] text-slate-500 px-4">
              <span>Date: August 5, 2026</span>
              <span>Issuer: Zenelait HRMS</span>
              <span>Verification ID: cert_{Math.floor(Math.random() * 900000) + 100000}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
            <Button size="sm" variant="outline" className="border-slate-800 text-xs cursor-pointer" onClick={() => setCertModalOpen(false)}>
              Close
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-xs cursor-pointer" onClick={() => alert("Stub PDF downloaded successfully!")}>
              Download PDF Stub
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
