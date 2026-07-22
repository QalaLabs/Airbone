"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState, type SortingState } from "@tanstack/react-table";
import { Search, Eye, MoreHorizontal, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate, getInitials } from "@/lib/utils";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  studentCode: string;
  medicalFitness: boolean;
  avatarUrl?: string;
  createdAt: string;
  course?: { title: string };
  campus?: { name: string };
}

const STUDENT_STATUSES = ["all", "ACTIVE", "GRADUATED", "DROPPED", "SUSPENDED", "ON_HOLD"];

export default function StudentsPage() {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["students", pagination, sorting, debouncedSearch, statusFilter],
    queryFn: async () => {
      const sortField = sorting[0]?.id ?? "createdAt";
      const sortDirection = sorting[0]?.desc ? "desc" : "asc";
      const mappedSortField = sortField === "name" ? "firstName" : sortField;

      const p = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        sortBy: mappedSortField,
        sortDir: sortDirection,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}),
      });
      // The API responds with { success, data: Student[], meta: {total,totalPages} }.
      // apiFetch() only unwraps `.data` (dropping `.meta`), so this fetches directly
      // to preserve real pagination totals rather than assuming a nested shape.
      const res = await fetch(`/api/v1/students?${p}`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { data: Student[]; meta?: { total: number; totalPages: number } };
      return {
        items: json.data,
        total: json.meta?.total ?? json.data.length,
        totalPages: json.meta?.totalPages ?? 1,
      };
    },
  });

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: "Student",
      cell: ({ row }) => {
        const name = `${row.original.firstName} ${row.original.lastName}`;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-primary/30 shadow-sm">
              {row.original.avatarUrl && <AvatarImage src={row.original.avatarUrl} />}
              <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <button onClick={() => setSelectedStudent(row.original)} className="text-sm font-bold text-white hover:text-primary transition-colors truncate block text-left">
                {name}
              </button>
              <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">{row.original.studentCode}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "course",
      header: "Enrolled Course",
      cell: ({ row }) => <span className="text-xs font-semibold text-foreground">{row.original.course?.title ?? "—"}</span>,
    },
    {
      accessorKey: "campus",
      header: "Campus",
      cell: ({ row }) => <span className="text-xs font-semibold text-muted-foreground">{row.original.campus?.name ?? "—"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full border bg-blue-500/20 text-blue-400 border-blue-500/30">
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "medicalFitness",
      header: "Medical Fitness",
      cell: ({ row }) =>
        row.original.medicalFitness ? (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Cleared</span>
        ) : (
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Pending</span>
        ),
    },
    {
      accessorKey: "createdAt",
      header: "Enrolled On",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      size: 50,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel border-white/10 w-44">
            <DropdownMenuItem onClick={() => setSelectedStudent(row.original)} className="cursor-pointer hover:bg-white/5">
              <Eye className="mr-2 h-4 w-4 text-primary" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Student Database"
        description="Enrolled student records and status tracking."
      />

      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students by name, email, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-sm font-medium"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-secondary/40 border-white/10 text-xs font-semibold">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="glass-panel border-white/10 text-xs">
            {STUDENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-400" />
          <div>
            <h3 className="text-base font-bold text-white">Failed to Load Students</h3>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{error?.message || "Internal server error"}</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="border-white/10 text-xs font-bold hover:bg-white/5">
            Retry Loading
          </Button>
        </div>
      )}

      {!isError && (
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            loading={isLoading}
            pageCount={data?.totalPages ?? 0}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            emptyTitle="No students found"
            emptyDescription="Students will appear here once admissions are enrolled."
          />
        </div>
      )}

      {/* Student Detail Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={(o) => !o && setSelectedStudent(null)}>
        <DialogContent className="max-w-lg glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/40 shadow-xl">
                {selectedStudent?.avatarUrl && <AvatarImage src={selectedStudent.avatarUrl} />}
                <AvatarFallback className="text-lg bg-primary/20 text-primary font-bold">
                  {selectedStudent ? getInitials(`${selectedStudent.firstName} ${selectedStudent.lastName}`) : "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-bold text-white tracking-tight">
                  {selectedStudent?.firstName} {selectedStudent?.lastName}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Student Code: <span className="font-mono text-primary font-bold">{selectedStudent?.studentCode}</span>
                </p>
              </div>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground font-semibold block">Email</span>
                  <span className="text-white font-medium">{selectedStudent.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">Phone</span>
                  <span className="text-white font-medium">{selectedStudent.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">Course</span>
                  <span className="text-white font-medium">{selectedStudent.course?.title ?? "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold block">Campus</span>
                  <span className="text-white font-medium">{selectedStudent.campus?.name ?? "—"}</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground pt-2 border-t border-white/10">
                Attendance, flying hours, exam clearances, and fee ledgers are not yet tracked in this system.
              </p>
            </div>
          )}

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button variant="outline" onClick={() => setSelectedStudent(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
