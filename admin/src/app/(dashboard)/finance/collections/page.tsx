"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Landmark,
  Calendar,
  AlertTriangle,
  MessageSquare,
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { roleCan } from "@/lib/utils/permissions";
import { toast } from "@/components/ui/use-toast";

interface CollectionRemark {
  text: string;
  authorName: string | null;
  at: string;
}

interface CollectionRow {
  admissionId: string;
  applicationNo: string;
  leadId: string;
  studentId: string | null;
  studentCode: string | null;
  studentName: string;
  phone: string;
  courseName: string | null;
  installmentKey: string;
  installmentName: string;
  amount: number;
  paid: number;
  pending: number;
  dueDate: string;
  daysOverdue: number;
  agingBucket: string | null;
  counselorName: string | null;
  collectionStatus: string;
  latestRemark: CollectionRemark | null;
}

interface CollectionsData {
  dueThisMonth: CollectionRow[];
  overdue: CollectionRow[];
  totals: {
    outstanding: number;
    dueThisMonth: number;
    overdue: number;
    activeAccounts: number;
  };
}

function money(v: number | null | undefined): string {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "₹0";
}

function formatDay(v: string | null | undefined): string {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : formatDate(v);
}

function statusBadge(status: string) {
  switch (status) {
    case "OVERDUE":
      return "bg-rose-500/15 text-rose-400 border-rose-500/30";
    case "PENDING":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "PAID":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    default:
      return "bg-slate-500/15 text-slate-400 border-slate-500/30";
  }
}

function agingBadge(bucket: string | null) {
  if (!bucket) return null;
  const tone =
    bucket === "1-7 days"
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : bucket === "8-30 days"
        ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
        : bucket === "31-60 days"
          ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
          : "bg-red-700/20 text-red-400 border-red-700/40";
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", tone)}>
      {bucket}
    </span>
  );
}

function WhatsAppLink({ name, phone, message }: { name: string; phone: string; message: string }) {
  const clean = phone.replace(/[^0-9]/g, "");
  if (!clean) return null;
  const waNumber = clean.startsWith("91") ? clean : `91${clean.replace(/^0+/, "")}`;
  return (
    <a
      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-7 items-center px-2 text-[10px] font-bold rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
    >
      WhatsApp
    </a>
  );
}

export default function FinanceCollectionsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const canRead = roleCan(session?.user?.role, "read", "payments");
  const canWrite = roleCan(session?.user?.role, "write", "leads");

  const [search, setSearch] = React.useState("");
  const [agingFilter, setAgingFilter] = React.useState("all");
  const [counselorFilter, setCounselorFilter] = React.useState("all");

  const [remarkOpen, setRemarkOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<CollectionRow | null>(null);
  const [remarkText, setRemarkText] = React.useState("");
  const [remarkOutcome, setRemarkOutcome] = React.useState("");
  const [remarkNextAction, setRemarkNextAction] = React.useState("");
  const [remarkIdemKey, setRemarkIdemKey] = React.useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["finance-collections"],
    queryFn: () => apiFetch<CollectionsData>("/finance/collections"),
    enabled: canRead,
  });

  const addRemarkMutation = useMutation({
    mutationFn: async () => {
      if (!selected || !remarkText.trim()) return;
      return apiFetch<{ id: string; replayed: boolean }>("/finance/collections/remarks", {
        method: "POST",
        body: JSON.stringify({
          admissionId: selected.admissionId,
          installmentKey: selected.installmentKey,
          installmentName: selected.installmentName,
          remark: remarkText.trim(),
          outcome: remarkOutcome.trim() || undefined,
          nextAction: remarkNextAction.trim() || undefined,
          idempotencyKey: remarkIdemKey || `crm-remark-${selected.admissionId}-${selected.installmentKey}-${Date.now()}`,
        }),
      });
    },
    onSuccess: () => {
      toast({ title: "Remark Saved", description: "Collection remark logged to the candidate's unified timeline." });
      setRemarkOpen(false);
      setRemarkText("");
      setRemarkOutcome("");
      setRemarkNextAction("");
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ["finance-collections"] });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save remark", description: err.message, variant: "destructive" });
    },
  });

  const openRemark = React.useCallback((r: CollectionRow) => {
    setSelected(r);
    setRemarkText("");
    setRemarkOutcome("");
    setRemarkNextAction("");
    setRemarkIdemKey(
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${r.admissionId}-${r.installmentKey}-${Date.now()}`,
    );
    setRemarkOpen(true);
  }, []);

  const dueThisMonth = React.useMemo(() => data?.dueThisMonth ?? [], [data]);
  const overdue = React.useMemo(() => data?.overdue ?? [], [data]);

  const filterRows = React.useCallback(
    (rows: CollectionRow[]) => {
      const q = search.trim().toLowerCase();
      return rows.filter((r) => {
        const hay = `${r.studentName} ${r.studentCode ?? ""} ${r.phone} ${r.applicationNo} ${r.courseName ?? ""} ${r.installmentName} ${r.counselorName ?? ""}`.toLowerCase();
        if (q && !hay.includes(q)) return false;
        if (agingFilter !== "all" && r.agingBucket !== agingFilter) return false;
        if (counselorFilter !== "all" && (r.counselorName ?? "Unassigned") !== counselorFilter) return false;
        return true;
      });
    },
    [search, agingFilter, counselorFilter],
  );

  const filteredDue = React.useMemo(() => filterRows(dueThisMonth), [dueThisMonth, filterRows]);
  const filteredOverdue = React.useMemo(() => filterRows(overdue), [overdue, filterRows]);

  const counselors = React.useMemo(
    () => [...new Set([...dueThisMonth, ...overdue].map((r) => r.counselorName ?? "Unassigned"))].sort(),
    [dueThisMonth, overdue],
  );

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-base font-bold text-white">Access Restricted</h2>
        <p className="text-xs text-muted-foreground max-w-sm">
          Your role does not have permission to view the finance collections hub. Contact an administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-12">
      <PageHeader
        title="Fee Collections & Receivables"
        description="Monitor installment dues for the active month and chase overdue receivables by aging."
        action={
          <Button size="sm" asChild className="bg-primary hover:bg-primary/90 text-white font-bold text-xs">
            <Link href="/payments">
              <DollarSign className="h-4 w-4 mr-1.5" /> Payments Ledger
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-white/10 bg-slate-900/60 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Total Outstanding</p>
              <p className="text-2xl font-bold text-white mt-1">{money(data?.totals.outstanding)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{data?.totals.activeAccounts ?? 0} active fee account(s)</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Landmark className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-slate-900/60 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-400 font-semibold uppercase">Due This Month</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{money(data?.totals.dueThisMonth)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{filteredDue.length} installment(s)</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-slate-900/60 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-400 font-semibold uppercase">Overdue Collections</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">{money(data?.totals.overdue)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{filteredOverdue.length} overdue installment(s)</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 bg-slate-900/60 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-400 font-semibold uppercase">Recovery Status</p>
              <p className="text-2xl font-bold text-white mt-1">
                {data && data.totals.outstanding > 0
                  ? `${Math.round(((data.totals.outstanding - data.totals.overdue) / data.totals.outstanding) * 100)}%`
                  : "100%"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Current cycle on-track</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-rose-400" />
          <h3 className="text-base font-bold text-white">Failed to Load Collections</h3>
          <p className="text-xs text-muted-foreground font-mono">{error?.message || "Internal server error"}</p>
          <Button onClick={() => refetch()} variant="outline" className="border-white/10 text-xs font-bold hover:bg-white/5">
            Retry Loading
          </Button>
        </div>
      )}

      {!isError && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative max-w-sm flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, phone, application, installment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/40 border-white/10 text-xs font-semibold text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={agingFilter} onValueChange={setAgingFilter}>
                <SelectTrigger className="h-8 w-40 bg-secondary/40 border-white/10 text-xs">
                  <SelectValue placeholder="Aging" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-white/10 text-xs">
                  <SelectItem value="all">All aging</SelectItem>
                  <SelectItem value="1-7 days">1-7 days</SelectItem>
                  <SelectItem value="8-30 days">8-30 days</SelectItem>
                  <SelectItem value="31-60 days">31-60 days</SelectItem>
                  <SelectItem value="60+ days">60+ days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={counselorFilter} onValueChange={setCounselorFilter}>
                <SelectTrigger className="h-8 w-44 bg-secondary/40 border-white/10 text-xs">
                  <SelectValue placeholder="Counselor" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-white/10 text-xs">
                  <SelectItem value="all">All counselors</SelectItem>
                  {counselors.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table 1: Fees Due This Month */}
          <Section
            title="Fees Due This Month"
            subtitle="Installments due during the current calendar month (IST)."
            count={filteredDue.length}
            total={filteredDue.reduce((s, r) => s + r.pending, 0)}
            accent="amber"
            loading={isLoading}
            empty="No candidate fees due in the current month."
            rows={filteredDue}
            headers={["Student / Candidate", "Program", "Installment", "Due Date", "Total", "Paid", "Pending", "Status", "Counselor", "Actions"]}
            renderRow={(r) => (
              <>
                <StudentCell row={r} />
                <td className="p-3 text-slate-300 font-semibold">{r.courseName ?? "—"}</td>
                <td className="p-3 text-white font-semibold">{r.installmentName}</td>
                <td className="p-3 text-muted-foreground whitespace-nowrap">{formatDay(r.dueDate)}</td>
                <td className="p-3 font-mono">{money(r.amount)}</td>
                <td className="p-3 font-mono text-emerald-400">{money(r.paid)}</td>
                <td className="p-3 font-mono font-bold text-amber-400">{money(r.pending)}</td>
                <td className="p-3"><span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", statusBadge(r.collectionStatus))}>{r.collectionStatus}</span></td>
                <td className="p-3 text-muted-foreground">{r.counselorName ?? "—"}</td>
                <td className="p-3 text-right">
                  <RowActions row={r} canWrite={canWrite} onRemark={() => openRemark(r)} />
                </td>
              </>
            )}
          />

          {/* Table 2: Overdue Fees */}
          <Section
            title="Overdue Fees"
            subtitle="Installments whose due date has passed with an outstanding balance."
            count={filteredOverdue.length}
            total={filteredOverdue.reduce((s, r) => s + r.pending, 0)}
            accent="rose"
            loading={isLoading}
            empty="No overdue fee balances recorded. Excellent recovery!"
            rows={filteredOverdue}
            headers={["Student / Candidate", "Program", "Installment", "Due Date", "Amount", "Paid", "Outstanding", "Days Overdue", "Aging", "Counselor", "Latest Remark", "Actions"]}
            renderRow={(r) => (
              <>
                <StudentCell row={r} />
                <td className="p-3 text-slate-300 font-semibold">{r.courseName ?? "—"}</td>
                <td className="p-3 text-white font-semibold">{r.installmentName}</td>
                <td className="p-3 text-muted-foreground whitespace-nowrap">{formatDay(r.dueDate)}</td>
                <td className="p-3 font-mono">{money(r.amount)}</td>
                <td className="p-3 font-mono text-emerald-400">{money(r.paid)}</td>
                <td className="p-3 font-mono font-bold text-rose-400">{money(r.pending)}</td>
                <td className="p-3 font-mono text-rose-400">{r.daysOverdue}</td>
                <td className="p-3">{agingBadge(r.agingBucket)}</td>
                <td className="p-3 text-muted-foreground">{r.counselorName ?? "—"}</td>
                <td className="p-3 max-w-[220px]">
                  {r.latestRemark ? (
                    <div className="text-[11px]">
                      <p className="text-slate-200 line-clamp-2">{r.latestRemark.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {r.latestRemark.authorName ?? "System"} · {formatDateTime(r.latestRemark.at)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <RowActions row={r} canWrite={canWrite} onRemark={() => openRemark(r)} />
                </td>
              </>
            )}
          />
        </>
      )}

      {/* Add Collection Remark Dialog */}
      <Dialog open={remarkOpen} onOpenChange={setRemarkOpen}>
        <DialogContent className="glass-panel border-white/10 bg-slate-900/95 max-w-md text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Add Collection Remark
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              Candidate: <span className="font-bold text-white">{selected?.studentName}</span>
              {selected?.studentCode ? ` (${selected.studentCode})` : ""} · {selected?.applicationNo}
            </p>
            {selected?.installmentName ? (
              <p className="text-xs text-muted-foreground">
                Installment: <span className="font-bold text-white">{selected.installmentName}</span>
              </p>
            ) : null}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">Remark *</Label>
              <Textarea
                rows={3}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="e.g. Spoke to father, committed to transfer ₹50,000 on Friday via NEFT..."
                className="bg-secondary/40 border-white/10 text-xs font-medium"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">Outcome (optional)</Label>
              <Input value={remarkOutcome} onChange={(e) => setRemarkOutcome(e.target.value)} placeholder="e.g. Promise to pay" className="bg-secondary/40 border-white/10 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground font-semibold">Next action (optional)</Label>
              <Input value={remarkNextAction} onChange={(e) => setRemarkNextAction(e.target.value)} placeholder="e.g. Follow up on Friday" className="bg-secondary/40 border-white/10 text-xs" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              This note attaches to the candidate&apos;s unified timeline and preserves the original author and timestamp.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setRemarkOpen(false)} className="text-xs font-bold">
              Cancel
            </Button>
            <Button
              disabled={addRemarkMutation.isPending || !remarkText.trim()}
              onClick={() => addRemarkMutation.mutate()}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-bold"
            >
              {addRemarkMutation.isPending ? "Saving..." : "Save Remark to Timeline"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StudentCell({ row }: { row: CollectionRow }) {
  return (
    <td className="p-3">
      <Link
        href={row.studentId ? `/students/${row.studentId}` : `/leads/${row.leadId}`}
        className="font-bold text-white hover:text-primary transition-colors"
      >
        {row.studentName}
      </Link>
      {row.studentCode ? (
        <p className="text-[10px] font-mono text-muted-foreground">{row.studentCode}</p>
      ) : null}
      <p className="text-[11px] text-muted-foreground">{row.phone}</p>
    </td>
  );
}

function RowActions({ row, canWrite, onRemark }: { row: CollectionRow; canWrite: boolean; onRemark: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2">
      {canWrite && (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] font-bold border-white/10 hover:bg-white/5"
          onClick={onRemark}
        >
          <MessageSquare className="h-3 w-3 mr-1" /> Remark
        </Button>
      )}
      <WhatsAppLink
        name={row.studentName}
        phone={row.phone}
        message={`Dear ${row.studentName}, this is a reminder from Airborne Aviation Academy regarding your installment "${row.installmentName}" (${money(row.pending)} pending) for Application ${row.applicationNo}.`}
      />
      <Button size="sm" className="h-7 text-[10px] font-bold bg-primary hover:bg-primary/90 text-white" asChild>
        <Link href={`/admissions?id=${row.admissionId}`}>Pay</Link>
      </Button>
    </div>
  );
}

function Section(props: {
  title: string;
  subtitle: string;
  count: number;
  total: number;
  accent: "amber" | "rose";
  loading: boolean;
  empty: string;
  rows: CollectionRow[];
  headers: string[];
  renderRow: (row: CollectionRow) => React.ReactNode;
}) {
  const { title, subtitle, count, total, accent, loading, empty, rows, headers } = props;
  const dot = accent === "amber" ? "bg-amber-400" : "bg-rose-400 animate-pulse";
  const totalColor = accent === "amber" ? "text-amber-400" : "text-rose-400";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", dot)} />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", accent === "amber" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20")}>
            {count}
          </span>
        </div>
        <span className={cn("text-xs font-bold font-mono", totalColor)}>Total: {money(total)}</span>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-2">{subtitle}</p>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-900/60 shadow-xl">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-900/90 text-[10px] uppercase font-bold text-muted-foreground border-b border-white/10">
            <tr>
              {headers.map((h) => (
                <th key={h} className="p-3 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={headers.length} className="p-8 text-center text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 animate-spin" /> Loading collections...</span>
                </td>
              </tr>
            ) : count === 0 ? (
              <tr>
                <td colSpan={headers.length} className="p-8 text-center text-muted-foreground">{empty}</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={`${r.admissionId}:${r.installmentKey}`} className="hover:bg-white/5 transition-colors">
                  {props.renderRow(r)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
