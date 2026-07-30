"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  User,
  Calendar,
  ShieldCheck,
  FileSearch,
  Award,
  Landmark,
  GraduationCap,
  AlertCircle,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { apiFetch } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";


interface AdmissionListItem {
  id: string;
  applicationNo: string;
  stage: string;
  courseName?: string | null;
  lead: { id: string; name: string; email: string; phone: string };
  campus?: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface StageLog {
  id: string;
  fromStage?: string | null;
  toStage: string;
  notes?: string | null;
  changedAt: string;
  actor?: { id: string; name: string } | null;
}

interface AdmissionDocument {
  id: string;
  documentType: string;
  name: string;
  fileUrl: string;
  fileSizeBytes?: number | null;
  status: string;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

interface PaymentRow {
  id: string;
  amount: number | string;
  currency?: string;
  method: string;
  status: string;
  receiptNo?: string | null;
  feeType?: string | null;
  referenceNo?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

interface PaymentSummary {
  admissionId: string;
  feeAmount?: number | string | null;
  feeDiscount?: number | string | null;
  feeFinal?: number | string | null;
  feePaid?: number | string | null;
  feeBalance?: number | string | null;
  paymentCount?: number;
}

interface FeePlanOption {
  id: string;
  name: string;
  currency?: string;
  isActive?: boolean;
  items?: { id: string; name: string; amount: number | string; dueOffsetDays?: number }[];
}

interface AdmissionDetail extends AdmissionListItem {
  batchName?: string | null;
  batchStartDate?: string | null;
  counselorId?: string | null;
  counselor?: { id: string; name: string; email: string } | null;
  studentId?: string | null;
  student?: { id: string; studentCode: string; firstName: string; lastName: string } | null;
  feePlanId?: string | null;
  feePlan?: FeePlanOption | null;
  feeAmount?: number | string | null;
  feePaid?: number | string | null;
  feeBalance?: number | string | null;
  feeFinal?: number | string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  stageLogs?: StageLog[];
  documents?: AdmissionDocument[];
  payments?: PaymentRow[];
}

interface LmsBatch {
  id: string;
  name: string;
  type?: string;
  course?: { title: string };
}

interface CounselorOption {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER", "CARD", "ONLINE"] as const;
const FEE_TYPES = ["registration", "tuition", "exam", "hostel", "other"] as const;

const STAGES = [
  { key: "ENQUIRY", label: "Enquiry", color: "border-slate-500/50 text-slate-400", bg: "bg-slate-500/10", icon: User },
  { key: "DOCUMENT_COLLECTION", label: "Document Collection", color: "border-blue-500/50 text-blue-400", bg: "bg-blue-500/10", icon: FileSearch },
  { key: "VERIFICATION", label: "Verification", color: "border-amber-500/50 text-amber-400", bg: "bg-amber-500/10", icon: ShieldCheck },
  { key: "OFFER_LETTER", label: "Offer Letter", color: "border-purple-500/50 text-purple-400", bg: "bg-purple-500/10", icon: Award },
  { key: "FEE_PAYMENT", label: "Fee Payment", color: "border-emerald-500/50 text-emerald-400", bg: "bg-emerald-500/10", icon: Landmark },
  { key: "ENROLLED", label: "Enrolled", color: "border-teal-500/50 text-teal-400", bg: "bg-teal-500/10", icon: GraduationCap },
  { key: "DROPPED", label: "Dropped", color: "border-rose-500/50 text-rose-400", bg: "bg-rose-500/10", icon: AlertCircle },
  { key: "CANCELLED", label: "Cancelled", color: "border-red-500/50 text-red-400", bg: "bg-red-500/10", icon: AlertCircle },
];

function money(v: number | string | null | undefined) {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : "-";
}

function docStatusClass(status: string) {
  if (status === "APPROVED") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (status === "REJECTED") return "bg-rose-500/20 text-rose-400 border-rose-500/30";
  return "bg-amber-500/20 text-amber-400 border-amber-500/30";
}

function toIsoDate(dateStr: string) {
  if (!dateStr) return undefined;
  return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
}

function fromIsoDate(iso?: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}


function AdmissionCard({
  admission,
  onClick,
  isDragging,
}: {
  admission: AdmissionListItem;
  onClick: () => void;
  isDragging?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-white/10 bg-slate-900/90 p-4 cursor-pointer hover:border-primary/50 transition-all group shadow-md hover:shadow-primary/5",
        isDragging && "opacity-50 shadow-2xl scale-105",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{admission.lead.name}</p>
          <p className="text-xs font-mono font-semibold text-primary truncate mt-0.5">{admission.applicationNo}</p>
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5" />
      </div>
      {admission.courseName && (
        <p className="text-xs font-semibold text-muted-foreground mb-3 truncate bg-secondary/50 px-2 py-1 rounded border border-white/5">
          {admission.courseName}
        </p>
      )}
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-primary" />
          <span>{formatDate(admission.createdAt)}</span>
        </div>
        <span className="text-[10px] font-bold text-white bg-white/5 px-2 py-0.5 rounded">Review →</span>
      </div>
    </div>
  );
}

function SortableAdmissionCard({ admission, onClick }: { admission: AdmissionListItem; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: admission.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
      <AdmissionCard admission={admission} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

function StageColumn({
  stage,
  admissions,
  onCardClick,
}: {
  stage: (typeof STAGES)[number];
  admissions: AdmissionListItem[];
  onCardClick: (admission: AdmissionListItem) => void;
}) {
  const { setNodeRef } = useSortable({ id: stage.key });
  const Icon = stage.icon;
  return (
    <div className="flex flex-col min-w-[320px] max-w-[320px]">
      <div className={cn("flex items-center justify-between rounded-t-2xl border-t-2 bg-slate-900/80 px-4 py-3 border-x border-white/10 backdrop-blur-md", stage.color)}>
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${stage.bg}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide uppercase">{stage.label}</span>
        </div>
        <span className="text-xs font-extrabold bg-white/10 px-2.5 py-0.5 rounded-full text-white">{admissions.length}</span>
      </div>
      <div ref={setNodeRef} className="flex-1 rounded-b-2xl border border-t-0 border-white/10 bg-secondary/20 p-3 space-y-3 min-h-[500px] backdrop-blur-sm">
        <SortableContext items={admissions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {admissions.map((admission) => (
            <SortableAdmissionCard key={admission.id} admission={admission} onClick={() => onCardClick(admission)} />
          ))}
        </SortableContext>
        {admissions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground border-2 border-dashed border-white/5 rounded-xl mt-2">
            <p className="text-xs font-semibold">Drop applications here</p>
            <p className="text-[10px] text-muted-foreground mt-1">Ready for {stage.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}


function DocumentsPanel({ admissionId, fallback }: { admissionId: string; fallback?: AdmissionDocument[] }) {
  const queryClient = useQueryClient();
  const { data: docs, isLoading } = useQuery({
    queryKey: ["admission", admissionId, "documents"],
    queryFn: () => apiFetch<AdmissionDocument[]>(`/admissions/${admissionId}/documents?limit=100`),
  });
  const list = docs ?? fallback ?? [];

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, rejectionReason }: { id: string; status: "APPROVED" | "REJECTED"; rejectionReason?: string }) =>
      apiFetch(`/documents/${id}`, { method: "PATCH", body: JSON.stringify({ status, rejectionReason }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admission", admissionId, "documents"] });
      queryClient.invalidateQueries({ queryKey: ["admission", admissionId] });
      toast({ title: "Document reviewed" });
    },
    onError: (err: Error) => toast({ title: "Review failed", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <FileSearch className="h-4 w-4 text-primary" />
          Documents
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Approve or reject submitted files.</p>
      </div>
      {isLoading && !fallback?.length ? (
        <Skeleton className="h-24 w-full" />
      ) : list.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center border border-dashed border-white/10 rounded-xl">No documents uploaded yet.</p>
      ) : (
        list.map((doc) => (
          <div key={doc.id} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-primary truncate">{doc.name}</span>
              <span className={cn("text-[10px] font-extrabold px-2 py-0.5 rounded-full border shrink-0", docStatusClass(doc.status))}>
                {doc.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-white/5 gap-2 flex-wrap">
              <span>{doc.documentType.replace(/_/g, " ")}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-[11px] font-bold text-primary hover:bg-white/5" asChild>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" /> Open
                  </a>
                </Button>
                {doc.status !== "APPROVED" && doc.status !== "REJECTED" && (
                  <>
                    <Button
                      size="sm"
                      className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500"
                      disabled={reviewMutation.isPending}
                      onClick={() => reviewMutation.mutate({ id: doc.id, status: "APPROVED" })}
                    >
                      <Check className="h-3 w-3 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px] font-bold border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                      disabled={reviewMutation.isPending}
                      onClick={() => {
                        const reason = window.prompt("Rejection reason (optional)") ?? undefined;
                        reviewMutation.mutate({ id: doc.id, status: "REJECTED", rejectionReason: reason || undefined });
                      }}
                    >
                      <X className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
            {doc.rejectionReason && <p className="text-[11px] text-rose-400">Reason: {doc.rejectionReason}</p>}
          </div>
        ))
      )}
    </div>
  );
}

function PaymentsPanel({ admissionId, fallback }: { admissionId: string; fallback?: PaymentRow[] }) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState<(typeof PAYMENT_METHODS)[number]>("UPI");
  const [feeType, setFeeType] = React.useState<(typeof FEE_TYPES)[number]>("tuition");
  const [referenceNo, setReferenceNo] = React.useState("");

  const { data: payments, isLoading } = useQuery({
    queryKey: ["admission", admissionId, "payments"],
    queryFn: () => apiFetch<PaymentRow[]>(`/admissions/${admissionId}/payments?limit=100`),
  });
  const { data: summary } = useQuery({
    queryKey: ["admission", admissionId, "payments-summary"],
    queryFn: () => apiFetch<PaymentSummary>(`/admissions/${admissionId}/payments?summary=true`),
  });
  const list = payments ?? fallback ?? [];

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/admissions/${admissionId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(amount),
          method,
          feeType,
          referenceNo: referenceNo || undefined,
        }),
      }),
    onSuccess: () => {
      setAmount("");
      setReferenceNo("");
      queryClient.invalidateQueries({ queryKey: ["admission", admissionId, "payments"] });
      queryClient.invalidateQueries({ queryKey: ["admission", admissionId, "payments-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admission", admissionId] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      toast({ title: "Payment recorded" });
    },
    onError: (err: Error) => toast({ title: "Payment failed", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Landmark className="h-4 w-4 text-primary" />
          Payments
        </h3>
        {summary && (
          <p className="text-xs text-muted-foreground mt-2">
            Final {money(summary.feeFinal)} · Paid {money(summary.feePaid)} · Balance {money(summary.feeBalance)}
            {summary.paymentCount != null ? ` · ${summary.paymentCount} receipt(s)` : ""}
          </p>
        )}
      </div>

      <form
        className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-white/10 bg-secondary/30"
        onSubmit={(e) => {
          e.preventDefault();
          if (!amount || Number(amount) <= 0) {
            toast({ title: "Enter a valid amount", variant: "destructive" });
            return;
          }
          createMutation.mutate();
        }}
      >
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Amount</Label>
          <Input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-8 text-xs bg-secondary/40 border-white/10" required />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Method</Label>
          <select value={method} onChange={(e) => setMethod(e.target.value as (typeof PAYMENT_METHODS)[number])} className="flex h-8 w-full rounded-lg border border-white/10 bg-secondary/60 px-2 text-xs font-bold">
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Fee type</Label>
          <select value={feeType} onChange={(e) => setFeeType(e.target.value as (typeof FEE_TYPES)[number])} className="flex h-8 w-full rounded-lg border border-white/10 bg-secondary/60 px-2 text-xs font-bold">
            {FEE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Reference</Label>
          <Input value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} className="h-8 text-xs bg-secondary/40 border-white/10" placeholder="UPI/UTR ref" />
        </div>
        <div className="col-span-2">
          <Button type="submit" size="sm" className="w-full text-xs font-bold" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Recording…" : "Record payment"}
          </Button>
        </div>
      </form>

      {isLoading && !fallback?.length ? (
        <Skeleton className="h-16 w-full" />
      ) : list.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No receipts yet.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {list.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-white/5 bg-slate-900/60">
              <div>
                <p className="font-mono font-bold text-white">{p.receiptNo ?? "-"}</p>
                <p className="text-[10px] text-muted-foreground">{p.paidAt ? formatDate(p.paidAt) : "-"} · {p.method}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-400">{money(p.amount)}</p>
                <p className="text-[10px] text-muted-foreground">{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BatchCounselorPanel({
  admission,
  onUpdated,
}: {
  admission: AdmissionDetail;
  onUpdated: () => void;
}) {
  const [batchName, setBatchName] = React.useState(admission.batchName ?? "");
  const [batchStartDate, setBatchStartDate] = React.useState(fromIsoDate(admission.batchStartDate));
  const [lmsBatchId, setLmsBatchId] = React.useState(
    typeof admission.metadata?.lmsBatchId === "string" ? admission.metadata.lmsBatchId : "",
  );
  const [counselorId, setCounselorId] = React.useState(admission.counselorId ?? "");
  const [feePlanId, setFeePlanId] = React.useState(admission.feePlanId ?? "");

  React.useEffect(() => {
    setBatchName(admission.batchName ?? "");
    setBatchStartDate(fromIsoDate(admission.batchStartDate));
    setLmsBatchId(typeof admission.metadata?.lmsBatchId === "string" ? admission.metadata.lmsBatchId : "");
    setCounselorId(admission.counselorId ?? "");
    setFeePlanId(admission.feePlanId ?? "");
  }, [admission]);

  const { data: batches } = useQuery({
    queryKey: ["lms-batches"],
    queryFn: async () => {
      try {
        return await apiFetch<LmsBatch[]>("/lms/batches");
      } catch {
        return [] as LmsBatch[];
      }
    },
  });

  const { data: feePlans } = useQuery({
    queryKey: ["fee-plans"],
    queryFn: async () => {
      try {
        return await apiFetch<FeePlanOption[]>("/fee-plans?isActive=true&limit=100");
      } catch {
        return [] as FeePlanOption[];
      }
    },
  });

  const { data: counselors } = useQuery({
    queryKey: ["users", "counselors"],
    queryFn: async () => {
      try {
        return await apiFetch<CounselorOption[]>("/users?limit=100");
      } catch {
        return [] as CounselorOption[];
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`/admissions/${admission.id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      onUpdated();
      toast({ title: "Admission updated" });
    },
    onError: (err: Error) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const saveBatch = () => {
    const selected = batches?.find((b) => b.id === lmsBatchId);
    const name = selected?.name || batchName;
    const prev = { ...(admission.metadata ?? {}) };
    if (lmsBatchId) prev.lmsBatchId = lmsBatchId;
    else delete prev.lmsBatchId;
    updateMutation.mutate({
      batchName: name || undefined,
      batchStartDate: toIsoDate(batchStartDate) ?? null,
      metadata: prev,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3">Fee plan, batch & counselor</h3>
      </div>

      {admission.student && (
        <p className="text-[11px] text-teal-400 font-semibold">
          Student linked: {admission.student.studentCode} · {admission.student.firstName} {admission.student.lastName}
        </p>
      )}

      <div className="space-y-1">
        <Label className="text-[10px] font-bold text-muted-foreground">Fee plan</Label>
        <div className="flex gap-2">
          <select
            value={feePlanId}
            onChange={(e) => setFeePlanId(e.target.value)}
            className="flex h-8 flex-1 rounded-lg border border-white/10 bg-secondary/60 px-2 text-xs font-bold"
          >
            <option value="">None</option>
            {(feePlans ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <Button
            size="sm"
            className="h-8 text-xs font-bold"
            disabled={updateMutation.isPending}
            onClick={() => updateMutation.mutate({ feePlanId: feePlanId || null })}
          >
            Apply
          </Button>
        </div>
        {admission.feePlan && (
          <p className="text-[10px] text-muted-foreground">
            Current: {admission.feePlan.name}
            {admission.feePlan.items?.length
              ? ` · ${admission.feePlan.items.length} installment(s) · Fee ${money(admission.feeFinal ?? admission.feeAmount)}`
              : ""}
          </p>
        )}
      </div>

      {batches && batches.length > 0 && (
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">LMS batch</Label>
          <select
            value={lmsBatchId}
            onChange={(e) => {
              const id = e.target.value;
              setLmsBatchId(id);
              const b = batches.find((x) => x.id === id);
              if (b) setBatchName(b.name);
            }}
            className="flex h-8 w-full rounded-lg border border-white/10 bg-secondary/60 px-2 text-xs font-bold"
          >
            <option value="">Manual / none</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}{b.course?.title ? ` · ${b.course.title}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Batch name</Label>
          <Input value={batchName} onChange={(e) => setBatchName(e.target.value)} className="h-8 text-xs bg-secondary/40 border-white/10" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-muted-foreground">Start date</Label>
          <Input type="date" value={batchStartDate} onChange={(e) => setBatchStartDate(e.target.value)} className="h-8 text-xs bg-secondary/40 border-white/10" />
        </div>
      </div>
      <Button size="sm" className="w-full text-xs font-bold" disabled={updateMutation.isPending} onClick={saveBatch}>
        Save batch allocation
      </Button>

      <div className="space-y-1 pt-2 border-t border-white/10">
        <Label className="text-[10px] font-bold text-muted-foreground">Counselor</Label>
        <div className="flex gap-2">
          <select
            value={counselorId}
            onChange={(e) => setCounselorId(e.target.value)}
            className="flex h-8 flex-1 rounded-lg border border-white/10 bg-secondary/60 px-2 text-xs font-bold"
          >
            <option value="">Unassigned</option>
            {(counselors ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <Button
            size="sm"
            className="h-8 text-xs font-bold"
            disabled={updateMutation.isPending}
            onClick={() => updateMutation.mutate({ counselorId: counselorId || null })}
          >
            Assign
          </Button>
        </div>
        {admission.counselor && (
          <p className="text-[10px] text-muted-foreground">Current: {admission.counselor.name}</p>
        )}
      </div>
    </div>
  );
}

function StageLogsPanel({ logs }: { logs: StageLog[] }) {
  if (!logs.length) {
    return <p className="text-xs text-muted-foreground text-center py-4">No stage history yet.</p>;
  }
  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {logs.map((log) => (
        <div key={log.id} className="text-[11px] p-2 rounded-lg border border-white/5 bg-slate-900/50">
          <p className="font-bold text-white">
            {log.fromStage ? `${log.fromStage.replace(/_/g, " ")} → ` : ""}
            {log.toStage.replace(/_/g, " ")}
          </p>
          <p className="text-muted-foreground">
            {formatDate(log.changedAt)}
            {log.actor?.name ? ` · ${log.actor.name}` : ""}
          </p>
          {log.notes && <p className="text-muted-foreground mt-0.5">{log.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function AdmissionDetailDialog({
  admissionId,
  open,
  onClose,
}: {
  admissionId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const { data: admission, isLoading, isError, error } = useQuery({
    queryKey: ["admission", admissionId],
    queryFn: () => apiFetch<AdmissionDetail>(`/admissions/${admissionId}`),
    enabled: !!admissionId && open,
  });

  const { data: stageLogsFromApi } = useQuery({
    queryKey: ["admission", admissionId, "stage-logs"],
    queryFn: async () => {
      try {
        return await apiFetch<StageLog[]>(`/admissions/${admissionId}/stage`);
      } catch {
        return null;
      }
    },
    enabled: !!admissionId && open,
  });

  const stageLogs = stageLogsFromApi ?? admission?.stageLogs ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admission", admissionId] });
    queryClient.invalidateQueries({ queryKey: ["admissions"] });
    queryClient.invalidateQueries({ queryKey: ["admission", admissionId, "stage-logs"] });
  };

  const enrollMutation = useMutation({
    mutationFn: () =>
      apiFetch(`/admissions/${admissionId}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ toStage: "ENROLLED", createStudent: true }),
      }),
    onSuccess: () => {
      invalidate();
      toast({ title: "Enrolled", description: "Stage moved to ENROLLED." });
    },
    onError: (err: Error) => toast({ title: "Enroll failed", description: err.message, variant: "destructive" }),
  });

  const canEnroll = admission?.stage === "FEE_PAYMENT";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                Application Dossier
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {admission ? (
                  <>
                    Application No: <span className="font-mono text-primary font-bold">{admission.applicationNo}</span>
                    {" · "}Applicant: <span className="text-white font-semibold">{admission.lead?.name}</span>
                  </>
                ) : (
                  "Loading…"
                )}
              </p>
            </div>
            {admission && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 bg-primary/20 text-white border border-primary/30 rounded-full">
                  {admission.stage.replace(/_/g, " ")}
                </span>
                {canEnroll && (
                  <Button
                    size="sm"
                    className="text-xs font-bold bg-teal-600 hover:bg-teal-500"
                    disabled={enrollMutation.isPending}
                    onClick={() => enrollMutation.mutate()}
                  >
                    <GraduationCap className="h-3.5 w-3.5 mr-1" />
                    {enrollMutation.isPending ? "Enrolling…" : "Enroll"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="p-8 space-y-3">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        )}
        {isError && (
          <div className="p-8 text-center text-sm text-rose-400">
            {error instanceof Error ? error.message : "Failed to load admission"}
          </div>
        )}
        {admission && (
          <div className="grid grid-cols-1 lg:grid-cols-2 overflow-y-auto max-h-[calc(90vh-88px)]">
            <div className="p-6 border-r border-white/10 bg-secondary/20 space-y-6">
              <DocumentsPanel admissionId={admission.id} fallback={admission.documents} />
              <div>
                <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3 mb-3">Stage history</h3>
                <StageLogsPanel logs={stageLogs} />
              </div>
            </div>
            <div className="p-6 bg-slate-900/50 space-y-6">
              <PaymentsPanel admissionId={admission.id} fallback={admission.payments} />
              <BatchCounselorPanel admission={admission} onUpdated={invalidate} />
              <div className="flex justify-end pt-2 border-t border-white/10">
                <Button variant="outline" onClick={onClose} className="border-white/10 hover:bg-white/5 text-xs font-bold">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


export default function AdmissionsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [stageNotes, setStageNotes] = React.useState("");
  const [pendingStageChange, setPendingStageChange] = React.useState<{ id: string; stage: string } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admissions"],
    queryFn: async () => {
      const res = await fetch("/api/v1/admissions?page=1&limit=200", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { data: AdmissionListItem[]; meta?: { total: number } };
      return { data: json.data, total: json.meta?.total ?? json.data.length };
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage, notes }: { id: string; stage: string; notes?: string }) =>
      apiFetch(`/admissions/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ toStage: stage, notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      toast({ title: "Workflow Stage Updated", description: "Application moved successfully." });
      setPendingStageChange(null);
      setStageNotes("");
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });

  const admissions = data?.data ?? [];
  const byStage = STAGES.reduce<Record<string, AdmissionListItem[]>>((acc, s) => {
    acc[s.key] = admissions.filter((a) => a.stage === s.key);
    return acc;
  }, {});
  const activeAdmission = activeId ? admissions.find((a) => a.id === activeId) : null;

  const openDetail = (admission: AdmissionListItem) => {
    router.replace(`/admissions?id=${admission.id}`, { scroll: false });
  };
  const closeDetail = () => {
    router.replace("/admissions", { scroll: false });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const item = admissions.find((a) => a.id === active.id);
    if (!item) return;
    const overId = over.id as string;
    const targetStage =
      STAGES.find((s) => s.key === overId)?.key ?? admissions.find((a) => a.id === overId)?.stage;
    if (!targetStage || targetStage === item.stage) return;
    setPendingStageChange({ id: item.id, stage: targetStage });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-6 overflow-x-auto">
          {STAGES.map((s) => (
            <div key={s.key} className="min-w-[320px]">
              <Skeleton className="h-12 w-full rounded-t-2xl" />
              <Skeleton className="h-[500px] w-full rounded-b-2xl mt-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 pb-12">
        <PageHeader title="Admissions Workflow Kanban" description="Visual pipeline tracker from document verification to airline cadet batch allocation." />
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-400" />
          <div>
            <h3 className="text-base font-bold text-white">Failed to Load Admissions Pipeline</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {error instanceof Error ? error.message : "An error occurred while loading admissions."}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="border-white/10 text-xs font-bold hover:bg-white/5">
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Admissions Workflow Kanban"
        description="Visual pipeline tracker from document verification to airline cadet batch allocation."
      />

      <div className="overflow-x-auto pb-6 pt-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-max px-1">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage.key}
                stage={stage}
                admissions={byStage[stage.key] ?? []}
                onCardClick={openDetail}
              />
            ))}
          </div>
          <DragOverlay>
            {activeAdmission ? <AdmissionCard admission={activeAdmission} onClick={() => {}} isDragging={false} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <AdmissionDetailDialog admissionId={detailId} open={!!detailId} onClose={closeDetail} />

      <Dialog open={!!pendingStageChange} onOpenChange={(o) => !o && setPendingStageChange(null)}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">
              Move to {pendingStageChange?.stage.replace(/_/g, " ")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground font-medium">
              Shift this candidate to{" "}
              <span className="font-bold text-white">{pendingStageChange?.stage.replace(/_/g, " ")}</span>?
            </p>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground">Stage Transition Notes (Optional)</Label>
              <Textarea
                placeholder="Add audit notes about this workflow shift..."
                value={stageNotes}
                onChange={(e) => setStageNotes(e.target.value)}
                rows={3}
                className="bg-secondary/40 border-white/10 text-xs font-medium"
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setPendingStageChange(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pendingStageChange) return;
                updateStageMutation.mutate({ ...pendingStageChange, notes: stageNotes || undefined });
              }}
              disabled={updateStageMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20"
            >
              {updateStageMutation.isPending ? "Moving..." : "Confirm Stage Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
