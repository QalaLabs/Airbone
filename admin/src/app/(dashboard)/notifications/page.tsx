"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, Mail, Send, CheckCircle2, AlertCircle, Clock, 
  Search, SlidersHorizontal, Settings, Plus, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const MOCK_TEMPLATES = [
  { id: "tmpl-1", name: "Fee Payment Link Trigger", type: "WhatsApp (Meta)", code: "fee_payment_reminder", subject: "Airborne Academy - Fee Installment Link", body: "Hello {{name}}, your fee payment of {{amount}} for {{course}} is due on {{date}}. Please complete your secure payment via this link: {{payment_link}}", status: "APPROVED" },
  { id: "tmpl-2", name: "DGCA Medical Dossier Verified", type: "WhatsApp (Meta)", code: "dgca_medical_verified", subject: "Airborne Academy - Medical Scrutiny Passed", body: "Dear {{name}}, your DGCA Class II Medical Assessment has passed verification at Airborne Aviation Academy. You are now cleared for Batch Allocation.", status: "APPROVED" },
  { id: "tmpl-3", name: "Sim Screening Schedule Callout", type: "Email Webhook", code: "sim_screening_schedule", subject: "Official Notification: A320 Simulator Screening Schedule", body: "Dear Candidate,\n\nYou have been shortlisted for the A320 Full Flight Simulator Screening Drive at our Delhi Campus. Please arrive 30 minutes prior to your allocated slot.", status: "APPROVED" },
  { id: "tmpl-4", name: "General Inquiry Nurture Cadence", type: "Email Webhook", code: "inquiry_nurture_d1", subject: "Your Cockpit is Waiting | Airborne Aviation Academy", body: "Hello {{name}},\n\nThank you for exploring the commercial pilot programs at Airborne Aviation Academy. Attached is our official comprehensive brochure and DGCA syllabus breakdown.", status: "APPROVED" },
];

const MOCK_WEBHOOK_LOGS = [
  { id: "wh-101", recipient: "Amit Sen (+91 99223 34455)", template: "Fee Payment Link Trigger", channel: "WhatsApp", timestamp: "4 mins ago", status: "DELIVERED", latency: "142ms" },
  { id: "wh-102", recipient: "Meera Nair (meera@gmail.com)", template: "Sim Screening Schedule Callout", channel: "Email", timestamp: "12 mins ago", status: "READ", latency: "380ms" },
  { id: "wh-103", recipient: "Rajesh Kumar (+91 98765 43210)", template: "DGCA Medical Dossier Verified", channel: "WhatsApp", timestamp: "25 mins ago", status: "DELIVERED", latency: "110ms" },
  { id: "wh-104", recipient: "Suresh Patel (+91 98221 15566)", template: "Fee Payment Link Trigger", channel: "WhatsApp", timestamp: "1 hour ago", status: "FAILED", latency: "—", error: "User opted out of promotional messages" },
];

interface NotificationTemplate {
  id?: string;
  name: string;
  type: string;
  code: string;
  subject: string;
  body: string;
  status: string;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = React.useState("templates");
  const [search, setSearch] = React.useState("");
  const [editingTemplate, setEditingTemplate] = React.useState<NotificationTemplate | null>(null);
  const [broadcastOpen, setBroadcastOpen] = React.useState(false);
  const [broadcastTarget, setBroadcastTarget] = React.useState("ALL_ACTIVE_LEADS");
  const [broadcastMessage, setBroadcastMessage] = React.useState("");

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Template Configuration Saved", description: "Meta WhatsApp Graph API template resubmitted for approval." });
    setEditingTemplate(null);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Broadcast Triggered Successfully", description: `Enqueued dispatch for ${broadcastTarget}. Webhooks executing.` });
    setBroadcastOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="WhatsApp (Meta) & Email Notifications" 
        description="Configure automated communication templates, inspect real-time webhook delivery statuses, and trigger manual multi-channel broadcast campaigns." 
        action={
          <div className="flex items-center gap-3">
            <Button onClick={() => setBroadcastOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 text-xs font-bold">
              <Send className="h-4 w-4 mr-2" />
              Trigger Manual Broadcast
            </Button>
            <Button onClick={() => setEditingTemplate({ name: "New Custom Template", type: "WhatsApp (Meta)", code: "custom_tmpl", subject: "Airborne Notice", body: "Hello {{name}}, ...", status: "PENDING" })} variant="outline" className="border-white/10 hover:bg-white/5 text-xs font-bold text-white">
              <Plus className="h-4 w-4 mr-1.5" />
              Add New Template
            </Button>
          </div>
        }
      />

      {/* Webhook Delivery Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "WhatsApp Deliverability", value: "99.4%", change: "Official Meta API connection", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
          { title: "Email Open / Read Rate", value: "64.2%", change: "High engagement cadet pool", color: "text-blue-400", bg: "bg-blue-500/10", icon: Mail },
          { title: "Active Templates", value: "14 Approved", code: "Zero template rejections", color: "text-purple-400", bg: "bg-purple-500/10", icon: MessageSquare },
          { title: "Webhook Retry Rate", value: "0.4%", change: "Auto backoff exponential retry", color: "text-amber-400", bg: "bg-amber-500/10", icon: RefreshCw },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }} className="glass-card rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{kpi.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-white tracking-tight">{kpi.value}</div>
                <p className="text-[11px] font-medium text-muted-foreground mt-1">{kpi.change || kpi.code}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "templates", label: "Automated Message Templates", icon: MessageSquare },
          { id: "webhooks", label: "Real-Time Webhook Delivery Status", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "templates" && (
          <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Active Communication Templates
                </h3>
                <Input placeholder="Search template codes..." className="bg-secondary/40 border-white/10 text-xs font-semibold w-64 text-white" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {MOCK_TEMPLATES.map((tmpl) => (
                  <div key={tmpl.id} className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-white/20 transition-all">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2">
                          {tmpl.type.includes("WhatsApp") ? <MessageSquare className="h-4 w-4 text-emerald-400" /> : <Mail className="h-4 w-4 text-blue-400" />}
                          <span className="text-xs font-bold text-white">{tmpl.type}</span>
                        </div>
                        <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                          {tmpl.status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white tracking-tight mt-4 group-hover:text-primary transition-colors">{tmpl.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono mt-1">Code: {tmpl.code}</p>

                      <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 my-4 text-xs font-mono font-medium text-muted-foreground whitespace-pre-line leading-relaxed">
                        {tmpl.body}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-xs text-muted-foreground font-semibold">Dynamic placeholders active</span>
                      <Button size="sm" onClick={() => setEditingTemplate(tmpl)} className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-xs font-bold py-1 px-3 h-8">
                        Edit Template Data
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "webhooks" && (
          <motion.div key="webhooks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Live Webhook Delivery & Read Receipts
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Real-time status synchronization directly from Meta WhatsApp and SendGrid email servers.</p>
                </div>
                <Input placeholder="Search recipient logs..." className="bg-secondary/40 border-white/10 text-xs font-semibold w-64 text-white" />
              </div>

              <div className="space-y-3 pt-2">
                {MOCK_WEBHOOK_LOGS.map((wh) => (
                  <div key={wh.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${wh.channel === "WhatsApp" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                        {wh.channel === "WhatsApp" ? <MessageSquare className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{wh.recipient}</p>
                        <p className="text-xs text-muted-foreground mt-1">Template: <span className="text-white font-medium">{wh.template}</span> • Dispatched {wh.timestamp}</p>
                        {wh.error && <p className="text-[11px] text-rose-400 font-semibold mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Error: {wh.error}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-bold text-muted-foreground block uppercase">Network Latency</span>
                        <span className="text-sm font-mono font-bold text-white mt-0.5 block">{wh.latency}</span>
                      </div>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${wh.status === "DELIVERED" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : wh.status === "READ" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}`}>
                        {wh.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(o) => !o && setEditingTemplate(null)}>
        <DialogContent className="max-w-xl glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Edit Automated Message Template
            </DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <form onSubmit={handleSaveTemplate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Template Name *</label>
                <Input defaultValue={editingTemplate.name} required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Template Code *</label>
                  <Input defaultValue={editingTemplate.code} required className="bg-secondary/40 border-white/10 text-xs font-mono text-primary font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Notification Channel</label>
                  <select className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                    <option value="WhatsApp (Meta)" className="bg-slate-900">WhatsApp (Meta Graph API)</option>
                    <option value="Email Webhook" className="bg-slate-900">Email Webhook</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Message Body (Use {"{{placeholder}}"} syntax) *</label>
                <Textarea defaultValue={editingTemplate.body} rows={6} required className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed font-mono" />
              </div>
              <DialogFooter className="pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setEditingTemplate(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                  Save Template & Submit for Meta Approval
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Trigger Broadcast Dialog */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Trigger Manual Broadcast Campaign
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSendBroadcast} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Target Recipient Group *</label>
              <select value={broadcastTarget} onChange={(e) => setBroadcastTarget(e.target.value)} className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                <option value="ALL_ACTIVE_LEADS" className="bg-slate-900">All Active Unassigned Leads (1,420 Contacts)</option>
                <option value="DGCA_EXAM_APPLICANTS" className="bg-slate-900">DGCA Ground School Applicants (430 Contacts)</option>
                <option value="SIM_SCREENING_CANDIDATES" className="bg-slate-900">A320 Sim Screening Candidates (180 Contacts)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Broadcast Message Content *</label>
              <Textarea 
                placeholder="Write your emergency broadcast or urgent placement drive alert here..." 
                rows={5} 
                required 
                value={broadcastMessage} 
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" 
              />
            </div>
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setBroadcastOpen(false)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                Execute Multi-Channel Broadcast
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
