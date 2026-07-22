"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Mail, Phone, ExternalLink, Trash2, UserCheck, Upload, Download } from "lucide-react";
import { getLeads, createLead, updateLead, deleteLead, assignLeadOwner } from "@/lib/crm/leads";
import { Lead } from "@/lib/crm/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { CRMDataTable, CRMColumn } from "@/components/shared/crm-data-table";
import { toast } from "@/components/ui/use-toast";

const statusColor: Record<string, string> = {
  Hot: "bg-red-500",
  Warm: "bg-amber-500",
  Cold: "bg-blue-500",
};

const sourceColor: Record<string, string> = {
  LinkedIn: "bg-blue-600",
  Website: "bg-emerald-500",
  Referral: "bg-purple-500",
  "Google Ads": "bg-amber-500",
  "Trade Show": "bg-orange-500",
  "Cold Email": "bg-gray-500",
};

const SOURCES = ["Website", "LinkedIn", "Referral", "Google Ads", "Trade Show", "Cold Email", "Manual", "CSV Import"];
const STATUSES = ["Hot", "Warm", "Cold"];

const emptyForm = { lead_name: "", company_name: "", email_id: "", mobile_no: "", source: "Website", status: "Warm" };

function leadsToCsv(leads: Lead[]): string {
  const headers = ["name", "lead_name", "company_name", "email_id", "mobile_no", "source", "status", "lead_owner", "ai_score", "creation"];
  const rows = leads.map((l) =>
    headers
      .map((h) => {
        const val = (l as unknown as Record<string, unknown>)[h];
        const s = val == null ? "" : String(val);
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function parseCsv(text: string): Partial<Lead>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = (lines[0] ?? "").split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      if (cells[i] !== undefined) row[h] = cells[i];
    });
    return row as Partial<Lead>;
  });
}

export default function CRMLeadsPage() {
  const queryClient = useQueryClient();
  const [addOpen, setAddOpen] = React.useState(false);
  const [editLead, setEditLead] = React.useState<Lead | null>(null);
  const [assignLead, setAssignLead] = React.useState<Lead | null>(null);
  const [assignValue, setAssignValue] = React.useState("");
  const [deleteTarget, setDeleteTarget] = React.useState<Lead | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ["crm-leads"],
    queryFn: () => getLeads(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["crm-leads"] });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Lead>) => createLead(data),
    onSuccess: () => {
      invalidate();
      toast({ title: "Lead created", description: "New lead added to CRM." });
      setAddOpen(false);
      setForm(emptyForm);
    },
    onError: (e: unknown) => toast({ title: "Error creating lead", description: e instanceof Error ? e.message : String(e), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) => updateLead(id, data),
    onSuccess: () => {
      invalidate();
      toast({ title: "Lead updated" });
      setEditLead(null);
    },
    onError: (e: unknown) => toast({ title: "Error updating lead", description: e instanceof Error ? e.message : String(e), variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      invalidate();
      toast({ title: "Lead deleted" });
      setDeleteTarget(null);
    },
    onError: (e: unknown) => toast({ title: "Error deleting lead", description: e instanceof Error ? e.message : String(e), variant: "destructive" }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, owner }: { id: string; owner: string }) => assignLeadOwner(id, owner),
    onSuccess: () => {
      invalidate();
      toast({ title: "Lead assigned" });
      setAssignLead(null);
      setAssignValue("");
    },
    onError: (e: unknown) => toast({ title: "Error assigning lead", description: e instanceof Error ? e.message : String(e), variant: "destructive" }),
  });

  const importMutation = useMutation({
    mutationFn: async (rows: Partial<Lead>[]) => {
      let ok = 0;
      let failed = 0;
      for (const row of rows) {
        try {
          await createLead(row);
          ok++;
        } catch {
          failed++;
        }
      }
      return { ok, failed };
    },
    onSuccess: ({ ok, failed }) => {
      invalidate();
      toast({
        title: "CSV import complete",
        description: `${ok} lead(s) imported${failed > 0 ? `, ${failed} failed` : ""}.`,
        variant: failed > 0 ? "destructive" : undefined,
      });
    },
    onError: (e: unknown) => toast({ title: "Import failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" }),
  });

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result));
      if (rows.length === 0) {
        toast({ title: "Nothing to import", description: "CSV has no data rows.", variant: "destructive" });
        return;
      }
      importMutation.mutate(rows);
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const csv = leadsToCsv(leads);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Lead Management</h1>
            <p className="text-sm text-muted-foreground">BANT scoring and lead qualification</p>
          </div>
        </div>
        <div className="p-6 text-white text-xs">Loading leads directory...</div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 font-bold">Error loading leads: {error instanceof Error ? error.message : String(error)}</div>;
  }

  const avgScore =
    leads.length > 0
      ? (leads.reduce((sum, l) => sum + (l.ai_score || 50), 0) / leads.length).toFixed(1)
      : "0";

  const columns: CRMColumn<Lead>[] = [
    {
      key: "lead_name",
      header: "Lead",
      render: (lead: Lead) => (
        <button
          type="button"
          onClick={() => setEditLead(lead)}
          className="text-left hover:underline"
        >
          <p className="font-semibold text-white">{lead.lead_name || lead.name}</p>
          {lead.email_id && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">{lead.email_id}</span>
            </div>
          )}
        </button>
      ),
    },
    {
      key: "company_name",
      header: "Company",
      render: (lead: Lead) => lead.company_name || "N/A",
    },
    {
      key: "source",
      header: "Source",
      render: (lead: Lead) => (
        <Badge
          variant="outline"
          className={`${
            sourceColor[lead.source || "Website"] || "bg-gray-500"
          } text-white border-none text-[9px] px-2 py-0.5 rounded-full`}
        >
          {lead.source || "Website"}
        </Badge>
      ),
    },
    {
      key: "ai_score",
      header: "Score",
      render: (lead: Lead) => {
        const score = lead.ai_score || 50;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-12 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground">{score}</span>
          </div>
        );
      },
    },
    {
      key: "bant",
      header: "BANT Scoring",
      render: (lead: Lead) => {
        const bant = lead.bant || { budget: false, authority: false, need: false, timeline: false };
        return (
          <div className="flex gap-1">
            {Object.entries(bant).map(([key, val]) => (
              <div
                key={key}
                className={`h-5 w-5 rounded text-[9px] font-bold flex items-center justify-center ${
                  val ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"
                }`}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
              >
                {key.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (lead: Lead) => (
        <Badge
          variant="outline"
          className={`${
            statusColor[lead.status || "Cold"] || "bg-gray-500"
          } text-white border-none text-[9px] px-2 py-0.5 rounded-full`}
        >
          {lead.status || "Cold"}
        </Badge>
      ),
    },
    {
      key: "lead_owner",
      header: "Owner",
      render: (lead: Lead) => lead.lead_owner || "Unassigned",
    },
    {
      key: "creation",
      header: "Last Activity",
      render: (lead: Lead) =>
        lead.creation
          ? new Date(lead.creation).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "N/A",
    },
    {
      key: "actions",
      header: "Actions",
      render: (lead: Lead) => (
        <div className="flex gap-1">
          {lead.email_id && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" asChild>
              <a href={`mailto:${lead.email_id}`}>
                <Mail className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {lead.mobile_no && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" asChild>
              <a href={`tel:${lead.mobile_no}`}>
                <Phone className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-white"
            title="Assign owner"
            onClick={() => {
              setAssignLead(lead);
              setAssignValue(lead.lead_owner || "");
            }}
          >
            <UserCheck className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-white"
            title="Open"
            onClick={() => setEditLead(lead)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-red-500"
            title="Delete"
            onClick={() => setDeleteTarget(lead)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Lead Management</h1>
          <p className="text-sm text-muted-foreground">BANT scoring and lead qualification</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            className="border-white/10 text-xs font-semibold h-9"
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
          >
            <Upload className="mr-2 h-3.5 w-3.5" />
            {importMutation.isPending ? "Importing..." : "Import CSV"}
          </Button>
          <Button variant="outline" className="border-white/10 text-xs font-semibold h-9" onClick={handleExport}>
            <Download className="mr-2 h-3.5 w-3.5" />
            Export
          </Button>
          <Button className="text-xs font-semibold h-9" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Total Leads</p>
            <p className="text-2xl font-bold text-white mt-1">{leads.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Hot Leads</p>
            <p className="text-2xl font-bold text-white mt-1">
              {leads.filter((l) => l.status === "Hot").length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Conversion Rate</p>
            <p className="text-2xl font-bold text-white mt-1">
              {leads.length > 0
                ? `${((leads.filter((l) => l.status === "Converted" || l.status === "Won").length / leads.length) * 100).toFixed(1)}%`
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Avg Score</p>
            <p className="text-2xl font-bold text-white mt-1">{avgScore}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-white/10 shadow-lg">
        <CardContent className="p-4">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <TabsList className="bg-transparent gap-4">
                <TabsTrigger value="all" className="text-xs font-semibold text-muted-foreground data-[state=active]:text-white">All Leads</TabsTrigger>
                <TabsTrigger value="hot" className="text-xs font-semibold text-muted-foreground data-[state=active]:text-white">Hot</TabsTrigger>
                <TabsTrigger value="warm" className="text-xs font-semibold text-muted-foreground data-[state=active]:text-white">Warm</TabsTrigger>
                <TabsTrigger value="cold" className="text-xs font-semibold text-muted-foreground data-[state=active]:text-white">Cold</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-white/10 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                  Leads: {leads.length}
                </Badge>
              </div>
            </div>
            <TabsContent value="all" className="mt-0">
              <CRMDataTable columns={columns} data={leads} searchable={true} pageSize={10} />
            </TabsContent>
            <TabsContent value="hot" className="mt-0">
              <CRMDataTable
                columns={columns}
                data={leads.filter((l) => l.status === "Hot")}
                searchable={true}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="warm" className="mt-0">
              <CRMDataTable
                columns={columns}
                data={leads.filter((l) => l.status === "Warm")}
                searchable={true}
                pageSize={10}
              />
            </TabsContent>
            <TabsContent value="cold" className="mt-0">
              <CRMDataTable
                columns={columns}
                data={leads.filter((l) => l.status === "Cold")}
                searchable={true}
                pageSize={10}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Lead Dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setForm(emptyForm); }}>
        <DialogContent className="max-w-lg bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Add Lead</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(form);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Lead Name *</Label>
              <Input required value={form.lead_name} onChange={(e) => setForm((f) => ({ ...f, lead_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Input value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email_id} onChange={(e) => setForm((f) => ({ ...f, email_id: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.mobile_no} onChange={(e) => setForm((f) => ({ ...f, mobile_no: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Select value={form.source} onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Saving..." : "Save Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={!!editLead} onOpenChange={(open) => !open && setEditLead(null)}>
        <DialogContent className="max-w-lg bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Lead</DialogTitle>
          </DialogHeader>
          {editLead && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate({ id: editLead.name, data: editLead });
              }}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label>Lead Name *</Label>
                <Input
                  required
                  value={editLead.lead_name || ""}
                  onChange={(e) => setEditLead((l) => (l ? { ...l, lead_name: e.target.value } : l))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input
                  value={editLead.company_name || ""}
                  onChange={(e) => setEditLead((l) => (l ? { ...l, company_name: e.target.value } : l))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editLead.email_id || ""}
                    onChange={(e) => setEditLead((l) => (l ? { ...l, email_id: e.target.value } : l))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={editLead.mobile_no || ""}
                    onChange={(e) => setEditLead((l) => (l ? { ...l, mobile_no: e.target.value } : l))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Source</Label>
                  <Select
                    value={editLead.source || "Website"}
                    onValueChange={(v) => setEditLead((l) => (l ? { ...l, source: v } : l))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select
                    value={editLead.status || "Cold"}
                    onValueChange={(v) => setEditLead((l) => (l ? { ...l, status: v } : l))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Owner Dialog */}
      <Dialog open={!!assignLead} onOpenChange={(open) => !open && setAssignLead(null)}>
        <DialogContent className="max-w-sm bg-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Assign Lead Owner</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (assignLead) assignMutation.mutate({ id: assignLead.name, owner: assignValue });
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Owner (user ID / email)</Label>
              <Input required value={assignValue} onChange={(e) => setAssignValue(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={assignMutation.isPending}>
                {assignMutation.isPending ? "Assigning..." : "Assign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {deleteTarget?.lead_name || deleteTarget?.name} from the CRM. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.name)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
