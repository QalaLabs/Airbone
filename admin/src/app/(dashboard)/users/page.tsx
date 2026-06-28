"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Shield, Key, History, Plus, Search, CheckCircle2, AlertCircle, 
  UserCheck, SlidersHorizontal, Settings, Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getInitials } from "@/lib/utils";

const MOCK_USERS = [
  { id: "usr-1", name: "Capt. Vikram Singh", email: "vikram.singh@airborneaviation.academy", role: "Super Admin", department: "Board / Executive", status: "ACTIVE", lastActive: "Just now", permissions: ["ALL_ACCESS"], activity: ["Updated Course Tuition Fee for CPL Ground School", "Published new blog post on DGCA Exam Tips", "Modified Lead #LD-9204 status to ENROLLED"] },
  { id: "usr-2", name: "Anjali Sharma", email: "anjali.sharma@airborneaviation.academy", role: "Admissions Team", department: "Admissions", status: "ACTIVE", lastActive: "12 mins ago", permissions: ["LEADS_READ_WRITE", "ADMISSIONS_MOVE_STAGE", "NOTIFICATIONS_SEND"], activity: ["Moved candidate Rajesh Kumar to Fee Payment stage", "Generated invoice for Lead #LD-8810", "Dispatched WhatsApp Fee trigger template"] },
  { id: "usr-3", name: "Rohan Verma", email: "rohan.verma@airborneaviation.academy", role: "Counsellors", department: "Counseling", status: "ACTIVE", lastActive: "45 mins ago", permissions: ["LEADS_READ_WRITE", "VAPI_LOGS_VIEW"], activity: ["Intercepted Vapi escalation call for Amit Sen", "Logged manual voice call notes for Meera Nair"] },
  { id: "usr-4", name: "Priya Patel", email: "priya.patel@airborneaviation.academy", role: "Marketing Team", department: "Marketing", status: "ACTIVE", lastActive: "2 hours ago", permissions: ["CMS_PAGES_EDIT", "BLOG_PUBLISH", "NOTIFICATIONS_BROADCAST"], activity: ["Published Winter Intake Landing Page draft", "Updated SEO metadata for A320 Sim Course"] },
  { id: "usr-5", name: "Siddharth Sen", email: "siddharth.sen@airborneaviation.academy", role: "Content Team", department: "Media & CMS", status: "ACTIVE", lastActive: "Yesterday", permissions: ["CMS_PAGES_EDIT", "MEDIA_LIBRARY_UPLOAD"], activity: ["Uploaded 12 high-res fleet photos to S3 CDN", "Edited FAQ questions for General Eligibility"] },
  { id: "usr-6", name: "Vikram Malhotra", email: "v.malhotra@airborneaviation.academy", role: "Placement Team", department: "Placements Cell", status: "ACTIVE", lastActive: "3 days ago", permissions: ["PLACEMENTS_MANAGE", "STUDENTS_VIEW"], activity: ["Scheduled Indigo A320 Cadet Pilot Screening Drive", "Shortlisted 18 cadets for simulator evaluation"] },
];

const AVAILABLE_PERMISSIONS = [
  { key: "ALL_ACCESS", label: "Super Admin Full Root Access", desc: "Global command over all 15 CRM and CMS modules." },
  { key: "LEADS_READ_WRITE", label: "Lead Management Read/Write", desc: "View, assign, archive, and add comments to student inquiries." },
  { key: "ADMISSIONS_MOVE_STAGE", label: "Admissions Workflow Management", desc: "Shift applications through Kanban verification stages." },
  { key: "CMS_PAGES_EDIT", label: "Website CMS Editing", desc: "Modify public web pages, FAQs, fleet showcase, and campus facilities." },
  { key: "BLOG_PUBLISH", label: "Blog & Resource Publishing", desc: "Write, draft, and publish aviation articles and study guides." },
  { key: "MEDIA_LIBRARY_UPLOAD", label: "Media Library Cloud Sync", desc: "Upload and delete S3 CDN photos and video assets." },
  { key: "VAPI_LOGS_VIEW", label: "Vapi Voice AI Logs & Audio", desc: "Listen to AI phone call recordings and evaluate transcripts." },
  { key: "NOTIFICATIONS_SEND", label: "WhatsApp & Email Triggering", desc: "Trigger automated templates and view live webhook delivery receipts." },
  { key: "NOTIFICATIONS_BROADCAST", label: "Mass Broadcast Scheduling", desc: "Execute multi-channel broadcast campaigns to large recipient groups." },
  { key: "PLACEMENTS_MANAGE", label: "Placements & Recruitment Drives", desc: "Schedule airline hiring drives and track cadet interview shortlists." },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = React.useState("users");
  const [search, setSearch] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);
  const [editingUser, setEditingUser] = React.useState<any | null>(null);
  const [newUserOpen, setNewUserOpen] = React.useState(false);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "User Permissions Updated", description: "Access Control List (ACL) synchronized across microservices." });
    setEditingUser(null);
    setNewUserOpen(false);
  };

  const filteredUsers = MOCK_USERS.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || u.role.toLowerCase().includes(search.toLowerCase()) || u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="User Management & Access Control (ACL)" 
        description="Administer departmental access level controls, assign granular module permissions, and evaluate immutable user activity logs." 
        action={
          <Button onClick={() => setNewUserOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 text-xs font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Invite System User
          </Button>
        }
      />

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Active System Users", value: "6 Staff", change: "Across 5 Departments", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Users },
          { title: "Super Admin Accounts", value: "1 Account", change: "Root level encryption", color: "text-amber-400", bg: "bg-amber-500/10", icon: Shield },
          { title: "Active ACL Rules", value: "10 Directives", change: "Role-based access matrix", color: "text-purple-400", bg: "bg-purple-500/10", icon: Key },
          { title: "Audit Trail Records", value: "1,420 Events", change: "Immutable activity tracking", color: "text-blue-400", bg: "bg-blue-500/10", icon: History },
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
                <p className="text-[11px] font-medium text-muted-foreground mt-1">{kpi.change}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "users", label: "User Directory & Access Levels", icon: Users },
          { id: "permissions", label: "Permission Assignment Table", icon: Shield },
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
        {activeTab === "users" && (
          <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Active Administration Personnel
                </h3>
                <Input placeholder="Search staff by name, role, department..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary/40 border-white/10 text-xs font-semibold w-64 text-white" />
              </div>

              <div className="space-y-3 pt-2">
                {filteredUsers.map((usr) => (
                  <div key={usr.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-all gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <Avatar className="h-12 w-12 border border-primary/30 shadow-md">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{getInitials(usr.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => setSelectedUser(usr)} className="text-sm font-bold text-white hover:text-primary transition-colors truncate block text-left">
                            {usr.name}
                          </button>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${usr.role === "Super Admin" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                            {usr.role}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Email: <span className="text-white font-medium">{usr.email}</span> • Dept: <span className="text-white font-medium">{usr.department}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/10 justify-end">
                      <span className="text-xs text-muted-foreground font-medium hidden sm:block">
                        Last active {usr.lastActive}
                      </span>
                      <Button size="sm" onClick={() => setSelectedUser(usr)} variant="outline" className="border-white/10 hover:bg-white/5 text-xs font-bold text-white py-1 px-3 h-8">
                        <History className="h-3.5 w-3.5 mr-1.5 text-primary" /> Activity Log
                      </Button>
                      <Button size="sm" onClick={() => setEditingUser(usr)} className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-xs font-bold py-1 px-3 h-8">
                        <Key className="h-3.5 w-3.5 mr-1.5" /> Modify ACL Permissions
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "permissions" && (
          <motion.div key="permissions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Permission Assignment Table & Access Matrix
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Explore all granular microservice permissions available for role attachment.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div key={perm.key} className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-primary block">{perm.key}</span>
                      <h4 className="text-sm font-bold text-white tracking-tight mt-1">{perm.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">{perm.desc}</p>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                      <span>Status: Enabled</span>
                      <span className="text-emerald-400">Attached to active roles</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Log Modal */}
      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-primary/30 shadow-md">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{selectedUser ? getInitials(selectedUser.name) : "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedUser?.name}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Role: <span className="font-semibold text-primary">{selectedUser?.role}</span> • Department: <span className="text-white font-medium">{selectedUser?.department}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                {selectedUser?.status}
              </span>
            </div>
          </DialogHeader>

          {selectedUser && (
            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Immutable User Audit Log</h3>
              <div className="space-y-3">
                {selectedUser.activity.map((act: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/30 border border-white/5 text-xs font-medium text-white">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold">
                      {i + 1}
                    </div>
                    <span className="flex-1">{act}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">Recorded securely</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button variant="outline" onClick={() => setSelectedUser(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
              Close Audit Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify / Invite User Dialog */}
      <Dialog open={!!editingUser || newUserOpen} onOpenChange={(o) => { if (!o) { setEditingUser(null); setNewUserOpen(false); } }}>
        <DialogContent className="max-w-xl glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              {newUserOpen ? "Invite System User & Set ACL" : `Modify ACL: ${editingUser?.name}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Staff Full Name *</label>
              <Input defaultValue={editingUser?.name} placeholder="e.g. Capt. Vikram Singh" required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Work Email Address *</label>
              <Input defaultValue={editingUser?.email} placeholder="e.g. vikram@airborneaviation.academy" type="email" required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Primary Administration Role</label>
                <select defaultValue={editingUser?.role || "Counsellors"} className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  <option value="Super Admin" className="bg-slate-900 text-amber-400">Super Admin</option>
                  <option value="Admissions Team" className="bg-slate-900">Admissions Team</option>
                  <option value="Counsellors" className="bg-slate-900">Counsellors</option>
                  <option value="Marketing Team" className="bg-slate-900">Marketing Team</option>
                  <option value="Content Team" className="bg-slate-900">Content Team</option>
                  <option value="Placement Team" className="bg-slate-900">Placement Team</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Operating Department</label>
                <Input defaultValue={editingUser?.department || "Counseling"} required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Assign Granular ACL Permissions</label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {AVAILABLE_PERMISSIONS.map((p) => {
                  const hasPerm = editingUser ? editingUser.permissions.includes(p.key) || editingUser.permissions.includes("ALL_ACCESS") : false;
                  return (
                    <label key={p.key} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 cursor-pointer text-xs font-medium text-white">
                      <input type="checkbox" defaultChecked={hasPerm} className="h-4 w-4 rounded border-white/10 bg-slate-900 text-primary focus:ring-primary" />
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-white block">{p.label}</span>
                        <span className="text-[10px] text-muted-foreground block truncate">{p.desc}</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-primary">{p.key}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => { setEditingUser(null); setNewUserOpen(false); }} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                {newUserOpen ? "Dispatch Invitation Webhook" : "Save Access Matrix Rules"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
