import { createFileRoute } from "@tanstack/react-router";
import { Clock, Calendar, Check, AlertCircle, Upload, Database, Eye, CheckCircle2, ChevronRight, FileSpreadsheet } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService, User } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance · Zenelait HRMS" },
      { name: "description", content: "Clock-in/out, biometric spreadsheet imports, and excel style attendance logs." },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const currentUser = apiService.getCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";
  const orgId = currentUser?.organization?.id;
  const username = currentUser?.username || "Employee";
  const attendanceMode = currentUser?.organization?.attendanceMode || "CLOCK_IN_OUT";

  const [time, setTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  // Clock state
  const [clockedIn, setClockedIn] = useState(false);
  const [todayLogStatus, setTodayLogStatus] = useState("Not Checked In");

  // Admin spreadsheet matrix state
  const [matrixData, setMatrixData] = useState<Record<string, Record<string, string>>>({});
  const [saveSuccess, setSaveSuccess] = useState("");

  // Excel/CSV import simulator state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedLogs, setImportedLogs] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const uList = await apiService.getUsers(orgId);
      setEmployees(uList);
      
      const attendanceLogs = await apiService.getAttendanceLogs(orgId);
      setLogs(attendanceLogs);

      // Check if logged-in user is clocked in today
      const todayStr = new Date().toISOString().split("T")[0];
      const userTodayLog = attendanceLogs.find(
        (l) => l.username.toLowerCase() === username.toLowerCase() && l.date === todayStr
      );
      if (userTodayLog) {
        setClockedIn(userTodayLog.status === "Present");
        setTodayLogStatus(userTodayLog.status);
      }

      // Initialize the matrix grid state
      const initialMatrix: Record<string, Record<string, string>> = {};
      uList.forEach((emp) => {
        initialMatrix[emp.username] = {};
        for (let i = 0; i < 7; i++) {
          const dateStr = getPastDateString(i);
          const matchedLog = attendanceLogs.find((l) => l.username === emp.username && l.date === dateStr);
          initialMatrix[emp.username][dateStr] = matchedLog ? matchedLog.status : "Present";
        }
      });
      setMatrixData(initialMatrix);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const getPastDateString = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  // Clock In/Out handlers
  const handleClockToggle = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const nextStatus = clockedIn ? "OUT" : "IN";
      await apiService.clockInOut(username, nextStatus, orgId);
      setClockedIn(!clockedIn);
      setTodayLogStatus(nextStatus === "IN" ? "Present" : "Left");
      await loadData();
    } catch (e) {
      alert("Clock operation failed");
    } finally {
      setLoading(false);
    }
  };

  // Admin Manual Matrix Cell Change
  const handleMatrixChange = (empUsername: string, dateStr: string, status: string) => {
    setMatrixData((prev) => ({
      ...prev,
      [empUsername]: {
        ...prev[empUsername],
        [dateStr]: status,
      },
    }));
  };

  // Save admin matrix changes
  const handleSaveMatrix = async () => {
    if (!orgId) return;
    setLoading(true);
    setSaveSuccess("");
    try {
      const updatedLogs: any[] = [];
      Object.entries(matrixData).forEach(([empUsername, datesObj]) => {
        Object.entries(datesObj).forEach(([dateStr, status]) => {
          updatedLogs.push({ username: empUsername, date: dateStr, status });
        });
      });
      await apiService.saveAttendanceLogs(orgId, updatedLogs);
      setSaveSuccess("Manual spreadsheet grid updated successfully!");
      loadData();
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (e) {
      alert("Failed to save attendance logs");
    } finally {
      setLoading(false);
    }
  };

  // Import File Simulator
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportFile(file);
      setImportStatus("Simulating parse of biometric records...");
      
      setTimeout(() => {
        // Generate mock parsed records
        const parsed = employees.map((emp, index) => ({
          username: emp.username,
          date: getPastDateString(1), // yesterday
          status: index % 5 === 0 ? "Absent" : index % 7 === 0 ? "Half-day" : "Present",
          timeIn: "09:05 AM",
          timeOut: "06:12 PM",
        }));
        setImportedLogs(parsed);
        setImportStatus(`Successfully parsed ${parsed.length} records from ${file.name}!`);
      }, 1500);
    }
  };

  const handleCommitImport = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      await apiService.saveAttendanceLogs(orgId, importedLogs);
      setImportStatus("Successfully committed spreadsheet logs to SQL database!");
      setImportFile(null);
      setImportedLogs([]);
      loadData();
      setTimeout(() => setImportStatus(""), 3000);
    } catch (e) {
      alert("Commit import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Attendance Center" 
        description={
          isAdmin 
            ? `Manage attendance rosters for your team. Mode active: ${
                attendanceMode === "CLOCK_IN_OUT" ? "Web Clock-In Widget" : "Excel Matrix & Imports"
              }`
            : `Clock in/out or view your attendance history. Mode: ${
                attendanceMode === "CLOCK_IN_OUT" ? "Clock-In Widget" : "Swipe card spreadsheet"
              }`
        } 
      />

      {/* Grid columns */}
      <div className="grid gap-6">
        
        {/* EMPLOYEE PORTAL */}
        {!isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Clock-In Widget */}
            {attendanceMode === "CLOCK_IN_OUT" ? (
              <Card className="md:col-span-1 border-2 border-indigo-600/30">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-500 animate-pulse" />
                    Web Check-In Node
                  </CardTitle>
                  <CardDescription>Click to check in for your daily shift.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6 space-y-6">
                  {/* Digital Clock */}
                  <div className="text-center space-y-1">
                    <div className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                      {time.toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Today's Status</span>
                    <Badge variant={clockedIn ? "default" : "secondary"} className="mt-1 text-xs px-2.5 py-0.5">
                      {todayLogStatus}
                    </Badge>
                  </div>

                  <Button 
                    onClick={handleClockToggle}
                    disabled={loading}
                    className={`w-full py-6 font-bold text-sm cursor-pointer rounded-xl transition-all shadow-lg hover:scale-[1.02] ${
                      clockedIn 
                        ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/10" 
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10"
                    }`}
                  >
                    {clockedIn ? "Clock Out" : "Clock In"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Swipe record status
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
                    Spreadsheet Records
                  </CardTitle>
                  <CardDescription>Your swipe logs are managed via Excel spreadsheet uploads by HR.</CardDescription>
                </CardHeader>
                <CardContent className="py-6 text-center space-y-4">
                  <div className="rounded-full bg-emerald-500/10 w-12 h-12 flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Automatic Attendance Active</h3>
                    <p className="text-xs text-muted-foreground mt-1">Swipe database entries are refreshed daily by administrators.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attendance Calendar History */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-500" />
                  My Recent Logs
                </CardTitle>
                <CardDescription>Daily checklist logs for the current cycle.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const dateStr = getPastDateString(i);
                    const matchedLog = logs.find((l) => l.username.toLowerCase() === username.toLowerCase() && l.date === dateStr);
                    const status = matchedLog ? matchedLog.status : "Present";
                    return (
                      <div key={i} className="flex justify-between items-center py-2.5 border-b border-muted/20 text-xs">
                        <span className="font-medium text-slate-300">{new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <Badge 
                          variant={status === "Present" ? "outline" : status === "Absent" ? "destructive" : "secondary"}
                          className={status === "Present" ? "text-emerald-500 border-emerald-500/30" : ""}
                        >
                          {status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* HR ADMIN PORTAL */}
        {isAdmin && (
          <div className="space-y-6">
            
            {/* Tabs selection indicator */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Administration Management Board</CardTitle>
                    <CardDescription>Process daily attendance cards or import external biometric swipe records.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Excel-style matrix spreadsheet */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 text-indigo-400">
                      <FileSpreadsheet className="h-4.5 w-4.5" />
                      Bulk Excel-Style Attendance Grid (Last 7 Days)
                    </h3>
                    <Button onClick={handleSaveMatrix} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer">
                      Save Bulk Attendance
                    </Button>
                  </div>

                  {saveSuccess && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-400 font-semibold flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      {saveSuccess}
                    </div>
                  )}

                  <div className="overflow-x-auto border rounded-lg border-muted/30">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-muted/20">
                          <th className="py-2.5 px-3 font-semibold text-muted-foreground border-r border-muted/20">Employee</th>
                          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                            <th key={i} className="py-2.5 px-3 font-semibold text-muted-foreground border-r border-muted/20 text-center">
                              {new Date(getPastDateString(i)).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted/30">
                        {employees.map((emp) => (
                          <tr key={emp.username} className="hover:bg-muted/10">
                            <td className="py-2 px-3 font-semibold border-r border-muted/20">{emp.username}</td>
                            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                              const dateStr = getPastDateString(i);
                              const cellVal = (matrixData[emp.username] && matrixData[emp.username][dateStr]) || "Present";
                              return (
                                <td key={i} className="p-1 border-r border-muted/20 text-center">
                                  <select
                                    value={cellVal}
                                    onChange={(e) => handleMatrixChange(emp.username, dateStr, e.target.value)}
                                    className="bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 rounded text-[11px] p-1 font-medium text-slate-300 focus:outline-none"
                                  >
                                    <option value="Present" className="bg-slate-900 text-emerald-450 font-semibold">Present</option>
                                    <option value="Absent" className="bg-slate-900 text-rose-500 font-semibold">Absent</option>
                                    <option value="Leave" className="bg-slate-900 text-amber-500 font-semibold">Leave</option>
                                    <option value="Half-day" className="bg-slate-900 text-sky-400 font-semibold">Half-day</option>
                                  </select>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CSV/Excel Import Section */}
                <div className="border-t pt-6 border-muted/30 space-y-4">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 text-indigo-400">
                    <Upload className="h-4.5 w-4.5" />
                    Biometrics Excel / CSV Swipe-Card Importer
                  </h3>
                  <p className="text-xs text-muted-foreground">Select a punch CSV file downloaded from the office gates biometric console. System will match tags to employee records.</p>
                  
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="relative border-2 border-dashed border-muted rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer w-full md:max-w-md hover:border-indigo-500 transition-colors">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs font-semibold text-slate-300">Choose CSV File or drag here</span>
                      <span className="text-[10px] text-muted-foreground">Supports .csv, .xls, .xlsx (punch_logs)</span>
                      <input 
                        type="file" 
                        accept=".csv,.xls,.xlsx" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                      />
                    </div>

                    {importStatus && (
                      <div className="flex-1 bg-slate-900/30 border border-slate-900 rounded-xl p-4 flex flex-col gap-2 w-full">
                        <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          {importStatus}
                        </span>

                        {importedLogs.length > 0 && (
                          <div className="space-y-3">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Parsed Record Preview</span>
                            <div className="max-h-40 overflow-y-auto border rounded border-muted/20">
                              <table className="w-full text-left text-[10px] border-collapse">
                                <thead>
                                  <tr className="border-b bg-muted/10 font-bold">
                                    <th className="p-1.5">Employee</th>
                                    <th className="p-1.5">Punch Date</th>
                                    <th className="p-1.5">Time In</th>
                                    <th className="p-1.5">Time Out</th>
                                    <th className="p-1.5 text-right">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {importedLogs.map((log) => (
                                    <tr key={log.username} className="border-b border-muted/5">
                                      <td className="p-1.5 font-semibold">{log.username}</td>
                                      <td className="p-1.5 text-muted-foreground">{log.date}</td>
                                      <td className="p-1.5 text-emerald-500">{log.timeIn}</td>
                                      <td className="p-1.5 text-rose-500">{log.timeOut}</td>
                                      <td className="p-1.5 text-right font-bold">{log.status}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <Button onClick={handleCommitImport} size="sm" className="bg-emerald-600 hover:bg-emerald-500 cursor-pointer">
                              Commit Logs to Database
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
