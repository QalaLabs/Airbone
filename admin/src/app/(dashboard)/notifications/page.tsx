"use client";

import { PageHeader } from "@/components/shared/page-header";
import { MessageSquare, AlertTriangle } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="WhatsApp & Email Notifications"
        description="Automated communication templates and delivery tracking."
      />
      <div className="glass-card rounded-2xl p-10 border border-white/10 flex flex-col items-center justify-center text-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-white">Not Connected</h3>
        <p className="text-xs text-muted-foreground max-w-md">
          This module requires a Meta WhatsApp Business API and email delivery (SMTP/SendGrid) integration,
          which has not been configured yet. No templates, delivery logs, or broadcast actions are available
          until those integrations are wired up.
        </p>
        <MessageSquare className="h-4 w-4 text-muted-foreground mt-2" />
      </div>
    </div>
  );
}
