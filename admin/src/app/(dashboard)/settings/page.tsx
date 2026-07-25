"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Key, Globe, AlertTriangle,
  Save, Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState("env");

  // Global settings toggle state
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [applicationIntake, setApplicationIntake] = React.useState(true);
  const [forceDebugLogs, setForceDebugLogs] = React.useState(false);

  // Webhook URLs state — empty until loaded from org.settings
  const [razorpayWebhook, setRazorpayWebhook] = React.useState("");
  const [vapiWebhook, setVapiWebhook] = React.useState("");
  const [whatsappWebhook, setWhatsappWebhook] = React.useState("");

  const { data: org } = useQuery({
    queryKey: ["org-settings"],
    queryFn: () => apiFetch<{ settings?: Record<string, unknown> }>("/organizations"),
  });

  const updateOrgMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiFetch("/organizations", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-settings"] });
      toast({ title: "Settings Saved", description: "Organization settings updated successfully." });
    },
    onError: (err: unknown) => {
      toast({ title: "Update Failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" });
    }
  });

  React.useEffect(() => {
    if (org?.settings) {
      const s = org.settings;
      if (typeof s.maintenanceMode === "boolean") setMaintenanceMode(s.maintenanceMode);
      if (typeof s.applicationIntake === "boolean") setApplicationIntake(s.applicationIntake);
      if (typeof s.forceDebugLogs === "boolean") setForceDebugLogs(s.forceDebugLogs);
      if (typeof s.razorpayWebhook === "string") setRazorpayWebhook(s.razorpayWebhook);
      if (typeof s.vapiWebhook === "string") setVapiWebhook(s.vapiWebhook);
      if (typeof s.whatsappWebhook === "string") setWhatsappWebhook(s.whatsappWebhook);
    }
  }, [org]);

  const handleToggleIntake = () => {
    const newVal = !applicationIntake;
    setApplicationIntake(newVal);
    updateOrgMutation.mutate({
      settings: {
        ...(org?.settings ?? {}),
        applicationIntake: newVal,
      }
    });
  };

  const handleToggleMaintenance = () => {
    const newVal = !maintenanceMode;
    setMaintenanceMode(newVal);
    updateOrgMutation.mutate({
      settings: {
        ...(org?.settings ?? {}),
        maintenanceMode: newVal,
      }
    });
  };

  const handleToggleDebugLogs = () => {
    const newVal = !forceDebugLogs;
    setForceDebugLogs(newVal);
    updateOrgMutation.mutate({
      settings: {
        ...(org?.settings ?? {}),
        forceDebugLogs: newVal,
      }
    });
  };

  const handleSaveWebhooks = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrgMutation.mutate({
      settings: {
        ...(org?.settings ?? {}),
        razorpayWebhook,
        vapiWebhook,
        whatsappWebhook,
      }
    });
  };

  const configuredWebhookCount = [razorpayWebhook, vapiWebhook, whatsappWebhook].filter(
    (u) => typeof u === "string" && u.trim().length > 0
  ).length;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="System Configuration" 
        description="Manage global application states like maintenance mode and student intakes, and configure webhook delivery URLs." 
      />

      {/* Live status only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Application Intake", value: applicationIntake ? "OPEN" : "CLOSED", change: applicationIntake ? "Accepting new cadet signups" : "Admissions temporarily halted", color: applicationIntake ? "text-emerald-400" : "text-amber-400", bg: applicationIntake ? "bg-emerald-500/10" : "bg-amber-500/10", icon: Globe },
          { title: "Maintenance Mode", value: maintenanceMode ? "ACTIVE" : "DISABLED", change: maintenanceMode ? "Website showing 503 splash" : "Zero downtime normal operation", color: maintenanceMode ? "text-rose-400" : "text-blue-400", bg: maintenanceMode ? "bg-rose-500/10" : "bg-blue-500/10", icon: AlertTriangle },
          { title: "Configured Webhooks", value: String(configuredWebhookCount), change: "Saved in organization settings", color: "text-purple-400", bg: "bg-purple-500/10", icon: Link2 },
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
                <p className="text-xs text-muted-foreground mt-1">Directly govern public accessibility and master intake validation flags.</p>
              </div>

              <div className="space-y-6 pt-2">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
                  <div>
                    <h4 className="text-sm font-bold text-white">Application Intake Status</h4>
                    <p className="text-xs text-muted-foreground mt-1">When toggled off, new candidate registrations are suspended and show a waiting list form.</p>
                  </div>
                  <button 
                    onClick={handleToggleIntake} 
                    className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${applicationIntake ? "bg-primary" : "bg-secondary"}`}
                  >
                    <div className={`h-6 w-6 rounded-full bg-white transition-transform ${applicationIntake ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
 
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
                  <div>
                    <h4 className="text-sm font-bold text-white">System Maintenance Mode</h4>
                    <p className="text-xs text-muted-foreground mt-1">Puts the public academy website into emergency maintenance mode (HTTP 503 response).</p>
                  </div>
                  <button 
                    onClick={handleToggleMaintenance} 
                    className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${maintenanceMode ? "bg-rose-600" : "bg-secondary"}`}
                  >
                    <div className={`h-6 w-6 rounded-full bg-white transition-transform ${maintenanceMode ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
 
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
                  <div>
                    <h4 className="text-sm font-bold text-white">Force Verbose Debug Logging</h4>
                    <p className="text-xs text-muted-foreground mt-1">Increases stdout log verbosity for database transactions and webhook payloads.</p>
                  </div>
                  <button 
                    onClick={handleToggleDebugLogs} 
                    className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${forceDebugLogs ? "bg-primary" : "bg-secondary"}`}
                  >
                    <div className={`h-6 w-6 rounded-full bg-white transition-transform ${forceDebugLogs ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "webhooks" && (
          <motion.div key="webhooks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
            <form onSubmit={handleSaveWebhooks} className="glass-card rounded-2xl p-6 border border-white/10 space-y-6 max-w-3xl">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" /> Webhook Destinations Configuration
                </h3>
                <p className="text-xs text-muted-foreground mt-1">Define external HTTPS callback endpoints for payment and conversational AI events. Saved to organization settings.</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Razorpay Fee Collection Webhook URL</label>
                  <Input 
                    value={razorpayWebhook} 
                    onChange={(e) => setRazorpayWebhook(e.target.value)} 
                    placeholder="https://"
                    className="bg-secondary/40 border-white/10 text-xs font-mono text-white font-semibold" 
                  />
                  <p className="text-[11px] text-muted-foreground pt-0.5">Subscribes to <span className="font-mono text-primary">order.paid</span> and <span className="font-mono text-primary">payment.failed</span> event streams.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Vapi Voice AI Call Interception Webhook URL</label>
                  <Input 
                    value={vapiWebhook} 
                    onChange={(e) => setVapiWebhook(e.target.value)} 
                    placeholder="https://"
                    className="bg-secondary/40 border-white/10 text-xs font-mono text-white font-semibold" 
                  />
                  <p className="text-[11px] text-muted-foreground pt-0.5">Subscribes to <span className="font-mono text-primary">call.completed</span> and <span className="font-mono text-primary">transcript.updated</span> webhooks.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Meta WhatsApp Graph Delivery Webhook URL</label>
                  <Input 
                    value={whatsappWebhook} 
                    onChange={(e) => setWhatsappWebhook(e.target.value)} 
                    placeholder="https://"
                    className="bg-secondary/40 border-white/10 text-xs font-mono text-white font-semibold" 
                  />
                  <p className="text-[11px] text-muted-foreground pt-0.5">Receives real-time delivery confirmations and user reply message payloads.</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                    <Save className="h-4 w-4 mr-1.5" /> Save Webhook Endpoints
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
