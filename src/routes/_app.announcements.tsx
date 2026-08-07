import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Plus, ShieldAlert, Sparkles, User, Calendar, Tag, Check, Send, Info, Gift, MapPin, Bell } from "lucide-react";
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

export const Route = createFileRoute("/_app/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements & Bulletins · Zenelait HRMS" },
      { name: "description", content: "Post company news, schedule calendar events, and manage corporate holidays." },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;
  const isAdmin = currentUser?.role === "ADMIN";
  const loggedInUsername = currentUser?.username || "";

  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // Publish Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("News");
  const [targetAudience, setTargetAudience] = useState("All");
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split("T")[0]);

  // Filtering category state
  const [filterCategory, setFilterCategory] = useState("All");

  const loadData = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const list = await apiService.getAnnouncements(orgId);
      setAnnouncements(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orgId]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !title || !content || !publishDate) return;
    setLoading(true);
    try {
      await apiService.saveAnnouncement(orgId, {
        title,
        content,
        category,
        targetAudience,
        publishDate,
        author: loggedInUsername,
      });
      setTitle("");
      setContent("");
      setCategory("News");
      setTargetAudience("All");
      await loadData();
    } catch (e) {
      alert("Failed to publish announcement");
    } finally {
      setLoading(false);
    }
  };

  // Filtered timeline
  const displayedAnnouncements = announcements.filter(a => {
    if (filterCategory === "All") return true;
    return a.category === filterCategory;
  });

  // Calculate Metrics
  const totalCount = announcements.length;
  const eventsCount = announcements.filter(a => a.category === "Event").length;
  const holidaysCount = announcements.filter(a => a.category === "Holiday").length;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Announcements & Bulletins" 
        description="Schedule company strategy updates, calendar events, and manage corporate holidays dynamically."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-slate-500 font-semibold">Total Announcements</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-slate-100">{totalCount}</span>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-indigo-400 font-semibold">Scheduled Events</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-indigo-300">{eventsCount}</span>
            <Bell className="h-4 w-4 text-indigo-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-emerald-400 font-semibold">Corporate Holidays</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 flex items-center gap-1.5">
            <span className="text-xl font-bold text-emerald-300">{holidaysCount}</span>
            <Gift className="h-4 w-4 text-emerald-400" />
          </CardContent>
        </Card>
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="pb-1.5 pt-3 px-4">
            <CardTitle className="text-[10px] uppercase text-amber-400 font-semibold">Sync Status</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <span className="text-xl font-bold text-amber-300">Live</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Publish Form (Admin) or Roadmaps (Employee) */}
        <div className="space-y-6">
          {isAdmin ? (
            <Card className="bg-slate-900/40 border-slate-800 h-fit">
              <CardHeader>
                <CardTitle className="text-sm">Publish Announcement</CardTitle>
                <CardDescription>Post a company-wide update or calendar event.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePublish} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="ann-title" className="text-xs text-slate-350">Bulletin Title</Label>
                    <Input 
                      id="ann-title" 
                      placeholder="e.g. Q3 Town Hall strategy sync" 
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
                          <SelectItem value="News">News</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                          <SelectItem value="Holiday">Holiday</SelectItem>
                          <SelectItem value="Policy">Policy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="target" className="text-xs text-slate-350">Target Audience</Label>
                      <Select value={targetAudience} onValueChange={setTargetAudience}>
                        <SelectTrigger id="target" className="bg-slate-950 border-slate-800 text-xs text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-slate-800 text-white">
                          <SelectItem value="All">All Staff</SelectItem>
                          <SelectItem value="IT">IT Department</SelectItem>
                          <SelectItem value="HR">HR Department</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="publish-date" className="text-xs text-slate-350">Publish Date</Label>
                    <Input 
                      id="publish-date" 
                      type="date" 
                      className="bg-slate-950 border-slate-800 text-xs text-white" 
                      value={publishDate} 
                      onChange={(e) => setPublishDate(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="content" className="text-xs text-slate-350">Content Bulletin</Label>
                    <Textarea 
                      id="content" 
                      placeholder="Write message details..." 
                      className="bg-slate-950 border-slate-800 text-xs text-white h-28" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      required 
                    />
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-xs" disabled={loading}>
                    <Send className="mr-1.5 h-3.5 w-3.5" /> Publish Post
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-900/40 border-slate-800">
              <CardHeader>
                <CardTitle className="text-sm">Upcoming Calendar Events</CardTitle>
                <CardDescription>Targeted holidays and organizational strategy syncs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-1">
                <div className="flex items-start gap-2.5">
                  <Gift className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-200 block">Independence Day Break</span>
                    <span className="text-[9px] text-slate-500">August 17, 2026 • Office Closed</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-200 block">All-Hands Q3 Alignment Call</span>
                    <span className="text-[9px] text-slate-500">August 8, 2026 @ 10:00 AM EST</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-slate-200 block">Database Server Maintenance</span>
                    <span className="text-[9px] text-slate-500">August 6, 2026 @ 11:59 PM EST</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Bulletins list timeline */}
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-1.5">
                  <Megaphone className="h-4 w-4 text-indigo-500" />
                  Announcements Timeline
                </CardTitle>
                <CardDescription>Official bulletins from HR administrators.</CardDescription>
              </div>
              <div className="w-full sm:w-44">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-xs text-white">
                    <SelectValue placeholder="Category filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800 text-white">
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="News">News</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Holiday">Holiday</SelectItem>
                    <SelectItem value="Policy">Policy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {displayedAnnouncements.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No bulletins published under this category filter.
                </div>
              ) : (
                displayedAnnouncements.map((ann) => {
                  const tagColor = 
                    ann.category === "News" ? "bg-blue-500/10 text-blue-450 border border-blue-500/20" :
                    ann.category === "Event" ? "bg-emerald-500/10 text-emerald-450 border border-emerald-500/20" :
                    ann.category === "Holiday" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                    "bg-amber-500/10 text-amber-450 border border-amber-500/20"; // Policy
                  
                  return (
                    <div key={ann.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-900 space-y-2 relative">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`${tagColor} text-[9px] font-semibold`}>
                            {ann.category}
                          </Badge>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {ann.publishDate}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500">
                          Audience: <strong className="text-slate-350">{ann.targetAudience}</strong>
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 pt-0.5">{ann.title}</h4>
                      <p className="text-xs text-slate-350 leading-relaxed pt-1 whitespace-pre-wrap">{ann.content}</p>

                      <div className="flex justify-between items-center pt-2.5 border-t border-slate-900/80 text-[9px] text-slate-500">
                        <span>Published by: <strong className="text-slate-400">{ann.author}</strong></span>
                        <div className="flex items-center gap-1 text-emerald-500">
                          <Check className="h-3 w-3" />
                          <span>Delivered successfully</span>
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
    </div>
  );
}
