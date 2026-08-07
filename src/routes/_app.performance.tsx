import { createFileRoute } from "@tanstack/react-router";
import { Target, ClipboardList, Plus, Edit, Sparkles, User, Award, CheckCircle2, ChevronRight, Star, Flame, Trophy } from "lucide-react";
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

export const Route = createFileRoute("/_app/performance")({
  head: () => ({
    meta: [
      { title: "Performance Management · Zenelait HRMS" },
      { name: "description", content: "Goals, feedback, reviews and composite rating scorecards." },
    ],
  }),
  component: PerformancePage,
});

function PerformancePage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [employees, setEmployees] = useState<APIUser[]>([]);

  // Form Evaluation State
  const [selectedUser, setSelectedUser] = useState("");
  const [period, setPeriod] = useState("H1 2026");
  const [goalsRating, setGoalsRating] = useState("4.0");
  const [sprintRating, setSprintRating] = useState("4.0");
  const [attendanceRating, setAttendanceRating] = useState("4.0");
  const [feedback, setFeedback] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  // Employee Dashboard OKRs
  const [employeeReview, setEmployeeReview] = useState<any | null>(null);

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      const filteredUsers = uList.filter(u => u.role !== "SUPERADMIN");
      setEmployees(filteredUsers);

      const reviewList = await apiService.getPerformanceReviews(orgId);
      setReviews(reviewList);

      if (isAdmin) {
        if (filteredUsers.length > 0 && !selectedUser) {
          setSelectedUser(filteredUsers[0].username);
        }
      } else {
        const userReview = reviewList.find(r => r.username === loggedInUsername && r.period === "H1 2026");
        if (userReview) {
          setEmployeeReview(userReview);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !selectedUser) return;
    setLoading(true);
    try {
      await apiService.savePerformanceReview(orgId, {
        id: editingId || undefined,
        username: selectedUser,
        period,
        goalsScore: parseFloat(goalsRating),
        sprintScore: parseFloat(sprintRating),
        attendanceScore: parseFloat(attendanceRating),
        feedback,
      });

      // Reset
      setFeedback("");
      setEditingId(null);
      await loadData();
    } catch (e) {
      alert("Failed to submit review evaluation");
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (rev: any) => {
    setEditingId(rev.id);
    setSelectedUser(rev.username);
    setPeriod(rev.period);
    setGoalsRating(String(rev.goalsScore));
    setSprintRating(String(rev.sprintScore));
    setAttendanceRating(String(rev.attendanceScore));
    setFeedback(rev.feedback || "");
  };

  // Metrics calculations
  const totalReviews = reviews.length;
  const avgOverallRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.overallScore, 0) / totalReviews).toFixed(1)
    : "0.0";

  // Calculate live average based on form slider inputs
  const liveAverage = ((parseFloat(goalsRating) + parseFloat(sprintRating) + parseFloat(attendanceRating)) / 3.0).toFixed(1);

  // Mock OKR list for employee dashboard
  const defaultOKRs = [
    { title: "Complete dynamic Assets catalog integration", target: "100%", status: "Completed", pct: 100 },
    { title: "Achieve direct payroll bank transfer seeding", target: "100%", status: "Completed", pct: 100 },
    { title: "Ensure overall sprint ticket completion rate > 92%", target: "92%", status: "In Progress", pct: 85 },
    { title: "Finish Spring Boot training course syllabus", target: "100%", status: "In Progress", pct: 60 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Performance & Goals" 
        description={
          isAdmin 
            ? "Evaluate employee performance scores, leave reviews, and track goals across the organization."
            : "Review your H1 2026 scorecard, check manager feedback reviews, and track goals cascade progress."
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Calibrated Reviews</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-slate-100">{totalReviews}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Average Fleet Rating</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-indigo-300">{avgOverallRating}</span>
            <Star className="h-4 w-4 fill-indigo-400 text-indigo-450" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-400 font-semibold">Period Active</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-emerald-300">H1 2026</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Calibration Status</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-amber-300">Finalized</span>
          </CardContent>
        </Card>
      </div>

      {isAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Evaluations Roster */}
          <Card className="md:col-span-2 bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-base flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-indigo-500" />
                Employee Scorecard Registry
              </CardTitle>
              <CardDescription>Review and manage dynamic performance scorecards from MySQL.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-450 tracking-wider">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3 text-center">Goals</th>
                      <th className="py-2.5 px-3 text-center">Sprints</th>
                      <th className="py-2.5 px-3 text-center">Attendance</th>
                      <th className="py-2.5 px-3 text-center font-bold text-indigo-400">Overall</th>
                      <th className="py-2.5 px-3">Feedback Notes</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map(r => (
                      <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-900/20 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-200">{r.username}</td>
                        <td className="py-3 px-3 text-center text-slate-350">{r.goalsScore.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center text-slate-350">{r.sprintScore.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center text-slate-350">{r.attendanceScore.toFixed(1)}</td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-450 bg-indigo-500/5">{r.overallScore.toFixed(1)}</td>
                        <td className="py-3 px-3 text-slate-400 max-w-[200px] truncate">{r.feedback}</td>
                        <td className="py-3 px-3 text-right">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-6 border-slate-800 hover:border-slate-700 text-[10px] cursor-pointer"
                            onClick={() => handleEditReview(r)}
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-500">
                          No performance reviews evaluated yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* HR Evaluation Form */}
          <Card className="bg-slate-900/40 border-slate-800 h-fit">
            <CardHeader>
              <CardTitle className="text-sm">{editingId ? "Edit Scorecard" : "Evaluate Employee"}</CardTitle>
              <CardDescription>Submit review stubs mapping target calibration ratings.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitEvaluation} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="review-user" className="text-xs text-slate-350">Employee</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser} disabled={!!editingId}>
                    <SelectTrigger id="review-user" className="bg-slate-950 border-slate-800 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.username}>{emp.username}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-period" className="text-xs text-slate-350">Review Period</Label>
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger id="review-period" className="bg-slate-950 border-slate-800 text-xs text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-slate-800 text-white">
                      <SelectItem value="H1 2026">H1 2026</SelectItem>
                      <SelectItem value="Q2 2026">Q2 2026</SelectItem>
                      <SelectItem value="Annual 2026">Annual 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Score inputs */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-350">
                      <Label htmlFor="goals-score">Goals Achieved Rating</Label>
                      <span className="font-semibold text-indigo-400">{goalsRating} / 5.0</span>
                    </div>
                    <input 
                      id="goals-score" 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="0.1" 
                      className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                      value={goalsRating}
                      onChange={(e) => setGoalsRating(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-350">
                      <Label htmlFor="sprint-score">Sprint Completion Rating</Label>
                      <span className="font-semibold text-indigo-400">{sprintRating} / 5.0</span>
                    </div>
                    <input 
                      id="sprint-score" 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="0.1" 
                      className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                      value={sprintRating}
                      onChange={(e) => setSprintRating(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-350">
                      <Label htmlFor="attendance-score">Attendance Rate Rating</Label>
                      <span className="font-semibold text-indigo-400">{attendanceRating} / 5.0</span>
                    </div>
                    <input 
                      id="attendance-score" 
                      type="range" 
                      min="1" 
                      max="5" 
                      step="0.1" 
                      className="w-full accent-indigo-500 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                      value={attendanceRating}
                      onChange={(e) => setAttendanceRating(e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Composite Score Average:</span>
                  <Badge className="bg-indigo-600/25 border-indigo-500/40 text-indigo-400 text-sm font-bold px-2 py-0.5">
                    {liveAverage} / 5.0
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback" className="text-xs text-slate-350">Review Feedback</Label>
                  <Textarea 
                    id="feedback" 
                    placeholder="Provide constructive review guidelines..." 
                    className="bg-slate-950 border-slate-800 text-xs text-white h-20"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                  {editingId ? "Save Changes" : "Submit Evaluation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Employee dashboard view
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-indigo-500" />
                    My H1 2026 Calibrated Scorecard
                  </CardTitle>
                  <CardDescription>Dynamic composite performance scorecard.</CardDescription>
                </div>
                {employeeReview && (
                  <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-sm font-extrabold px-3 py-1">
                    {employeeReview.overallScore.toFixed(1)} / 5.0
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {employeeReview ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-slate-950 border-slate-850 p-4 space-y-2">
                      <span className="text-[10px] text-slate-450 uppercase font-semibold">Goals achieved</span>
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-2xl font-bold text-slate-200">{employeeReview.goalsScore.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500">/ 5.0</span>
                      </div>
                      <Progress value={(employeeReview.goalsScore * 100) / 5.0} className="h-1 bg-slate-900" />
                    </Card>
                    <Card className="bg-slate-950 border-slate-850 p-4 space-y-2">
                      <span className="text-[10px] text-slate-450 uppercase font-semibold">Sprint Delivery</span>
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-2xl font-bold text-slate-200">{employeeReview.sprintScore.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500">/ 5.0</span>
                      </div>
                      <Progress value={(employeeReview.sprintScore * 100) / 5.0} className="h-1 bg-slate-900" />
                    </Card>
                    <Card className="bg-slate-950 border-slate-850 p-4 space-y-2">
                      <span className="text-[10px] text-slate-450 uppercase font-semibold">Attendance rate</span>
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-2xl font-bold text-slate-200">{employeeReview.attendanceScore.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500">/ 5.0</span>
                      </div>
                      <Progress value={(employeeReview.attendanceScore * 100) / 5.0} className="h-1 bg-slate-900" />
                    </Card>
                  </div>

                  <div className="bg-indigo-950/15 border border-indigo-900/35 p-4 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                      <Trophy className="h-4 w-4" /> Manager Evaluation Feedback
                    </span>
                    <p className="text-[11px] text-slate-350 leading-relaxed italic">
                      "{employeeReview.feedback}"
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-2 text-slate-500">
                  <Flame className="h-8 w-8 mx-auto text-slate-600" />
                  <p className="text-xs">No scorecard has been audited for your profile this period.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dynamic OKR Cascades Checklist */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-sm">Cascade Goals & OKRs</CardTitle>
              <CardDescription>Track personal targets and training milestones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              {defaultOKRs.map((okr, index) => (
                <div key={index} className="space-y-1.5 p-2 rounded-lg bg-slate-950 border border-slate-900 hover:border-slate-850 transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-200 leading-tight">{okr.title}</span>
                    <Badge variant="outline" className={okr.status === "Completed" ? "bg-emerald-500/10 text-emerald-450 text-[9px] px-1 py-0" : "bg-blue-500/10 text-blue-450 text-[9px] px-1 py-0"}>
                      {okr.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-[10px] text-slate-500">Target: {okr.target}</span>
                    <span className="text-[10px] font-medium text-slate-350">{okr.pct}% completed</span>
                  </div>
                  <Progress value={okr.pct} className="h-1 bg-slate-900" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
