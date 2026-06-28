"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Building2, Briefcase, Users, Calendar, Search, Plus, CheckCircle2, 
  ArrowUpRight, Globe, FileText, UserCheck, Star, Sparkles, Plane, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const AIRLINES = [
  { id: "indigo", name: "IndiGo Airlines", logo: "6E", code: "IGO", activeDrives: 2, cadetsPlaced: 142, status: "HIRING_ACTIVE", bg: "bg-blue-600/10 text-blue-400 border-blue-600/30" },
  { id: "airindia", name: "Air India", logo: "AI", code: "AIC", activeDrives: 1, cadetsPlaced: 98, status: "HIRING_ACTIVE", bg: "bg-red-600/10 text-red-400 border-red-600/30" },
  { id: "akasa", name: "Akasa Air", logo: "QP", code: "AKJ", activeDrives: 1, cadetsPlaced: 45, status: "SCREENING_SCHEDULED", bg: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { id: "vistara", name: "Vistara (Tata SIA)", logo: "UK", code: "VTI", activeDrives: 0, cadetsPlaced: 86, status: "RECRUITMENT_CLOSED", bg: "bg-purple-600/10 text-purple-400 border-purple-600/30" },
  { id: "spicejet", name: "SpiceJet", logo: "SG", code: "SEJ", activeDrives: 0, cadetsPlaced: 62, status: "ONHOLD", bg: "bg-secondary text-muted-foreground border-white/10" },
];

const ONGOING_DRIVES = [
  { id: 1, airline: "IndiGo Airlines", title: "A320 Cadet Pilot Screening Drive 2026", date: "June 28, 2026", venue: "Delhi Campus / Flight Simulator Bay", eligibleCount: 45, shortlistedCount: 18, status: "IN_PROGRESS" },
  { id: 2, airline: "Air India", title: "Junior First Officer (JFO) Selection", date: "July 15, 2026", venue: "Mumbai Ops HQ", eligibleCount: 32, shortlistedCount: 12, status: "REGISTRATION_OPEN" },
  { id: 3, airline: "Akasa Air", title: "B737 Max Type Rated Cadet Intake", date: "August 04, 2026", venue: "Bengaluru Ops HQ", eligibleCount: 20, shortlistedCount: 0, status: "UPCOMING" },
];

const SHORTLISTED_CADETS = [
  { id: 101, name: "Cadet Rohan Verma", course: "A320 Type Rating", airline: "IndiGo Airlines", status: "SIM_EVALUATION_PASSED", drive: "A320 Cadet Pilot Screening Drive 2026", date: "June 20, 2026" },
  { id: 102, name: "Cadet Ananya Sharma", course: "Commercial Pilot License", airline: "Air India", status: "INTERVIEW_PASSED", drive: "Junior First Officer (JFO) Selection", date: "June 18, 2026" },
  { id: 103, name: "Cadet Vikram Singh", course: "DGCA CPL Ground School", airline: "IndiGo Airlines", status: "SIM_EVALUATION_SCHEDULED", drive: "A320 Cadet Pilot Screening Drive 2026", date: "June 22, 2026" },
  { id: 104, name: "Cadet Priya Patel", course: "A320 Type Rating", airline: "Akasa Air", status: "DOCUMENTS_SCREENED", drive: "B737 Max Type Rated Cadet Intake", date: "June 25, 2026" },
];

export default function PlacementsPage() {
  const [activeTab, setActiveTab] = React.useState("airlines");
  const [search, setSearch] = React.useState("");
  const [newDriveOpen, setNewDriveOpen] = React.useState(false);

  const handleCreateDrive = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Recruitment Drive Created", description: "New placement drive has been successfully published to cadet portal." });
    setNewDriveOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Placements & Airlines Cell" 
        description="Comprehensive airline partner directory, recruitment drive scheduling, interview shortlisting, and cadet placement tracking." 
        action={
          <Button onClick={() => setNewDriveOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Recruitment Drive
          </Button>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Cadets Placed", value: "433", change: "+15% vs last year", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
          { title: "Active Airline Partners", value: "5 Top Airlines", change: "Indigo, Air India, Akasa...", color: "text-blue-400", bg: "bg-blue-500/10", icon: Building2 },
          { title: "Ongoing Placement Drives", value: "3 Drives", change: "45 Cadets participating", color: "text-amber-400", bg: "bg-amber-500/10", icon: Briefcase },
          { title: "Interview Shortlist Rate", value: "88.4%", change: "Industry leading conversion", color: "text-purple-400", bg: "bg-purple-500/10", icon: Star },
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
          { id: "airlines", label: "Airline Partners Directory", icon: Building2 },
          { id: "drives", label: "Ongoing Recruitment Drives", icon: Briefcase },
          { id: "shortlists", label: "Interview Shortlist & Cadet Tracker", icon: UserCheck },
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
        {activeTab === "airlines" && (
          <motion.div key="airlines" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AIRLINES.map((al) => (
                <div key={al.id} className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between group hover:border-white/20 transition-all">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-white font-black text-lg border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                          {al.logo}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white tracking-tight">{al.name}</h3>
                          <span className="text-xs font-mono text-muted-foreground">Code: {al.code}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${al.bg}`}>
                        {al.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 my-6">
                      <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-center">
                        <span className="text-[10px] font-bold text-muted-foreground block uppercase">Active Drives</span>
                        <span className="text-lg font-bold text-white mt-0.5 block">{al.activeDrives}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-secondary/30 border border-white/5 text-center">
                        <span className="text-[10px] font-bold text-muted-foreground block uppercase">Cadets Placed</span>
                        <span className="text-lg font-bold text-primary mt-0.5 block">{al.cadetsPlaced}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-semibold">
                    <span className="text-muted-foreground">Preferred Hiring Partner</span>
                    <button onClick={() => toast({ title: "Opening Partner Dashboard", description: `Loading ${al.name} corporate portal link...` })} className="text-primary hover:underline flex items-center gap-1">
                      View Portal <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "drives" && (
          <motion.div key="drives" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="space-y-4">
              {ONGOING_DRIVES.map((dr) => (
                <div key={dr.id} className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-all">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold bg-primary/20 text-white border border-primary/30 px-3 py-0.5 rounded-full">
                        {dr.airline}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${dr.status === "IN_PROGRESS" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                        {dr.status.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{dr.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-amber-400" />
                        <span>Schedule: {dr.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-primary" />
                        <span>Venue: {dr.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-muted-foreground block uppercase">Eligible Cadets</span>
                      <span className="text-xl font-extrabold text-white mt-0.5 block">{dr.eligibleCount}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-muted-foreground block uppercase">Shortlisted</span>
                      <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{dr.shortlistedCount}</span>
                    </div>
                    <Button onClick={() => toast({ title: "Manage Drive", description: `Loading management console for ${dr.title}.` })} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                      Manage Drive →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "shortlists" && (
          <motion.div key="shortlists" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" /> Active Interview Shortlists & Cadets
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Real-time tracking of cadets through airline simulator and interview screening stages.</p>
                </div>
                <Input placeholder="Search cadet shortlists..." className="bg-secondary/40 border-white/10 text-xs font-semibold w-64" />
              </div>

              <div className="space-y-3 pt-2">
                {SHORTLISTED_CADETS.map((sc) => (
                  <div key={sc.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 font-bold text-sm">
                        ✈️
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate">{sc.name}</p>
                          <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded text-muted-foreground border border-white/5">
                            {sc.course}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Target Airline: <span className="text-white font-semibold">{sc.airline}</span> • Drive: {sc.drive}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                        {sc.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">Updated {sc.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Drive Dialog */}
      <Dialog open={newDriveOpen} onOpenChange={setNewDriveOpen}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Schedule Recruitment Drive
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDrive} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Airline Partner *</label>
              <select className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                {AIRLINES.map((al) => (
                  <option key={al.id} value={al.id} className="bg-slate-900">{al.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Drive Title *</label>
              <Input placeholder="e.g. A320 Cadet Pilot Screening Drive 2026" required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Schedule Date *</label>
              <Input type="date" required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Selection Venue / Simulator Bay *</label>
              <Input placeholder="e.g. Delhi Campus / Full Flight Simulator Bay" required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
            </div>
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setNewDriveOpen(false)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                Publish Drive to Portal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
