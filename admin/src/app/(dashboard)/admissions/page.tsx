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
import { GripVertical, User, Calendar, FileText, ChevronDown } from "lucide-react";
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

const STAGES = [
  { key: "INQUIRY", label: "Inquiry", color: "border-blue-500/50" },
  { key: "DOCUMENT_COLLECTION", label: "Documents", color: "border-yellow-500/50" },
  { key: "INTERVIEW", label: "Interview", color: "border-purple-500/50" },
  { key: "ENROLLED", label: "Enrolled", color: "border-green-500/50" },
  { key: "REJECTED", label: "Rejected", color: "border-red-500/50" },
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
        "rounded-lg border border-border bg-background p-3 cursor-pointer hover:border-primary/50 transition-colors group",
        isDragging && "opacity-50 shadow-xl",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{admission.lead.name}</p>
          <p className="text-xs text-muted-foreground truncate">{admission.applicationNo}</p>
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 mt-0.5" />
      </div>
      {admission.course && (
        <p className="text-xs text-muted-foreground mb-2 truncate">{admission.course.title}</p>
      )}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {formatDate(admission.createdAt)}
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
  stage: { key: string; label: string; color: string };
  admissions: Admission[];
  onCardClick: (admission: Admission) => void;
}

function StageColumn({ stage, admissions, onCardClick }: StageColumnProps) {
  const { setNodeRef } = useSortable({ id: stage.key });

  return (
    <div className="flex flex-col min-w-72 max-w-72">
      <div className={cn("flex items-center justify-between rounded-t-lg border-t-2 bg-muted/30 px-3 py-2", stage.color)}>
        <div className="flex items-center gap-2">
          <StatusBadge status={stage.key} domain="admission" />
          <span className="text-sm font-medium text-muted-foreground ml-1">{admissions.length}</span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className="flex-1 rounded-b-lg border border-t-0 border-border bg-muted/10 p-2 space-y-2 min-h-[400px]"
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
          <p className="text-xs text-muted-foreground text-center py-8">No admissions</p>
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admissions"],
    queryFn: () => apiFetch<AdmissionsResponse>("/admissions?page=1&limit=200"),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage, notes }: { id: string; stage: string; notes?: string }) =>
      apiFetch(`/admissions/${id}/stage`, { method: "PATCH", body: JSON.stringify({ stage, notes }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      toast({ title: "Stage updated" });
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

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4 overflow-x-auto">
          {STAGES.map((s) => (
            <div key={s.key} className="min-w-72">
              <Skeleton className="h-10 w-full rounded-t-lg" />
              <Skeleton className="h-96 w-full rounded-b-lg mt-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Admissions"
        description={`${admissions.length} total applications`}
      />

      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max">
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

      {/* Admission Detail Dialog */}
      <Dialog open={!!selectedAdmission} onOpenChange={(o) => !o && setSelectedAdmission(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Admission Details</DialogTitle>
          </DialogHeader>
          {selectedAdmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Application No", value: selectedAdmission.applicationNo },
                  { label: "Stage", value: <StatusBadge status={selectedAdmission.stage} domain="admission" /> },
                  { label: "Applicant", value: selectedAdmission.lead.name },
                  { label: "Email", value: selectedAdmission.lead.email },
                  { label: "Phone", value: selectedAdmission.lead.phone },
                  { label: "Course", value: selectedAdmission.course?.title ?? "—" },
                  { label: "Campus", value: selectedAdmission.campus?.name ?? "—" },
                  { label: "Applied", value: formatDate(selectedAdmission.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <div className="text-sm font-medium mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAdmission(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage Change Confirmation Dialog */}
      <Dialog open={!!pendingStageChange} onOpenChange={(o) => !o && setPendingStageChange(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move to {pendingStageChange?.stage.replace(/_/g, " ")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to move this application to{" "}
              <span className="font-medium text-foreground">{pendingStageChange?.stage.replace(/_/g, " ")}</span>?
            </p>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Add notes about this stage change..."
                value={stageNotes}
                onChange={(e) => setStageNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingStageChange(null)}>Cancel</Button>
            <Button onClick={confirmStageChange} disabled={updateStageMutation.isPending}>
              {updateStageMutation.isPending ? "Moving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
