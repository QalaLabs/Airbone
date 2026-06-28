"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  AlertOctagon, Bug, Server, Activity, Search, ExternalLink, 
  CheckCircle2, RefreshCw, Filter, Code, FileText, Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

const MOCK_ERRORS = [
  { id: "err-101", code: "ERR_WEBHOOK_TIMEOUT", service: "Notifications Service", endpoint: "POST /api/v1/webhooks/whatsapp", message: "Connect timeout to graph.facebook.com:443 after 5000ms", severity: "HIGH", count: 14, lastOccurred: "4 mins ago", status: "OPEN", trace: "Error: Connect timeout to graph.facebook.com:443\n    at TLSSocket.onConnectTimeout (node:_http_client:1240:9)\n    at Object.onceWrapper (node:events:628:26)\n    at TLSSocket.emit (node:events:525:35)\n    at Socket._onTimeout (node:net:571:8)\n    at listOnTimeout (node:internal/timers:569:17)\n    at process.processTimers (node:internal/timers:512:7)" },
  { id: "err-102", code: "ERR_PRISMA_TRANSACTION", service: "Admissions Service", endpoint: "PATCH /api/v1/admissions/9204/stage", message: "Transaction failed due to write conflict on table 'Admission'", severity: "CRITICAL", count: 3, lastOccurred: "18 mins ago", status: "RESOLVED", trace: "PrismaClientKnownRequestError: Transaction failed due to write conflict\n    at Object.request (C:\\Airbone\\node_modules\\@prisma\\client\\runtime\\library.js:124:45)\n    at async runInTransaction (C:\\Airbone\\backend\\src\\services\\admissions.ts:412:12)" },
  { id: "err-103", code: "ERR_S3_SIGNATURE_EXPIRED", service: "Media Library Service", endpoint: "GET /api/v1/media/secure-url", message: "RequestTimeTooSkewed: The difference between the request time and the current time is too large.", severity: "MEDIUM", count: 28, lastOccurred: "1 hour ago", status: "OPEN", trace: "AWSError: RequestTimeTooSkewed: The difference between the request time and the current time is too large.\n    at Request.extractError (C:\\Airbone\\node_modules\\aws-sdk\\lib\\services\\s3.js:711:35)\n    at Request.callListeners (C:\\Airbone\\node_modules\\aws-sdk\\lib\\sequential_executor.js:106:20)" },
  { id: "err-104", code: "ERR_UNAUTHORIZED_TOKEN", service: "Auth Middleware", endpoint: "GET /api/v1/users/me", message: "JWT token expired or signature validation failed", severity: "LOW", count: 112, lastOccurred: "2 hours ago", status: "RESOLVED", trace: "JsonWebTokenError: jwt expired\n    at Object.module.exports [as verify] (C:\\Airbone\\node_modules\\jsonwebtoken\\verify.js:112:17)\n    at requireAuth (C:\\Airbone\\backend\\src\\middleware\\auth.ts:42:24)" },
];

export default function ErrorsPage() {
  const [activeTab, setActiveTab] = React.useState("errors");
  const [search, setSearch] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState("ALL");
  const [selectedError, setSelectedError] = React.useState<any | null>(null);

  const handleResolveAll = () => {
    toast({ title: "Sentry Exceptions Cleared", description: "All open API exceptions marked as resolved. Health metrics optimal." });
  };

  const filteredErrors = MOCK_ERRORS.filter(err => {
    const matchSev = severityFilter === "ALL" || err.severity === severityFilter;
    const matchSearch = err.code.toLowerCase().includes(search.toLowerCase()) || err.message.toLowerCase().includes(search.toLowerCase()) || err.service.toLowerCase().includes(search.toLowerCase());
    return matchSev && matchSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Error Logs, Exceptions & Sentry / Datadog APM" 
        description="Search real-time API exceptions, evaluate Datadog/Sentry APM integration health, and analyze deep execution stack traces." 
        action={
          <div className="flex items-center gap-3">
            <Button onClick={handleResolveAll} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 text-xs font-bold">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Resolve All Exceptions
            </Button>
          </div>
        }
      />

      {/* APM Real-Time Integration Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Sentry Integration", value: "HEALTHY", change: "SDK v8.2.0 Active", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
          { title: "Datadog APM Tracer", value: "CONNECTED", change: "EVM & Node Tracer online", color: "text-purple-400", bg: "bg-purple-500/10", icon: Activity },
          { title: "Open API Exceptions", value: "2 Open Alerts", change: "Down 42% this week", color: "text-rose-400", bg: "bg-rose-500/10", icon: AlertOctagon },
          { title: "Average Exception Rate", value: "0.02%", change: "Industry leading 99.98% SLA", color: "text-blue-400", bg: "bg-blue-500/10", icon: Cpu },
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
          { id: "errors", label: "Searchable API Error Table", icon: Bug },
          { id: "integrations", label: "APM Integration Status (Sentry & Datadog)", icon: Server },
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
        {activeTab === "errors" && (
          <motion.div key="errors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search errors by code, message, microservice..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-xs font-semibold text-white"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="flex h-9 w-44 rounded-xl border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                    <option value="ALL" className="bg-slate-900">All Severities</option>
                    <option value="CRITICAL" className="bg-slate-900 text-rose-400">CRITICAL</option>
                    <option value="HIGH" className="bg-slate-900 text-amber-400">HIGH</option>
                    <option value="MEDIUM" className="bg-slate-900 text-blue-400">MEDIUM</option>
                    <option value="LOW" className="bg-slate-900 text-muted-foreground">LOW</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {filteredErrors.map((err) => (
                  <div key={err.id} onClick={() => setSelectedError(err)} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${err.severity === "CRITICAL" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : err.severity === "HIGH" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                        <AlertOctagon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{err.code}</p>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${err.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : err.severity === "HIGH" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                            {err.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{err.message}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Service: <span className="text-white font-medium">{err.service}</span> • Endpoint: <span className="font-mono text-primary font-bold">{err.endpoint}</span></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-bold text-muted-foreground block uppercase">Occurrence Count</span>
                        <span className="text-sm font-mono font-bold text-white mt-0.5 block">{err.count} times</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${err.status === "OPEN" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>
                          {err.status}
                        </span>
                        <p className="text-[11px] text-muted-foreground mt-1">{err.lastOccurred}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "integrations" && (
          <motion.div key="integrations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="h-5 w-5 text-primary" /> Application Performance Monitoring (APM) Integration Hub
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Status of third-party monitoring daemons and distributed log forwarders.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                {[
                  { name: "Sentry Crash Reporting", sdk: "sentry/node v8.2.0", endpoint: "https://sentry.io/organizations/airborne-academy", desc: "Monitors Next.js API routes and server actions for unhandled runtime promise rejections and crashes.", status: "CONNECTED" },
                  { name: "Datadog APM & Trace Forwarder", sdk: "dd-trace v4.12.0", endpoint: "https://us5.datadoghq.com/apm/traces", desc: "Correlates distributed trace spans across Vapi Voice AI webhooks, Prisma ORM, and WhatsApp Meta API calls.", status: "CONNECTED" },
                ].map((intg, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-secondary/30 border border-white/5 space-y-4 flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-xs font-mono font-bold text-primary">{intg.sdk}</span>
                        <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                          {intg.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white tracking-tight mt-3">{intg.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-medium">{intg.desc}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">External Hub</span>
                      <button onClick={() => toast({ title: `Opening ${intg.name}`, description: `Redirecting to secure single sign on portal...` })} className="text-primary hover:underline flex items-center gap-1">
                        Open Dashboard <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trace Details Modal */}
      <Dialog open={!!selectedError} onOpenChange={(o) => !o && setSelectedError(null)}>
        <DialogContent className="max-w-4xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <Bug className="h-6 w-6 text-rose-400" />
                  Exception: {selectedError?.code}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Service: <span className="font-semibold text-white">{selectedError?.service}</span> • Endpoint: <span className="font-mono text-primary font-bold">{selectedError?.endpoint}</span>
                </p>
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${selectedError?.severity === "CRITICAL" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
                {selectedError?.severity} SEVERITY
              </span>
            </div>
          </DialogHeader>

          {selectedError && (
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Error Diagnostic Message</h3>
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-300 font-mono">
                  {selectedError.message}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Deep Execution Stack Trace</h3>
                <div className="p-4 rounded-xl bg-slate-950 border border-white/10 whitespace-pre-line text-xs font-medium text-emerald-400 leading-relaxed font-mono overflow-x-auto">
                  {selectedError.trace}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button variant="outline" onClick={() => setSelectedError(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
              Close Trace
            </Button>
            <Button onClick={() => { toast({ title: "Exception Resolved", description: `Alert ${selectedError?.code} archived from queue.` }); setSelectedError(null); }} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
