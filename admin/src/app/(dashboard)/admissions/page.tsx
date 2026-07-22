"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, User, Calendar, FileText, ChevronDown, ShieldCheck, FileSearch, Award, Landmark, GraduationCap, CheckCircle2, AlertCircle, Download, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { apiFetch } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface Admission {
  id: string;
  applicationNo: string;
  stage: string;
  lead: { id: string; name: string; email: string; phone: string };
  campus?: { name: string };
  course?: { title: string };
  createdAt: string;
  updatedAt: string;
}

interface AdmissionsResponse {
  items: Admission[];
  total: number;
}

// Keys must match the real Prisma `AdmissionStage` enum (prisma/schema.prisma)
// exactly — the board previously used an invented vocabulary that never
// matched a real admission's stage, and the /stage PATCH route validates
// against this enum, so a mismatched key always failed.
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

interface AdmissionCardProps {
  admission: Admission;
  onClick: () => void;
  isDragging?: boolean;
}

function AdmissionCard({ admission, onClick, isDragging }: AdmissionCardProps) {
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
      {admission.course && (
        <p className="text-xs font-semibold text-muted-foreground mb-3 truncate bg-secondary/50 px-2 py-1 rounded border border-white/5">{admission.course.title}</p>
      )}
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-primary" />
          <span>{formatDate(admission.createdAt)}</span>
        </div>
        <span className="text-[10px] font-bold text-white bg-white/5 px-2 py-0.5 rounded">
          Review →
        </span>
      </div>
    </div>
  );
}

interface SortableAdmissionCardProps {
  admission: Admission;
  onClick: () => void;
}

function SortableAdmissionCard({ admission, onClick }: SortableAdmissionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: admission.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <AdmissionCard admission={admission} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

interface StageColumnProps {
  stage: { key: string; label: string; color: string; bg: string; icon: React.ElementType };
  admissions: Admission[];
  onCardClick: (admission: Admission) => void;
}

function StageColumn({ stage, admissions, onCardClick }: StageColumnProps) {
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
      <div
        ref={setNodeRef}
        className="flex-1 rounded-b-2xl border border-t-0 border-white/10 bg-secondary/20 p-3 space-y-3 min-h-[500px] backdrop-blur-sm"
      >
        <SortableContext items={admissions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {admissions.map((admission) => (
            <SortableAdmissionCard
              key={admission.id}
              admission={admission}
              onClick={() => onCardClick(admission)}
            />
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

export default function AdmissionsPage() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [selectedAdmission, setSelectedAdmission] = React.useState<Admission | null>(null);
  const [stageNotes, setStageNotes] = React.useState("");
  const [pendingStageChange, setPendingStageChange] = React.useState<{ id: string; stage: string } | null>(null);
  const [verificationStatus, setVerificationStatus] = React.useState("APPROVED");
  const [remarks, setRemarks] = React.useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admissions"],
    queryFn: async () => {
      const res = await apiFetch<AdmissionsResponse>("/admissions?page=1&limit=200");
      return res;
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage, notes }: { id: string; stage: string; notes?: string }) =>
      apiFetch(`/admissions/${id}/stage`, { method: "PATCH", body: JSON.stringify({ stage, notes }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      toast({ title: "Workflow Stage Updated", description: "Application moved successfully." });
      setPendingStageChange(null);
      setStageNotes("");
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
    },
  });

  const admissions = data?.items ?? [];

  const byStage = STAGES.reduce<Record<string, Admission[]>>((acc, s) => {
    acc[s.key] = admissions.filter((a) => a.stage === s.key);
    return acc;
  }, {});

  const activeAdmission = activeId ? admissions.find((a) => a.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeAdmission = admissions.find((a) => a.id === active.id);
    if (!activeAdmission) return;

    // Determine target stage
    const overId = over.id as string;
    const targetStage = STAGES.find((s) => s.key === overId)?.key
      ?? admissions.find((a) => a.id === overId)?.stage;

    if (!targetStage || targetStage === activeAdmission.stage) return;

    setPendingStageChange({ id: activeAdmission.id, stage: targetStage });
  };

  const confirmStageChange = () => {
    if (!pendingStageChange) return;
    updateStageMutation.mutate({ ...pendingStageChange, notes: stageNotes || undefined });
  };

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Verification Form Saved", description: `Application marked as ${verificationStatus}.` });
    setSelectedAdmission(null);
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
        <PageHeader
          title="Admissions Workflow Kanban"
          description="Visual pipeline tracker from document verification to airline cadet batch allocation."
        />
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
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 min-w-max px-1">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage.key}
                stage={stage}
                admissions={byStage[stage.key] ?? []}
                onCardClick={setSelectedAdmission}
              />
            ))}
          </div>

          <DragOverlay>
            {activeAdmission ? (
              <AdmissionCard
                admission={activeAdmission}
                onClick={() => {}}
                isDragging={false}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Application Review Modal (Side-by-Side View) */}
      <Dialog open={!!selectedAdmission} onOpenChange={(o) => !o && setSelectedAdmission(null)}>
        <DialogContent className="max-w-5xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  Application Verification Dossier
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Application No: <span className="font-mono text-primary font-bold">{selectedAdmission?.applicationNo}</span> • Applicant: <span className="text-white font-semibold">{selectedAdmission?.lead.name}</span>
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-primary/20 text-white border border-primary/30 rounded-full">
                {selectedAdmission?.stage.replace(/_/g, " ")}
              </span>
            </div>
          </DialogHeader>

          {selectedAdmission && (
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
              {/* Left Column: Attached Documents View */}
              <div className="p-6 border-r border-white/10 bg-secondary/20 space-y-6 overflow-y-auto max-h-[600px]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <FileSearch className="h-4 w-4 text-primary" />
                    Submitted Verification Documents
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Review official certificates before passing verification stages.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Class 12 Physics & Maths Transcript.pdf", type: "Academic Eligibility", status: "VERIFIED", size: "2.4 MB" },
                    { name: "DGCA Class II Medical Assessment.pdf", type: "Medical Assessment", status: "VERIFIED", size: "1.2 MB" },
                    { name: "Aadhaar / Passport Proof.pdf", type: "Govt Identity", status: "PENDING", size: "3.8 MB" },
                  ].map((doc, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-3 group hover:border-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary truncate pr-2">{doc.name}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${doc.status === "VERIFIED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"}`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-white/5">
                        <span>{doc.type} • {doc.size}</span>
                        <Button variant="ghost" size="sm" className="h-7 text-[11px] font-bold text-primary hover:bg-white/5">
                          <ExternalLink className="h-3 w-3 mr-1" /> Open Preview
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-secondary/40 border border-white/5 space-y-2 text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" /> Note for Scrutiny Desk
                  </span>
                  <p className="text-muted-foreground leading-relaxed">Ensure DGCA Medical Assessment is valid for at least 12 months from proposed batch start date.</p>
                </div>
              </div>

              {/* Right Column: Verification Form */}
              <div className="p-6 bg-slate-900/50 space-y-6 overflow-y-auto max-h-[600px] flex flex-col justify-between">
                <form onSubmit={handleVerificationSubmit} id="verification-form" className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Verification Scrutiny Form
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">Approve or flag anomalies to update candidate pipeline stage.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Verification Decision</Label>
                    <select
                      className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      value={verificationStatus}
                      onChange={(e) => setVerificationStatus(e.target.value)}
                    >
                      <option value="APPROVED" className="bg-slate-900 text-emerald-400">PASSED SCRUTINY (PROCEED)</option>
                      <option value="FLAGGED" className="bg-slate-900 text-amber-400">FLAGGED FOR RESUBMISSION</option>
                      <option value="REJECTED" className="bg-slate-900 text-rose-400">REJECTED APPLICATION</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Scrutiny Remarks & Findings</Label>
                    <Textarea
                      placeholder="Applicant meets all physical and academic requirements. Documents are clear and original copies verified..."
                      rows={6}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="bg-secondary/40 border-white/10 text-xs font-medium"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                    <span className="text-xs font-bold text-white block">Next Automatic Stage Shift</span>
                    <p className="text-[11px] text-muted-foreground">Approving will automatically trigger Fee Payment link via WhatsApp & Email Webhooks.</p>
                  </div>
                </form>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <Button variant="outline" onClick={() => setSelectedAdmission(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" form="verification-form" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                    Save Verification & Proceed
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stage Change Confirmation Dialog */}
      <Dialog open={!!pendingStageChange} onOpenChange={(o) => !o && setPendingStageChange(null)}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              Move to {pendingStageChange?.stage.replace(/_/g, " ")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground font-medium">
              Are you sure you want to shift this candidate to{" "}
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
            <Button variant="outline" onClick={() => setPendingStageChange(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
            <Button onClick={confirmStageChange} disabled={updateStageMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
              {updateStageMutation.isPending ? "Moving..." : "Confirm Stage Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
