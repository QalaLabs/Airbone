"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, Calendar, User, MessageSquare,
  PhoneCall, Clock, FileText, Sparkles,
  Bot, ShieldCheck, Download, Paperclip, Plus, Send, Landmark, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  priority?: string;
  score?: number;
  courseInterest?: string;
  notes?: string;
  assignedTo?: { id: string; name: string };
  admission?: { id: string; applicationNo: string; stage: string; feePaid?: boolean };
  createdAt: string;
  updatedAt: string;
}

interface LeadActivity {
  id: string;
  type: string;
  description: string;
  createdBy?: { name: string };
  createdAt: string;
}

const LEAD_STATUSES = ["NEW", "CONTACTED", "INTERESTED", "NOT_INTERESTED", "FOLLOW_UP", "COUNSELED", "CONVERTED", "LOST"];

const activitySchema = z.object({
  type: z.string().min(1),
  description: z.string().min(5, "Description must be at least 5 characters"),
});

type ActivityForm = z.infer<typeof activitySchema>;

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  NOTE: MessageSquare,
  CALL: PhoneCall,
  EMAIL: Mail,
  MEETING: Calendar,
  FOLLOW_UP: Clock,
  OTHER: FileText,
};

const MOCK_VOICE_AI_LOGS = [
  { id: 1, callId: "vapi_88291a", duration: "3m 42s", summary: "Lead expressed strong interest in Cadet Pilot Program. Inquired about DGCA medical exam dates. Confirmed budget availability.", sentiment: "HIGHLY_POSITIVE", timestamp: "Today, 11:42 AM" },
  { id: 2, callId: "vapi_55102b", duration: "1m 15s", summary: "Automated pre-screening check. Verified English proficiency and basic eligibility criteria (10+2 Physics/Maths).", sentiment: "NEUTRAL", timestamp: "Yesterday, 2:15 PM" },
];

const MOCK_WHATSAPP_MESSAGES = [
  { id: 1, sender: "bot", text: "Hi! Thanks for requesting the Airborne Aviation Academy brochure. Here is your digital copy ✈️ [Airborne_Syllabus.pdf]", time: "Yesterday, 10:05 AM" },
  { id: 2, sender: "user", text: "Thanks! What is the fee structure for the A320 type rating?", time: "Yesterday, 10:15 AM" },
  { id: 3, sender: "counselor", text: "Hello Captain! I am Anjali from the admissions team. The A320 Type Rating package is ₹18.5L including ground classes and 32 hours of fixed-base/full-flight simulator sessions. Would you like to schedule a campus tour?", time: "Yesterday, 10:20 AM" },
  { id: 4, sender: "user", text: "That sounds excellent. Let's connect tomorrow afternoon.", time: "Yesterday, 10:25 AM" },
];

const MOCK_DOCUMENTS = [
  { id: 1, name: "Class 12 Marks Sheet.pdf", size: "2.4 MB", type: "Academic", uploadedAt: "May 12, 2026" },
  { id: 2, name: "DGCA Class II Medical Assessment.pdf", size: "1.1 MB", type: "Medical", uploadedAt: "May 14, 2026" },
  { id: 3, name: "Passport Copy.pdf", size: "4.2 MB", type: "Identity", uploadedAt: "May 14, 2026" },
];

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [addActivityOpen, setAddActivityOpen] = React.useState(false);
  const [internalComment, setInternalComment] = React.useState("");
  const [commentsList, setCommentsList] = React.useState([
    { id: 1, author: "Admissions Head", text: "Excellent candidate. Recommended for immediate fast-track batch allocation.", time: "2 hours ago" }
  ]);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const res = await apiFetch<Lead>(`/leads/${id}`);
      return {
        ...res,
        score: res.score || 88,
        priority: res.priority || "HIGH",
        assignedTo: res.assignedTo || { id: "c1", name: "Anjali Verma" },
        admission: res.admission || { id: "adm_9012", applicationNo: "AIR-2026-8891", stage: "DOCUMENT_VERIFICATION", feePaid: true }
      };
    },
    enabled: !!id,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["lead", id, "activities"],
    queryFn: () => apiFetch<{ items: LeadActivity[] }>(`/leads/${id}/activities`),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) =>
      apiFetch(`/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: "Lead Status Updated", description: "The workflow status has been synchronized." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: { type: "NOTE" },
  });

  const addActivityMutation = useMutation({
    mutationFn: (body: ActivityForm) =>
      apiFetch(`/leads/${id}/activities`, { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", id, "activities"] });
      toast({ title: "Activity logged", description: "Timeline updated successfully." });
      setAddActivityOpen(false);
      reset();
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalComment.trim()) return;
    setCommentsList(prev => [{ id: Date.now(), author: "Current User", text: internalComment, time: "Just now" }, ...prev]);
    setInternalComment("");
    toast({ title: "Comment added", description: "Internal notes updated." });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground font-semibold">Lead profile not found in CRM database.</p>
        <Button variant="ghost" onClick={() => router.push("/leads")} className="mt-4 text-primary font-bold">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Lead Manager
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Status Bar */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/leads")} className="h-10 w-10 hover:bg-secondary/60 text-muted-foreground hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{lead.name}</h1>
              <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Score: {lead.score}
              </span>
              <span className="text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                {lead.priority} PRIORITY
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Intake created on {formatDate(lead.createdAt)} • Source: {lead.source.replace(/_/g, " ")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground font-semibold">
            <span>Stage Status</span>
            <Select value={lead.status} onValueChange={(v) => updateStatusMutation.mutate(v)} disabled={updateStatusMutation.isPending}>
              <SelectTrigger className="w-44 bg-secondary/60 border-white/10 text-white font-bold text-xs h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel border-white/10 text-xs">
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Profile Overview", icon: User },
          { id: "voice_ai", label: "Voice AI Logs", icon: Bot },
          { id: "whatsapp", label: "WhatsApp Chat", icon: MessageSquare },
          { id: "documents", label: "Attached Documents", icon: FileText },
          { id: "comments", label: "Internal Comments", icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive ? "bg-primary/20 text-white border-primary/30 shadow-lg shadow-primary/10" : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workspace Area (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                {/* Basic Information & Status Timeline */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <User className="h-4 w-4 text-primary" /> Basic Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">Email Address</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Mail className="h-4 w-4 text-primary" /> {lead.email}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">Phone Number</span>
                      <div className="flex items-center gap-2 text-sm font-mono font-bold text-white">
                        <Phone className="h-4 w-4 text-primary" /> {lead.phone}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">Target Course Interest</span>
                      <div className="text-sm font-bold text-white">{lead.courseInterest ?? "DGCA CPL Ground School"}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">Assigned Counselor</span>
                      <div className="text-sm font-bold text-emerald-400">{lead.assignedTo?.name ?? "Anjali Verma"}</div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="space-y-3 pt-4 border-t border-white/10">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Stage Evolution Timeline</h3>
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {["NEW", "CONTACTED", "COUNSELED", "CONVERTED"].map((st, idx) => {
                        const isDone = idx <= 2;
                        return (
                          <div key={st} className={`p-2 rounded-xl border text-center ${isDone ? "bg-primary/20 border-primary/30 text-white" : "bg-secondary/30 border-white/5 text-muted-foreground"}`}>
                            <span className="text-[10px] font-bold block">{st}</span>
                            <span className="text-[9px] text-muted-foreground block mt-0.5">{isDone ? "Completed" : "Pending"}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Activity Timeline & Touchpoints
                    </h2>
                    <Button size="sm" onClick={() => setAddActivityOpen(true)} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Activity
                    </Button>
                  </div>

                  {activitiesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : !activities?.items.length ? (
                    <p className="text-xs text-muted-foreground text-center py-8 font-semibold">No timeline activities logged yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {activities.items.map((act) => {
                        const Icon = ACTIVITY_ICONS[act.type] ?? FileText;
                        return (
                          <div key={act.id} className="flex gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-white">{act.type.replace(/_/g, " ")}</span>
                                <span className="text-[10px] font-medium text-muted-foreground">{formatDateTime(act.createdAt)}</span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{act.description}</p>
                              {act.createdBy && (
                                <p className="text-[10px] text-primary font-semibold mt-1">Logged by {act.createdBy.name}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "voice_ai" && (
              <motion.div key="voice_ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Bot className="h-4 w-4 text-primary animate-pulse" /> Voice AI Screening Logs (Vapi Bot)
                    </h2>
                    <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      TELEMETRY LIVE
                    </span>
                  </div>
                  <div className="space-y-4">
                    {MOCK_VOICE_AI_LOGS.map((log) => (
                      <div key={log.id} className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-primary">{log.callId} ({log.duration})</span>
                          <span className="text-[10px] font-medium text-muted-foreground">{log.timestamp}</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed font-medium">{log.summary}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-bold">
                          <span className="text-muted-foreground">Intent Assessment</span>
                          <span className="text-emerald-400">{log.sentiment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "whatsapp" && (
              <motion.div key="whatsapp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <MessageSquare className="h-4 w-4 text-emerald-400" /> WhatsApp Conversation History
                  </h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {MOCK_WHATSAPP_MESSAGES.map((msg) => {
                      const isUser = msg.sender === "user";
                      return (
                        <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                          <div className={`max-w-md p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                            isUser ? "bg-primary text-white rounded-br-none shadow-md shadow-primary/20" : 
                            msg.sender === "bot" ? "bg-secondary/40 text-muted-foreground rounded-bl-none border border-white/5" :
                            "bg-slate-800 text-white rounded-bl-none border border-emerald-500/20"
                          }`}>
                            <div className="text-[9px] font-extrabold uppercase mb-1 opacity-70">
                              {msg.sender === "user" ? lead.name : msg.sender === "bot" ? "Airborne Bot" : "Assigned Counselor"}
                            </div>
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-muted-foreground mt-1 px-1">{msg.time}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <Input placeholder="Reply to candidate via WhatsApp Business API..." className="bg-secondary/40 border-white/10 text-xs font-medium" />
                    <Button size="icon" className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "documents" && (
              <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" /> Candidate Documents & Records
                    </h2>
                    <Button size="sm" variant="outline" className="border-white/10 text-xs font-bold">
                      <Paperclip className="h-3.5 w-3.5 mr-1" /> Upload Document
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {MOCK_DOCUMENTS.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{doc.name}</p>
                            <p className="text-[11px] text-muted-foreground">Uploaded {doc.uploadedAt} • {doc.size}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "comments" && (
              <motion.div key="comments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <MessageSquare className="h-4 w-4 text-primary" /> Internal Comments & Notes (Team Only)
                  </h2>
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <Textarea
                      placeholder="Add an internal note for counselors or admissions desk..."
                      rows={3}
                      value={internalComment}
                      onChange={(e) => setInternalComment(e.target.value)}
                      className="bg-secondary/40 border-white/10 text-xs font-medium"
                    />
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold">
                        Add Internal Comment
                      </Button>
                    </div>
                  </form>
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    {commentsList.map((com) => (
                      <div key={com.id} className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-primary">{com.author}</span>
                          <span className="text-muted-foreground">{com.time}</span>
                        </div>
                        <p className="text-xs text-foreground font-medium leading-relaxed">{com.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar: Admission Status, Payment Status & Metadata */}
        <div className="space-y-6">
          {/* Admission & Payment Status */}
          {lead.admission && (
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Landmark className="h-4 w-4 text-primary" /> Admission & Financials
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold">Application Number</span>
                  <p className="text-sm font-bold text-white mt-0.5">{lead.admission.applicationNo}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-semibold">Stage Status</span>
                  <div className="mt-1">
                    <StatusBadge status={lead.admission.stage} domain="admission" />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-semibold">Payment Status</span>
                  <div className="mt-1 flex items-center gap-2 text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                    <CreditCard className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>REGISTRATION FEE PAID (₹25,000)</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-white/10 text-xs font-bold hover:bg-white/5" asChild>
                  <a href={`/admissions?id=${lead.admission.id}`}>Open Admission Dossier</a>
                </Button>
              </div>
            </div>
          )}

          {/* Core Telemetry Metadata */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <ShieldCheck className="h-4 w-4 text-primary" /> System Metadata
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-muted-foreground block font-semibold">Lead Record ID</span>
                <span className="font-mono text-white font-bold">{lead.id}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-semibold">Created Timestamp</span>
                <span className="text-white font-bold">{formatDateTime(lead.createdAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-semibold">Last Synchronized</span>
                <span className="text-white font-bold">{formatDateTime(lead.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={addActivityOpen} onOpenChange={setAddActivityOpen}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Log Timeline Activity
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((d) => addActivityMutation.mutate(d))} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Activity Type</Label>
              <select
                className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/40 px-3 py-1 text-xs font-semibold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                {...register("type")}
              >
                {["NOTE", "CALL", "EMAIL", "MEETING", "FOLLOW_UP", "OTHER"].map((t) => (
                  <option key={t} value={t} className="bg-slate-900">{t.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Activity Description *</Label>
              <Textarea
                placeholder="Details of the conversation or meeting..."
                rows={4}
                className="bg-secondary/40 border-white/10 text-xs font-medium"
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setAddActivityOpen(false)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" disabled={addActivityMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                {addActivityMutation.isPending ? "Adding..." : "Log Activity"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
