"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  MessageSquare, Users, Send, Inbox, ShieldAlert,
  FileText, Workflow, PlugZap, ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface Overview {
  providerConfigured: boolean;
  providerName: string;
  conversations: number;
  unread: number;
  optedOutContacts: number;
  messagesSent7d: number;
  messagesReceived7d: number;
  messagesFailed7d: number;
  activeTemplates: number;
  activeAutomations: number;
}

const SECTIONS = [
  { href: "/whatsapp/inbox", label: "Inbox", desc: "Live conversations", icon: Inbox },
  { href: "/whatsapp/contacts", label: "Contacts", desc: "Audience & opt-outs", icon: Users },
  { href: "/whatsapp/campaigns", label: "Campaigns", desc: "Bulk broadcasts", icon: Send },
  { href: "/whatsapp/automations", label: "Automations", desc: "Triggered flows", icon: Workflow },
  { href: "/whatsapp/sequences", label: "Sequences", desc: "Multi-day journeys", icon: MessageSquare },
  { href: "/whatsapp/templates", label: "Templates", desc: "Message content", icon: FileText },
];

export default function WhatsAppOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp", "overview"],
    queryFn: () => apiFetch<Overview>("/whatsapp/overview"),
    refetchInterval: 30_000,
  });

  const stats = [
    { label: "Conversations", value: data?.conversations ?? 0, icon: Inbox, tone: "text-sky-400" },
    { label: "Unread", value: data?.unread ?? 0, icon: MessageSquare, tone: "text-amber-400" },
    { label: "Sent (7d)", value: data?.messagesSent7d ?? 0, icon: Send, tone: "text-emerald-400" },
    { label: "Received (7d)", value: data?.messagesReceived7d ?? 0, icon: Inbox, tone: "text-violet-400" },
    { label: "Failed (7d)", value: data?.messagesFailed7d ?? 0, icon: ShieldAlert, tone: "text-rose-400" },
    { label: "Opted out", value: data?.optedOutContacts ?? 0, icon: ShieldAlert, tone: "text-orange-400" },
    { label: "Templates", value: data?.activeTemplates ?? 0, icon: FileText, tone: "text-cyan-400" },
    { label: "Automations", value: data?.activeAutomations ?? 0, icon: Workflow, tone: "text-lime-400" },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">WhatsApp Business</h1>
        <p className="text-xs text-muted-foreground mt-1 font-semibold">
          Conversations, campaigns and automations on one canvas
        </p>
      </div>

      {!isLoading && data && !data.providerConfigured && (
        <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
          <PlugZap className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-amber-300">No WhatsApp provider configured</p>
            <p className="text-[11px] text-muted-foreground">
              Set <span className="font-mono">WHATSAPP_PROVIDER=mock</span> for local testing or{" "}
              <span className="font-mono">interakt</span> for production. Sends are honestly recorded as
              NOT_CONFIGURED until then.
            </p>
          </div>
          <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-300 text-xs font-bold shrink-0" asChild>
            <Link href="/whatsapp/settings">Settings</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <s.icon className={`h-4 w-4 ${s.tone}`} />
                </div>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECTIONS.map((sec) => (
          <Link
            key={sec.href}
            href={sec.href}
            className="glass-card rounded-2xl p-5 border border-white/10 flex items-center gap-4 hover:border-primary/40 transition-colors group"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
              <sec.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{sec.label}</p>
              <p className="text-[11px] text-muted-foreground font-semibold">{sec.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
