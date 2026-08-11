"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import {
  Key, Globe, AlertTriangle,
  Link2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NOT_CONFIGURED_NOTE =
  "These controls are stored in organization settings but are NOT wired to any consumer in this build. No maintenance middleware, public intake gate, or webhook endpoint reads them, so changing them has no operational effect. Wiring is tracked as a separate sprint.";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("env");

  const { data: org } = useQuery({
    queryKey: ["org-settings"],
    queryFn: () => apiFetch<{ settings?: Record<string, unknown> }>("/organizations"),
  });

  const s = org?.settings ?? {};

  const intakeStored = s.applicationIntake === true ? "OPEN (stored)" : s.applicationIntake === false ? "CLOSED (stored)" : "unset";
  const maintenanceStored = s.maintenanceMode === true ? "ACTIVE (stored)" : s.maintenanceMode === false ? "DISABLED (stored)" : "unset";
  const storedWebhooks = [s.razorpayWebhook, s.vapiWebhook, s.whatsappWebhook].filter(
    (u) => typeof u === "string" && u.trim().length > 0
  ).length;

  const toggleRows = [
    { key: "applicationIntake", title: "Application Intake Status", desc: "When consumed, would suspend new candidate registrations when closed.", stored: intakeStored },
    { key: "maintenanceMode", title: "System Maintenance Mode", desc: "When consumed, would put the public academy website into an emergency 503 state.", stored: maintenanceStored },
    { key: "forceDebugLogs", title: "Force Verbose Debug Logging", desc: "When consumed, would increase stdout log verbosity.", stored: typeof s.forceDebugLogs === "boolean" ? String(s.forceDebugLogs) : "unset" },
  ];

  const webhookRows = [
    { key: "Razorpay Fee Collection", url: s.razorpayWebhook, note: "Would receive order.paid / payment.failed events." },
    { key: "Vapi Voice AI", url: s.vapiWebhook, note: "Would receive call.completed / transcript.updated events." },
    { key: "Meta WhatsApp Graph", url: s.whatsappWebhook, note: "Would receive delivery confirmations and reply payloads." },
  ];

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="System Configuration" 
        description="Review organization-level flags and delivery URLs. No toggles on this page are live until their consumers are wired." 
      />

      {/* Stored state only — none of these are enforced yet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Application Intake", value: "NOT CONFIGURED", change: "Stored flag only — public intake gate never reads it", color: "text-amber-400", bg: "bg-amber-500/10", icon: Globe },
          { title: "Maintenance Mode", value: "NOT CONFIGURED", change: "Stored flag only — no maintenance middleware wired", color: "text-amber-400", bg: "bg-amber-500/10", icon: AlertTriangle },
          { title: "Configured Webhooks", value: "NOT CONFIGURED", change: "Stored URLs only — no webhook endpoints consume them", color: "text-amber-400", bg: "bg-amber-500/10", icon: Link2 },
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
          { id: "env", label: "Environment & Secrets", icon: Key },
          { id: "globals", label: "Global Settings & Toggles", icon: Globe },
          { id: "webhooks", label: "Webhook URLs Configuration", icon: Link2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:foreground border-transparent"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "env" && (
          <motion.div key="env" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4 max-w-3xl">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" /> Runtime Secrets
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Secrets are managed via server environment variables. Values are never displayed in the UI.</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                <p className="text-sm text-white font-medium">
                  Configure database, payment, voice AI, messaging, and storage credentials on the server host or deployment environment. This panel does not store or reveal secret values.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "globals" && (
          <motion.div key="globals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 max-w-3xl">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Global Application Status & Toggles
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Stored organization settings. None of these flags are enforced by the application yet.</p>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Info className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-amber-200 leading-relaxed">{NOT_CONFIGURED_NOTE}</p>
              </div>

              <div className="space-y-6 pt-2">
                {toggleRows.map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-white">{row.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{row.desc}</p>
                      <p className="text-[11px] font-mono text-muted-foreground mt-1.5">Stored value: <span className="text-amber-300">{row.stored}</span></p>
                    </div>
                    <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full">
                      NOT CONFIGURED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "webhooks" && (
          <motion.div key="webhooks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 max-w-3xl">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" /> Webhook Destinations Configuration
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Stored delivery URLs only. No webhook endpoints exist yet, so nothing is delivered or received.</p>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Info className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs font-medium text-amber-200 leading-relaxed">
                  {storedWebhooks} URL(s) currently stored. Webhook handling is a separate sprint — these values are not consumed by any route in this build.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {webhookRows.map((row) => (
                  <div key={row.key} className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-muted-foreground">{row.key}</label>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full">
                        NOT CONFIGURED
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-white mt-2 break-all">{typeof row.url === "string" && row.url.trim() ? row.url : "not set"}</p>
                    <p className="text-[11px] text-muted-foreground pt-1">{row.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
