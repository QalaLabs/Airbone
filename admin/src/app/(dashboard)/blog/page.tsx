"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Megaphone } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Blog & Academic Resources" 
        description="Write and publish expert aviation articles, high-ranking DGCA exam study guides, and official press releases." 
      />

      <div className="glass-card rounded-2xl p-8 border border-white/10 text-center py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mx-auto shadow-xl">
          <Megaphone className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-md mx-auto mt-6">
          <h3 className="text-lg font-bold text-white tracking-tight">Blog CMS Not Connected</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The blog database schema and articles repository are currently not configured in this admin build. Press releases and exam study resources are maintained directly via the main website configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
