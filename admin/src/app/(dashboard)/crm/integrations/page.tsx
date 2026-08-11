"use client";

import * as React from "react";
import { Link2, Globe, Database, FileSpreadsheet, Zap, DollarSign, Image as ImageIcon } from "lucide-react";
import { getIntegrationsData } from "@/lib/crm/integrations";
import type { IntegrationsData, IntegrationStatus } from "@/lib/crm/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ status }: { status: IntegrationStatus["status"] }) {
  const map = {
    connected: { label: "Connected", cls: "bg-emerald-500" },
    not_configured: { label: "Not Configured", cls: "bg-gray-500" },
    removed: { label: "Removed", cls: "bg-gray-500" },
  } as const;
  const s = map[status] ?? map.not_configured;
  return <Badge className={`${s.cls} text-white border-none text-[10px]`}>{s.label}</Badge>;
}

export default function CRMIntegrationsPage() {
  const [data, setData] = React.useState<IntegrationsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getIntegrationsData()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-white text-xs">Loading integrations...</div>;
  if (error || !data)
    return <div className="p-6 text-red-500 font-bold">Error: {error || "No data"}</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Real configuration status for every channel that feeds data into the CRM.
        </p>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="font-bold text-white">{data.summary.connected.length}</span> connected
        <span className="mx-1">·</span>
        <span className="font-bold text-white">{data.summary.notConfigured.length}</span> not configured
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IntegrationCard
          title="Built-in CRM"
          icon={<Database className="h-4 w-4 text-emerald-500" />}
          status={data.crm.status}
          body={data.crm.note ?? ""}
        />

        <IntegrationCard
          title="Facebook Lead Ads"
          icon={<Link2 className="h-4 w-4 text-blue-500" />}
          status={data.facebook.status}
          body={data.facebook.note ?? ""}
          required={data.facebook.required}
        />

        <IntegrationCard
          title="Google Ads Lead Forms"
          icon={<Globe className="h-4 w-4 text-amber-500" />}
          status={data.googleAds.status}
          body={data.googleAds.note ?? ""}
          required={data.googleAds.required}
        />

        <IntegrationCard
          title="Media Storage (Cloudflare R2)"
          icon={<ImageIcon className="h-4 w-4 text-purple-500" />}
          status={data.media.status}
          body={`${data.media.note ?? ""} ${data.media.assets != null ? `Assets stored: ${data.media.assets}.` : ""}`}
          required={data.media.required}
        />

        <IntegrationCard
          title="Documents (R2 docs bucket)"
          icon={<FileSpreadsheet className="h-4 w-4 text-indigo-500" />}
          status={data.documents.status}
          body={`Documents stored: ${data.documents.assets ?? 0}.`}
        />

        <IntegrationCard
          title="Event Dispatch (Inngest)"
          icon={<Zap className="h-4 w-4 text-primary" />}
          status={data.inngest.status}
          body={data.inngest.note ?? ""}
        />

        <IntegrationCard
          title="Payments"
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
          status={data.payments.status}
          body={data.payments.note ?? ""}
          required={data.payments.required}
        />

        <IntegrationCard
          title="Frappe ERP"
          icon={<Database className="h-4 w-4 text-muted-foreground" />}
          status={data.frappe.status}
          body={data.frappe.note ?? ""}
        />
      </div>
    </div>
  );
}

function IntegrationCard({
  title,
  icon,
  status,
  body,
  required,
}: {
  title: string;
  icon: React.ReactNode;
  status: IntegrationStatus["status"];
  body: string;
  required?: string[];
}) {
  return (
    <Card className="bg-card border-white/10 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">{body}</p>
        {required && required.length > 0 && status === "not_configured" && (
          <div className="flex flex-wrap gap-1.5">
            {required.map((r) => (
              <code key={r} className="rounded border border-white/10 bg-secondary/40 px-1.5 py-0.5 text-[10px] text-white">
                {r}
              </code>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
