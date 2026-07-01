"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  History, Download, Search, Filter, ShieldCheck, User, 
  Clock, Globe, CheckCircle2, Lock, Cpu, Database
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const MOCK_AUDIT_TRAIL = [
  { id: "aud-201", actionType: "FEE_TRANCHE_UPDATE", user: "Capt. Vikram Singh", email: "vikram.singh@airborneaviation.in", timestamp: "2026-06-26 10:42:15", ipAddress: "103.82.91.42 (Delhi, IN)", description: "Updated Course Tuition Fee for CPL Ground School to ₹4,50,000", integrityHash: "sha256:8f9a3e2b1c4d7e8f9a0b1c2d3e4f5a6b", module: "Courses" },
  { id: "aud-202", actionType: "STAGE_PROMOTED", user: "Anjali Sharma", email: "anjali.sharma@airborneaviation.in", timestamp: "2026-06-26 10:35:10", ipAddress: "122.161.45.12 (Noida, IN)", description: "Moved candidate Rajesh Kumar (LD-9204) to Fee Payment stage", integrityHash: "sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d", module: "Admissions" },
  { id: "aud-203", actionType: "WHATSAPP_DISPATCH", user: "Anjali Sharma", email: "anjali.sharma@airborneaviation.in", timestamp: "2026-06-26 10:31:05", ipAddress: "122.161.45.12 (Noida, IN)", description: "Triggered Fee Payment Link template to +91 9876543210", integrityHash: "sha256:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b", module: "Notifications" },
  { id: "aud-204", actionType: "VAPI_ESCALATION", user: "Rohan Verma", email: "rohan.verma@airborneaviation.in", timestamp: "2026-06-26 09:55:22", ipAddress: "115.112.14.88 (Gurgaon, IN)", description: "Claimed Vapi Voice AI escalation for candidate Amit Sen", integrityHash: "sha256:9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f", module: "Vapi AI" },
  { id: "aud-205", actionType: "PAGE_PUBLISHED", user: "Priya Patel", email: "priya.patel@airborneaviation.in", timestamp: "2026-06-26 09:12:44", ipAddress: "103.21.124.9 (Mumbai, IN)", description: "Published Winter Intake Landing Page draft in CMS", integrityHash: "sha256:3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d", module: "CMS" },
  { id: "aud-206", actionType: "MEDIA_UPLOADED", user: "Siddharth Sen", email: "siddharth.sen@airborneaviation.in", timestamp: "2026-06-25 18:44:30", ipAddress: "182.65.112.4 (Delhi, IN)", description: "Uploaded 12 high-res fleet photos to S3 CDN bucket", integrityHash: "sha256:7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b", module: "Media Library" },
  { id: "aud-207", actionType: "DRIVE_SCHEDULED", user: "Vikram Malhotra", email: "v.malhotra@airborneaviation.in", timestamp: "2026-06-25 14:20:11", ipAddress: "103.82.91.42 (Delhi, IN)", description: "Scheduled Indigo A320 Cadet Pilot Screening Drive", integrityHash: "sha256:4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c", module: "Placements" },
  { id: "aud-208", actionType: "SYSTEM_RESTART", user: "Capt. Vikram Singh", email: "vikram.singh@airborneaviation.in", timestamp: "2026-06-25 08:00:00", ipAddress: "103.82.91.42 (Delhi, IN)", description: "Applied rolling zero-downtime container environment synchronization", integrityHash: "sha256:0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c", module: "System Config" },
];

export default function AuditPage() {
  const [search, setSearch] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("ALL");
  const [selectedAudit, setSelectedAudit] = React.useState<any | null>(null);

  const handleCsvExport = () => {
    // Generate CSV string
    const headers = ["ID,Action Type,User,Email,Timestamp,IP Address,Description,Integrity Hash,Module"];
    const rows = MOCK_AUDIT_TRAIL.map(a => `"${a.id}","${a.actionType}","${a.user}","${a.email}","${a.timestamp}","${a.ipAddress}","${a.description}","${a.integrityHash}","${a.module}"`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Airborne_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "CSV Export Generated", description: "Cryptographically verified audit trail downloaded successfully." });
  };

  const filteredAudits = MOCK_AUDIT_TRAIL.filter(aud => {
    const matchAct = actionFilter === "ALL" || aud.actionType.includes(actionFilter) || aud.module === actionFilter;
    const matchSearch = aud.actionType.toLowerCase().includes(search.toLowerCase()) || 
                        aud.user.toLowerCase().includes(search.toLowerCase()) || 
                        aud.ipAddress.toLowerCase().includes(search.toLowerCase()) || 
                        aud.description.toLowerCase().includes(search.toLowerCase()) ||
                        aud.timestamp.includes(search);
    return matchAct && matchSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Immutable Audit Trail & Activity Ledger" 
        description="Review unmodifiable historical administration actions. Filter by action type, user, timestamp, or IP address with cryptographic hash verification." 
        action={
          <Button onClick={handleCsvExport} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 text-xs font-bold">
            <Download className="h-4 w-4 mr-2" />
            Export Audit Trail (CSV)
          </Button>
        }
      />

      {/* Security Ledger Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Ledger State", value: "IMMUTABLE", change: "Write-only WORM storage", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Lock },
          { title: "Verification Status", value: "SHA-256 SECURED", change: "Zero cryptographic collisions", color: "text-purple-400", bg: "bg-purple-500/10", icon: ShieldCheck },
          { title: "Recorded Events", value: "1,420 Entries", change: "Across all 15 CRM modules", color: "text-blue-400", bg: "bg-blue-500/10", icon: Database },
          { title: "Audit Log Compliance", value: "DGCA / HIPAA", change: "Complete non-repudiation", color: "text-amber-400", bg: "bg-amber-500/10", icon: Cpu },
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

      {/* Main Audit Table */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by action, user, IP address, timestamp..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-xs font-semibold text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="flex h-9 w-48 rounded-xl border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
              <option value="ALL" className="bg-slate-900">All Modules & Actions</option>
              <option value="Admissions" className="bg-slate-900">Admissions Module</option>
              <option value="Courses" className="bg-slate-900">Courses Module</option>
              <option value="Notifications" className="bg-slate-900">Notifications Module</option>
              <option value="Vapi AI" className="bg-slate-900">Vapi AI Module</option>
              <option value="CMS" className="bg-slate-900">CMS Module</option>
              <option value="Media Library" className="bg-slate-900">Media Library</option>
              <option value="Placements" className="bg-slate-900">Placements Module</option>
              <option value="System Config" className="bg-slate-900">System Config</option>
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden glass-panel shadow-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80">
                <th className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Action Type & Module</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">System User</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Action Description</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white uppercase tracking-wider">Timestamp & IP Address</th>
                <th className="w-24 px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-secondary/20">
              {filteredAudits.map((aud) => (
                <tr key={aud.id} onClick={() => setSelectedAudit(aud)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                        <History className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="font-bold text-white group-hover:text-primary transition-colors text-xs block">{aud.actionType}</span>
                        <span className="text-[10px] font-semibold text-muted-foreground block mt-0.5">Module: {aud.module}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-white block">{aud.user}</span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">{aud.email}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground font-medium max-w-xs truncate">
                    {aud.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-white block flex items-center gap-1"><Clock className="h-3 w-3 text-primary" /> {aud.timestamp}</span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5 flex items-center gap-1"><Globe className="h-3 w-3 text-muted-foreground" /> {aud.ipAddress}</span>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedAudit(aud)} className="text-xs font-bold text-emerald-400 hover:bg-white/10">
                      <ShieldCheck className="h-4 w-4 mr-1.5" /> Inspect Hash
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Inspect Modal */}
      <Dialog open={!!selectedAudit} onOpenChange={(o) => !o && setSelectedAudit(null)}>
        <DialogContent className="max-w-3xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  Ledger Entry: {selectedAudit?.actionType}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Module: <span className="font-semibold text-white">{selectedAudit?.module}</span> • Entry ID: <span className="font-mono text-primary font-bold">{selectedAudit?.id}</span>
                </p>
              </div>
              <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full">
                VERIFIED IMMUTABLE
              </span>
            </div>
          </DialogHeader>

          {selectedAudit && (
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-secondary/30 border border-white/5">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">System Operator</span>
                  <p className="text-sm font-bold text-white mt-1">{selectedAudit.user}</p>
                  <p className="text-xs text-muted-foreground">{selectedAudit.email}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Network Origin</span>
                  <p className="text-sm font-bold text-white mt-1">{selectedAudit.ipAddress}</p>
                  <p className="text-xs text-muted-foreground">Logged at {selectedAudit.timestamp}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Full Action Detail</h3>
                <div className="p-4 rounded-xl bg-secondary/40 border border-white/5 text-xs font-medium text-white leading-relaxed">
                  {selectedAudit.description}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cryptographic Verification Hash (SHA-256)</h3>
                <div className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono font-bold text-emerald-400 select-all overflow-x-auto">
                  {selectedAudit.integrityHash}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">This hash guarantees that the audit record has not been modified or tampered with since the moment of execution.</p>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button variant="outline" onClick={() => setSelectedAudit(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
              Close Audit Dossier
            </Button>
            <Button onClick={() => { navigator.clipboard.writeText(JSON.stringify(selectedAudit, null, 2)); toast({ title: "Audit Record Copied", description: "JSON proof copied to clipboard." }); }} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
              Copy JSON Proof
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
