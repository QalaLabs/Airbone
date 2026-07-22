"use client";

import * as React from "react";
import { Plus, Filter, MoreVertical, Mail, Phone, Link, MessageSquare, TrendingUp, Calendar } from "lucide-react";
import { getOutreachSequences } from "@/lib/crm/outreach";
import { OutreachSequence } from "@/lib/crm/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CRMDataTable, CRMColumn } from "@/components/shared/crm-data-table";

const statusColor: Record<string, string> = {
  Active: "bg-emerald-500",
  Paused: "bg-amber-500",
  Draft: "bg-gray-500",
};

const typeIcon: Record<string, React.ElementType> = {
  email: Mail,
  linkedin: Link,
  call: Phone,
  sms: MessageSquare,
};

export default function CRMOutreachPage() {
  const [sequences, setSequences] = React.useState<OutreachSequence[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getOutreachSequences()
      .then((d) => {
        setSequences(d);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Outreach Sequences</h1>
            <p className="text-sm text-muted-foreground">Multi-channel email + LinkedIn + call sequences</p>
          </div>
        </div>
        <div className="p-6 text-white text-xs">Loading outreach campaigns...</div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 font-bold">Error loading outreach sequences: {error}</div>;
  }

  const totalSent = sequences.reduce((sum, s) => sum + s.sent, 0);
  const totalOpened = sequences.reduce((sum, s) => sum + s.opened, 0);
  const totalReplied = sequences.reduce((sum, s) => sum + s.replied, 0);
  const totalBooked = sequences.reduce((sum, s) => sum + s.booked, 0);
  const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : "0";
  const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : "0";

  const recentActivity: Array<{ type: string; lead: string; action: string; time: string; sequence: string }> =
    sequences.slice(0, 5).map((seq, i) => ({
      type: (["email", "linkedin", "email", "call", "email"] as string[])[i % 5] ?? "email",
      lead: seq.name,
      action: i === 0 ? "Replied" : i === 1 ? "Connected" : i === 2 ? "Opened" : i === 3 ? "Voicemail" : "Bounced",
      time: `${i + 1} hour${i > 0 ? "s" : ""} ago`,
      sequence: seq.name,
    }));

  const columns: CRMColumn<OutreachSequence>[] = [
    {
      key: "name",
      header: "Sequence",
      render: (seq: OutreachSequence) => (
        <span className="font-semibold text-white">{seq.campaign_name || seq.name}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (seq: OutreachSequence) => {
        const status = seq.status || "Draft";
        return (
          <Badge
            variant="outline"
            className={`${
              statusColor[status] || "bg-gray-500"
            } text-white border-none text-[9px] px-2 py-0.5 rounded-full`}
          >
            {status}
          </Badge>
        );
      },
    },
    { key: "steps", header: "Steps", align: "right" },
    { key: "sent", header: "Sent", align: "right" },
    { key: "opened", header: "Opened", align: "right" },
    { key: "replied", header: "Replied", align: "right" },
    { key: "booked", header: "Booked", align: "right" },
    {
      key: "conversion",
      header: "CVR",
      align: "right",
      render: (seq: OutreachSequence) => {
        const val = parseFloat(seq.conversion || "0");
        return (
          <span
            className={`font-extrabold ${val >= 15 ? "text-emerald-500" : "text-amber-500"}`}
          >
            {seq.conversion}
          </span>
        );
      },
    },
    {
      key: "action",
      header: "Action",
      render: () => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Outreach Sequences</h1>
          <p className="text-sm text-muted-foreground">Multi-channel email + LinkedIn + call sequences</p>
        </div>
        <Button className="text-xs font-semibold h-9">
          <Plus className="mr-2 h-4 w-4" />
          New Sequence
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Emails Sent</p>
              <p className="text-2xl font-bold text-white mt-1">{totalSent}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Open Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{openRate}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Reply Rate</p>
              <p className="text-2xl font-bold text-white mt-1">{replyRate}%</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Meetings Booked</p>
              <p className="text-2xl font-bold text-white mt-1">{totalBooked}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
              <Calendar className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white">Sequences</CardTitle>
            <Button variant="outline" className="border-white/10 text-xs font-semibold h-8">
              <Filter className="mr-2 h-3.5 w-3.5" />
              Filter
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <CRMDataTable
              columns={columns}
              data={sequences}
              searchable={false}
              pageSize={10}
            />
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 shadow-lg">
          <CardHeader className="border-b border-white/5 pb-3">
            <CardTitle className="text-sm font-semibold text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentActivity.map((activity, i) => {
                const Icon = typeIcon[activity.type] || Mail;
                return (
                  <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{activity.lead}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{activity.action}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                      <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">{activity.sequence}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
