"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState, type SortingState } from "@tanstack/react-table";
import { Search, CheckCircle, XCircle, Star, AlertCircle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Testimonial {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorRole?: string;
  content: string;
  rating?: number;
  status: string;
  course?: { title: string };
  reviewNotes?: string;
  submittedAt: string;
  createdAt: string;
}

interface TestimonialsResponse {
  items: Testimonial[];
  total: number;
  totalPages: number;
}

const TESTIMONIAL_STATUSES = ["all", "PENDING", "APPROVED", "REJECTED"];

export default function TestimonialsPage() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [reviewDialog, setReviewDialog] = React.useState<{ open: boolean; id: string; action: "APPROVED" | "REJECTED" } | null>(null);
  const [reviewNotes, setReviewNotes] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["testimonials", pagination, sorting, debouncedSearch, statusFilter],
    queryFn: () => {
      const sortField = sorting[0]?.id ?? "createdAt";
      const sortDirection = sorting[0]?.desc ? "desc" : "asc";

      const p = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        sortBy: sortField,
        sortDir: sortDirection,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}),
      });
      return apiFetch<TestimonialsResponse>(`/testimonials?${p}`);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      apiFetch(`/testimonials/${id}/review`, { method: "POST", body: JSON.stringify({ status, reviewNotes: notes }) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      toast({
        title: variables.status === "APPROVED" ? "Testimonial approved" : "Testimonial rejected",
        variant: variables.status === "APPROVED" ? ("success" as "default") : "destructive",
      });
      setReviewDialog(null);
      setReviewNotes("");
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleReview = (id: string, action: "APPROVED" | "REJECTED") => {
    setReviewDialog({ open: true, id, action });
    setReviewNotes("");
  };

  const confirmReview = () => {
    if (!reviewDialog) return;
    reviewMutation.mutate({ id: reviewDialog.id, status: reviewDialog.action, notes: reviewNotes || undefined });
  };

  const columns: ColumnDef<Testimonial>[] = [
    {
      accessorKey: "authorName",
      header: "Author",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.original.authorName}</p>
          {row.original.authorRole && (
            <p className="text-xs text-muted-foreground">{row.original.authorRole}</p>
          )}
          {row.original.authorEmail && (
            <p className="text-xs text-muted-foreground">{row.original.authorEmail}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "content",
      header: "Testimonial",
      cell: ({ row }) => (
        <p className="text-sm text-muted-foreground max-w-xs truncate">{row.original.content}</p>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) =>
        row.original.rating != null ? (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" />
            <span className="text-sm font-medium">{row.original.rating}/5</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    {
      accessorKey: "course",
      header: "Course",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.course?.title ?? "—"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} domain="testimonial" />,
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "actions",
      size: 160,
      cell: ({ row }) => {
        if (row.original.status !== "PENDING") {
          return (
            <span className="text-xs text-muted-foreground">
              {row.original.status === "APPROVED" ? "Approved" : "Rejected"}
            </span>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-success/30 text-success hover:bg-success/10 hover:text-success"
              onClick={() => handleReview(row.original.id, "APPROVED")}
              disabled={reviewMutation.isPending}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => handleReview(row.original.id, "REJECTED")}
              disabled={reviewMutation.isPending}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  const pendingCount = data?.items.filter((t) => t.status === "PENDING").length ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Testimonials"
        description={`${data?.total ?? 0} total testimonials`}
        action={
          pendingCount > 0 ? (
            <Badge variant="warning" className="text-sm px-3 py-1">
              {pendingCount} pending review
            </Badge>
          ) : undefined
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search testimonials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {TESTIMONIAL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-400" />
          <div>
            <h3 className="text-base font-bold text-white">Failed to Load Testimonials</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{error?.message || "Internal server error"}</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="border-white/10 text-xs font-bold hover:bg-white/5">
            Retry Loading
          </Button>
        </div>
      )}

      {!isError && (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={isLoading}
          pageCount={data?.totalPages ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          emptyTitle="No testimonials found"
          emptyDescription="Testimonials submitted by students will appear here."
        />
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialog?.open ?? false} onOpenChange={(o) => !o && setReviewDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewDialog?.action === "APPROVED" ? "Approve Testimonial" : "Reject Testimonial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {reviewDialog?.action === "APPROVED"
                ? "This testimonial will be approved and may be displayed publicly."
                : "This testimonial will be rejected and hidden from public view."}
            </p>
            <div className="space-y-2">
              <Label>Review Notes (optional)</Label>
              <Textarea
                placeholder="Add notes about your decision..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Cancel</Button>
            <Button
              onClick={confirmReview}
              disabled={reviewMutation.isPending}
              className={
                reviewDialog?.action === "APPROVED"
                  ? "bg-success text-white hover:bg-success/90"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
            >
              {reviewMutation.isPending
                ? "Processing..."
                : reviewDialog?.action === "APPROVED"
                ? "Approve"
                : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
