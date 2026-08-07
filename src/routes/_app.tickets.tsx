import { createFileRoute } from "@tanstack/react-router";
import { Ticket, ArrowLeftRight, Check, Sparkles, User, BadgeAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { apiService } from "../lib/api-service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/tickets")({
  head: () => ({
    meta: [
      { title: "Kanban Board · Zenelait HRMS" },
      { name: "description", content: "Interactive Kanban task execution board: To Do, In Progress, QA, Done." },
    ],
  }),
  component: TicketsPage,
});

const COLUMNS = ["To Do", "In Progress", "Review", "QA", "Done"];

function TicketsPage() {
  const currentUser = apiService.getCurrentUser();
  const orgId = currentUser?.organization?.id;

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const data = await apiService.getTickets(orgId);
      setTickets(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [orgId]);

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("ticketId", id);
  };

  // Handle Drop
  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData("ticketId");
    if (!ticketId || !orgId) return;

    try {
      await apiService.updateTicketStatus(orgId, ticketId, targetStatus);
      loadTickets();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Fallback status shift on click (e.g. mobile friendly)
  const shiftStatus = async (ticketId: string, currentStatus: string, direction: "next" | "prev") => {
    if (!orgId) return;
    const curIdx = COLUMNS.indexOf(currentStatus);
    let nextIdx = direction === "next" ? curIdx + 1 : curIdx - 1;
    if (nextIdx < 0 || nextIdx >= COLUMNS.length) return;

    try {
      await apiService.updateTicketStatus(orgId, ticketId, COLUMNS[nextIdx]);
      loadTickets();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Scrum Kanban Board" 
        description="Drag and drop cards across columns to progress tickets from backlog to validation." 
      />

      {loading && tickets.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">Loading board...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((col) => {
            const colTickets = tickets.filter((t) => t.status === col);
            return (
              <div 
                key={col} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col)}
                className="bg-slate-900/40 border border-slate-900 rounded-xl p-3.5 flex flex-col gap-3 min-w-[220px] max-h-[80vh] overflow-y-auto"
              >
                {/* Column header */}
                <div className="flex justify-between items-center pb-2 border-b border-muted/20">
                  <span className="font-bold text-xs text-foreground tracking-wide">{col}</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {colTickets.length}
                  </Badge>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 min-h-[150px]">
                  {colTickets.length === 0 ? (
                    <div className="text-center py-10 text-[10px] text-muted-foreground border border-dashed rounded-lg border-muted/20">
                      Empty Lane
                    </div>
                  ) : (
                    colTickets.map((t) => (
                      <div
                        key={t.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        className="bg-card border border-muted/30 rounded-lg p-3 space-y-3 cursor-grab active:cursor-grabbing hover:border-muted-foreground/30 hover:shadow-md transition-all text-xs"
                      >
                        {/* Title & SP */}
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-semibold text-foreground leading-snug">{t.title}</span>
                          <Badge variant="outline" className="text-[9px] px-1 bg-indigo-500/5 text-indigo-400 shrink-0">
                            {t.points} SP
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-[10px] text-muted-foreground leading-normal line-clamp-2">{t.desc}</p>

                        {/* Footer details */}
                        <div className="flex justify-between items-center pt-2 border-t border-muted/25 text-[10px]">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3 text-indigo-400" />
                            {t.assignee}
                          </span>

                          <Badge 
                            variant="outline" 
                            className={
                              t.priority === "High" 
                                ? "text-rose-500 border-rose-500/20 text-[9px] px-1" 
                                : "text-slate-400 text-[9px] px-1"
                            }
                          >
                            {t.priority}
                          </Badge>
                        </div>

                        {/* Click adjustments for Mobile viewports */}
                        <div className="flex justify-between pt-1 text-[9px] text-indigo-400 border-t border-muted/10">
                          <button 
                            disabled={COLUMNS.indexOf(col) === 0}
                            onClick={() => shiftStatus(t.id, col, "prev")}
                            className="hover:underline cursor-pointer disabled:opacity-30 disabled:no-underline"
                          >
                            ← Prev
                          </button>
                          <button 
                            disabled={COLUMNS.indexOf(col) === COLUMNS.length - 1}
                            onClick={() => shiftStatus(t.id, col, "next")}
                            className="hover:underline cursor-pointer disabled:opacity-30 disabled:no-underline font-semibold"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
