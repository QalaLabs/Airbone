"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Settings, Key, Globe, Eye, EyeOff, CheckCircle2, AlertTriangle, 
  Save, Shield, Link2, RefreshCw, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface Organization {
  id: string;
  name: string;
  domain?: string;
  logoUrl?: string;
  settings?: any;
  featureFlags?: any;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState("globals");
  const [maskedKeys, setMaskedKeys] = React.useState<Record<string, boolean>>({});

  // Query organization settings
  const { data: org, isLoading } = useQuery<Organization>({
    queryKey: ["organization", "settings"],
    queryFn: () => apiFetch<Organization>("/organizations"),
  });

  // Local setting fields derived from database
  const [name, setName] = React.useState("");
  const [domain, setDomain] = React.useState("");
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [applicationIntake, setApplicationIntake] = React.useState(true);
  const [forceDebugLogs, setForceDebugLogs] = React.useState(false);
  const [razorpayWebhook, setRazorpayWebhook] = React.useState("");
  const [vapiWebhook, setVapiWebhook] = React.useState("");
  const [whatsappWebhook, setWhatsappWebhook] = React.useState("");
  const [envVars, setEnvVars] = React.useState<Record<string, string>>({});

  // Sync state once database organization is loaded
  React.useEffect(() => {
    if (org) {
      setName(org.name || "");
      setDomain(org.domain || "");
      
      const s = org.settings || {};
      setMaintenanceMode(s.maintenanceMode ?? false);
      setApplicationIntake(s.applicationIntake ?? true);
      setForceDebugLogs(s.forceDebugLogs ?? false);
      setRazorpayWebhook(s.razorpayWebhook ?? "https://api.airborneaviation.in/v1/webhooks/razorpay");
      setVapiWebhook(s.vapiWebhook ?? "https://api.airborneaviation.in/v1/webhooks/vapi");
      setWhatsappWebhook(s.whatsappWebhook ?? "https://api.airborneaviation.in/v1/webhooks/whatsapp");
      setEnvVars(s.envVars ?? {
        DATABASE_URL: "postgresql://airborne_master:********@aws-1.supabase.com:6543/postgres",
        RAZORPAY_KEY_ID: "rzp_live_AirbornePremiumKey2026",
        VAPI_API_KEY: "vapi_key_0987654321_airborne_counselor",
        META_WHATSAPP_TOKEN: "EAAGW1234567890MetaWhatsAppBearerToken",
      });
    }
  }, [org]);

  // Mutation to save settings
  const updateMutation = useMutation({
    mutationFn: (body: any) => 
      apiFetch<Organization>("/organizations", { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
      toast({ title: "Configuration Synchronized", description: "Vault settings updated successfully." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;

    updateMutation.mutate({
      name,
      domain: domain || null,
      settings: {
        ...(org.settings || {}),
        maintenanceMode,
        applicationIntake,
        forceDebugLogs,
        razorpayWebhook,
        vapiWebhook,
        whatsappWebhook,
        envVars,
      }
    });
  };

  const toggleMask = (key: string) => {
    setMaskedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 pb-12 text-white">
      <PageHeader 
        title="System Configuration & Environment Vault" 
        description="Inspect encrypted runtime variables, manage global application states, and configure webhook callback endpoints." 
        action={
          <Button onClick={() => { queryClient.invalidateQueries({ queryKey: ["organization"] }); toast({ title: "Runtime Reloaded" }); }} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 text-xs font-bold">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Configs
          </Button>
        }
      />

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Vault Encryption", value: "AES-256-GCM", change: "Tenant scope isolation", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Shield },
          { title: "Application Intake", value: applicationIntake ? "OPEN" : "CLOSED", change: applicationIntake ? "Accepting new cadet signups" : "Admissions temporarily halted", color: applicationIntake ? "text-emerald-400" : "text-amber-400", bg: applicationIntake ? "bg-emerald-500/10" : "bg-amber-500/10", icon: Globe },
          { title: "Maintenance Mode", value: maintenanceMode ? "ACTIVE" : "DISABLED", change: maintenanceMode ? "Website showing 503 splash" : "Zero downtime normal operation", color: maintenanceMode ? "text-rose-400" : "text-blue-400", bg: maintenanceMode ? "bg-rose-500/10" : "bg-blue-500/10", icon: AlertTriangle },
          { title: "Active Webhooks", value: "3 Endpoints", change: "Razorpay, Vapi, WhatsApp", color: "text-purple-400", bg: "bg-purple-500/10", icon: Link2 },
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
          { id: "globals", label: "Global Settings & Toggles", icon: Globe },
          { id: "env", label: "Encrypted Environment Variables", icon: Key },
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

      {isLoading ? (
        <div className="glass-card rounded-2xl p-8 flex items-center justify-center border border-white/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-sm font-semibold">Loading system settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings}>
          <AnimatePresence mode="wait">
            {activeTab === "globals" && (
              <motion.div key="globals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6 max-w-3xl">
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" /> Global Application Status & Toggles
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">Academy Name</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-secondary/40 border-white/10 text-xs font-semibold" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">Academy Domain</label>
                        <Input value={domain} onChange={(e) => setDomain(e.target.value)} className="bg-secondary/40 border-white/10 text-xs font-semibold" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
                      <div>
                        <h4 className="text-sm font-bold text-white">Application Intake Status</h4>
                        <p className="text-xs text-muted-foreground mt-1">When toggled off, new candidate registrations are suspended.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setApplicationIntake(!applicationIntake)} 
                        className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${applicationIntake ? "bg-primary" : "bg-secondary"}`}
                      >
                        <div className={`h-6 w-6 rounded-full bg-white transition-transform ${applicationIntake ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
                      <div>
                        <h4 className="text-sm font-bold text-white">System Maintenance Mode</h4>
                        <p className="text-xs text-muted-foreground mt-1">Puts the public academy website into emergency maintenance mode.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setMaintenanceMode(!maintenanceMode)} 
                        className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${maintenanceMode ? "bg-rose-600" : "bg-secondary"}`}
                      >
                        <div className={`h-6 w-6 rounded-full bg-white transition-transform ${maintenanceMode ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5">
                      <div>
                        <h4 className="text-sm font-bold text-white">Force Verbose Debug Logging</h4>
                        <p className="text-xs text-muted-foreground mt-1">Increases stdout log verbosity for database transactions.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setForceDebugLogs(!forceDebugLogs)} 
                        className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${forceDebugLogs ? "bg-primary" : "bg-secondary"}`}
                      >
                        <div className={`h-6 w-6 rounded-full bg-white transition-transform ${forceDebugLogs ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                      {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" /> Save Global Settings</>}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "env" && (
              <motion.div key="env" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" /> Encrypted Runtime Environment Variables
                    </h3>
                  </div>

                  <div className="space-y-4 pt-2">
                    {Object.entries(envVars).map(([key, val]) => {
                      const isMasked = maskedKeys[key] ?? true;
                      return (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-secondary/30 border border-white/5 gap-4">
                          <div className="sm:w-1/3 min-w-0">
                            <span className="text-xs font-mono font-bold text-primary block truncate">{key}</span>
                          </div>
                          <div className="flex-1 flex items-center gap-2 max-w-xl">
                            <div className="relative flex-1">
                              <Input 
                                type={isMasked ? "password" : "text"} 
                                value={val} 
                                onChange={(e) => setEnvVars(prev => ({ ...prev, [key]: e.target.value }))}
                                className="bg-secondary/60 border-white/10 text-xs font-mono font-medium text-white pr-10" 
                              />
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => toggleMask(key)} className="h-9 w-9 shrink-0 hover:bg-white/10 text-muted-foreground hover:text-white">
                              {isMasked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-end">
                    <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                      {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" /> Save Variable Adjustments</>}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "webhooks" && (
              <motion.div key="webhooks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6 max-w-3xl">
                <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-primary" /> Webhook Destinations Configuration
                    </h3>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Razorpay Fee Collection Webhook URL *</label>
                      <Input 
                        value={razorpayWebhook} 
                        onChange={(e) => setRazorpayWebhook(e.target.value)} 
                        required 
                        className="bg-secondary/40 border-white/10 text-xs font-mono text-white font-semibold" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Vapi Voice AI Call Interception Webhook URL *</label>
                      <Input 
                        value={vapiWebhook} 
                        onChange={(e) => setVapiWebhook(e.target.value)} 
                        required 
                        className="bg-secondary/40 border-white/10 text-xs font-mono text-white font-semibold" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Meta WhatsApp Graph Delivery Webhook URL *</label>
                      <Input 
                        value={whatsappWebhook} 
                        onChange={(e) => setWhatsappWebhook(e.target.value)} 
                        required 
                        className="bg-secondary/40 border-white/10 text-xs font-mono text-white font-semibold" 
                      />
                    </div>

                    <div className="pt-4 border-t border-white/10 flex justify-end">
                      <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                        {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" /> Save Webhook Endpoints</>}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      )}
    </div>
  );
}
