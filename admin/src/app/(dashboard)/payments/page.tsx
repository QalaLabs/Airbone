"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Wallet, Search, RotateCcw, ChevronLeft, ChevronRight, Banknote, Undo2, Landmark } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { apiFetch } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "FAILED", "PARTIALLY_REFUNDED", "REFUNDED"];
const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"];
const FEE_TYPES = ["tuition", "admission", "exam", "uniform", "other"];

interface LedgerPayment {
  id: string;
  amount: number | string;
  currency?: string;
  method: string;
  status: string;
  receiptNo?: string | null;
  feeType?: string | null;
  referenceNo?: string | null;
  refundedAmount?: number | string | null;
  refundedAt?: string | null;
  refundedBy?: string | null;
  refunder?: { id: string; name: string } | null;
  paidAt?: string | null;
  createdAt: string;
  admission?: { id: string; applicationNo: string; stage: string } | null;
  student?: { id: string; studentCode: string; firstName: string; lastName: string } | null;
}

function money(v: number | string | null | undefined) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : "-";
}

function statusClass(status: string) {
  if (status === "COMPLETED") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (status === "PENDING") return "bg-amber-500/20 text-amber-400 border-amber-500/30";
  if (status === "FAILED") return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  if (status === "PARTIALLY_REFUNDED") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  if (status === "REFUNDED") return "bg-sky-500/20 text-sky-400 border-sky-500/30";
  return "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

export default function PaymentsLedgerPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [method, setMethod] = React.useState("");
  const [feeType, setFeeType] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => setPage(1), [debouncedSearch, status, method, feeType, dateFrom, dateTo]);

  const params = new URLSearchParams();
  if (debouncedSearch) params.set("search", debouncedSearch);
  if (status) params.set("status", status);
  if (method) params.set("method", method);
  if (feeType) params.set("feeType", feeType);
  if (dateFrom) params.set("dateFrom", new Date(`${dateFrom}T00:00:00`).toISOString());
  if (dateTo) params.set("dateTo", new Date(`${dateTo}T23:59:59`).toISOString());
  params.set("page", String(page));
  params.set("limit", "20");
  params.set("sortBy", "createdAt");
  params.set("sortDir", sortDir);

  const { data: payments, isLoading, isError, error } = useQuery({
    queryKey: ["payments", params.toString()],
    queryFn: () => apiFetch<LedgerPayment[]>(`/payments?${params.toString()}`),
  });

  const netTotal = (payments ?? []).reduce(
    (s, p) => s + Math.max(0, Number(p.amount ?? 0) - Number(p.refundedAmount ?? 0)),
    0,
  );
  const grossTotal = (payments ?? []).reduce((s, p) => s + Number(p.amount ?? 0), 0);

  const refundPayment = async (paymentId: string, refundAmount: number) => {
    try {
      await apiFetch(`/payments/${paymentId}/refunds`, {
        method: "POST",
        body: JSON.stringify({ amount: refundAmount, notes: "Refunded from payments ledger" }),
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      toast({ title: "Refund recorded" });
    } catch (err) {
      toast({
        title: "Refund failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setMethod("");
    setFeeType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Payments Ledger"
        description="All fee receipts, refunds, and payment statuses across admissions."
        action={
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">Page gross</span>
            <span className="font-bold text-white">{money(grossTotal)}</span>
            <span className="text-muted-foreground">Net</span>
            <span className="font-bold text-emerald-400">{money(netTotal)}</span>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 rounded-xl border border-white/10 bg-secondary/30">
        <div className="col-span-2 space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Search</Label>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Receipt, ref, application, student"
              className="h-8 pl-8 text-xs bg-secondary/40 border-white/10"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Status</Label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex h-8 w-full rounded-lg border border-white/10 bg-secondary/60 px-2 text-xs font-bold">
            <option value="">All</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Method</Label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="flex h-8 w-full rounded-lg border border-white/10 bg-secondary/60 px-2 text-xs font-bold">
            <option value="">All</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Fee type</Label>
          <select value={feeType} onChange={(e) => setFeeType(e.target.value)} className="flex h-8 w-full rounded-lg border border-white/10 bg-secondary/60 px-2 text-xs font-bold">
            <option value="">All</option>
            {FEE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 flex items-end gap-2">
          <div className="space-y-1 flex-1">
            <Label className="text-[10px] font-bold text-muted-foreground">From</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-xs bg-secondary/40 border-white/10" />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-[10px] font-bold text-muted-foreground">To</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-xs bg-secondary/40 border-white/10" />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs border-white/10" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2">
        <StatCard icon={Landmark} label="Page gross" value={money(grossTotal)} />
        <StatCard icon={Wallet} label="Page net" value={money(netTotal)} accent />
        <StatCard icon={Banknote} label="Receipts" value={String(payments?.length ?? 0)} />
        <StatCard
          icon={RotateCcw}
          label="Refunded"
          value={money((payments ?? []).reduce((s, p) => s + Number(p.refundedAmount ?? 0), 0))}
        />
        <StatCard
          icon={Undo2}
          label="Page sorted"
          value={sortDir === "desc" ? "Newest first" : "Oldest first"}
          clickable
          onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <div className="p-8 text-center text-sm text-rose-400">
          {error instanceof Error ? error.message : "Failed to load payments"}
        </div>
      ) : !payments?.length ? (
        <div className="p-8 text-center text-sm text-muted-foreground">No receipts match the current filters.</div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-slate-900/60 overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-white/10 text-muted-foreground">
                <th className="text-left font-bold px-4 py-3">Receipt</th>
                <th className="text-left font-bold px-4 py-3">Paid at</th>
                <th className="text-left font-bold px-4 py-3">Student / Application</th>
                <th className="text-left font-bold px-4 py-3">Method</th>
                <th className="text-left font-bold px-4 py-3">Fee type</th>
                <th className="text-right font-bold px-4 py-3">Amount</th>
                <th className="text-right font-bold px-4 py-3">Refunded</th>
                <th className="text-center font-bold px-4 py-3">Status</th>
                <th className="text-center font-bold px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const remaining = Number(p.amount ?? 0) - Number(p.refundedAmount ?? 0);
                const refundable = remaining > 0 && (p.status === "COMPLETED" || p.status === "PARTIALLY_REFUNDED");
                const net = Math.max(0, remaining);
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-mono font-bold text-white">{p.receiptNo ?? "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">
                        {p.student
                          ? `${p.student.firstName} ${p.student.lastName}${p.student.studentCode ? ` (${p.student.studentCode})` : ""}`
                          : (p.admission?.applicationNo ?? "-")}
                      </p>
                      {p.admission?.applicationNo && p.student && (
                        <p className="text-[10px] text-muted-foreground">{p.admission.applicationNo}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{p.method}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.feeType ?? "-"}</td>
                    <td className={cn("px-4 py-3 text-right font-bold", p.status === "REFUNDED" ? "text-muted-foreground line-through" : "text-emerald-400")}>
                      {money(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Number(p.refundedAmount ?? 0) > 0 ? (
                        <span className="font-bold text-sky-400">
                          {money(p.refundedAmount)}
                          {p.refunder?.name ? <span className="block text-[9px] text-muted-foreground font-normal">by {p.refunder.name}</span> : null}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-block rounded-full border px-2 py-0.5 font-bold", statusClass(p.status))}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {refundable ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[10px] text-sky-400 hover:text-sky-300 gap-1"
                          onClick={() => {
                            const amt = window.prompt(`Refund amount (max ₹${remaining.toLocaleString("en-IN")}) for ${p.receiptNo ?? p.id}:`, String(remaining));
                            if (!amt) return;
                            const n = Number(amt);
                            if (!Number.isFinite(n) || n <= 0 || n > remaining) {
                              toast({ title: "Invalid refund amount", variant: "destructive" });
                              return;
                            }
                            void refundPayment(p.id, n);
                          }}
                        >
                          <RotateCcw className="h-3 w-3" /> Refund
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Page {page} · {payments?.length ?? 0} shown (net of refunds: {money(netTotal)})</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-white/10" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-white/10" onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  clickable,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3",
        accent ? "border-primary/30 bg-primary/10" : "border-white/5 bg-secondary/30",
        clickable && "cursor-pointer hover:border-white/20",
      )}
    >
      <Icon className={cn("h-4 w-4", accent ? "text-primary" : "text-muted-foreground")} />
      <div className="min-w-0">
        <p className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-white truncate">{value}</p>
      </div>
    </div>
  );
}