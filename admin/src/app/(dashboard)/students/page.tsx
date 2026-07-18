"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Search, Eye, MoreHorizontal, GraduationCap, Plane, Calendar, CheckCircle2, DollarSign, User, BookOpen, HeartPulse, Sparkles, Save, Loader2 } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  customFields?: any;
  course?: { title: string };
  campus?: { name: string };
  enrolledAt?: string;
  avatarUrl?: string;
}

interface StudentsResponse {
  items: Student[];
  total: number;
  totalPages: number;
}

const STUDENT_STATUSES = ["", "ACTIVE", "INACTIVE", "GRADUATED", "DROPPED"];

export default function StudentsPage() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  
  // Local edit states
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedFields, setEditedFields] = React.useState({
    status: "",
    batch: "",
    attendanceRate: "",
    groundSchoolStatus: "",
    flyingHours: "",
    dgcaExams: "",
    medicalExpiry: "",
    paymentOutstanding: "",
  });

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Load students
  const { data, isLoading } = useQuery<StudentsResponse>({
    queryKey: ["students", pagination, debouncedSearch, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      return apiFetch<StudentsResponse>(`/students?${p}`);
    },
  });

  // Load edit state when student is selected
  React.useEffect(() => {
    if (selectedStudent) {
      setEditedFields({
        status: selectedStudent.status || "ACTIVE",
        batch: selectedStudent.customFields?.batch || "BATCH-2026-A",
        attendanceRate: selectedStudent.customFields?.attendanceRate || "95%",
        groundSchoolStatus: selectedStudent.customFields?.groundSchoolStatus || "IN_PROGRESS",
        flyingHours: selectedStudent.customFields?.flyingHours || "40 / 200 hrs",
        dgcaExams: selectedStudent.customFields?.dgcaExams || "2/5 Cleared",
        medicalExpiry: selectedStudent.customFields?.medicalExpiry || "15 Nov 2026",
        paymentOutstanding: selectedStudent.customFields?.paymentOutstanding || "₹1,50,000",
      });
      setIsEditing(false);
    }
  }, [selectedStudent]);

  // Mutation to update student
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => 
      apiFetch<Student>(`/students/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setSelectedStudent(data);
      setIsEditing(false);
      toast({ title: "Student Dossier Updated", description: "Academic tracking and financial credentials updated successfully." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSaveStudent = () => {
    if (!selectedStudent) return;
    updateMutation.mutate({
      id: selectedStudent.id,
      body: {
        status: editedFields.status,
        customFields: {
          ...(selectedStudent.customFields || {}),
          batch: editedFields.batch,
          attendanceRate: editedFields.attendanceRate,
          groundSchoolStatus: editedFields.groundSchoolStatus,
          flyingHours: editedFields.flyingHours,
          dgcaExams: editedFields.dgcaExams,
          medicalExpiry: editedFields.medicalExpiry,
          paymentOutstanding: editedFields.paymentOutstanding,
        }
      }
    });
  };

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: "Active Cadet",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-primary/30 shadow-sm">
            {row.original.avatarUrl && <AvatarImage src={row.original.avatarUrl} />}
            <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">{getInitials(row.original.name || `${row.original.firstName} ${row.original.lastName}`)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <button onClick={() => setSelectedStudent(row.original)} className="text-sm font-bold text-white hover:text-primary transition-colors truncate block text-left">
              {row.original.name || `${row.original.firstName} ${row.original.lastName}`}
            </button>
            <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">{row.original.studentId || "PENDING"}</span>
          </div>
        </div>
      ),
    },
    {
      id: "batch",
      header: "Batch",
      cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground bg-secondary/60 px-2 py-1 rounded-md border border-white/5">{row.original.customFields?.batch || "BATCH-2026-A"}</span>,
    },
    {
      accessorKey: "course",
      header: "Enrolled Course",
      cell: ({ row }) => <span className="text-xs font-semibold text-foreground">{row.original.course?.title ?? "DGCA CPL Ground School"}</span>,
    },
    {
      id: "attendanceRate",
      header: "Attendance",
      cell: ({ row }) => {
        const rate = row.original.customFields?.attendanceRate || "95%";
        return (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-emerald-400">{rate}</span>
            <div className="h-1.5 w-12 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: rate.includes("%") ? rate : `${rate}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      id: "groundSchoolStatus",
      header: "Ground School",
      cell: ({ row }) => {
        const status = row.original.customFields?.groundSchoolStatus || "IN_PROGRESS";
        return (
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
            {status.replace("_", " ")}
          </span>
        );
      },
    },
    {
      id: "flyingHours",
      header: "Flying Hours",
      cell: ({ row }) => {
        const hours = row.original.customFields?.flyingHours || "0 / 200 hrs";
        return <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1"><Plane className="h-3 w-3" /> {hours}</span>;
      },
    },
    {
      id: "dgcaExams",
      header: "DGCA Clearances",
      cell: ({ row }) => <span className="text-xs font-bold text-purple-400">{row.original.customFields?.dgcaExams || "2/5 Cleared"}</span>,
    },
    {
      id: "medicalExpiry",
      header: "Medical Expiry",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <HeartPulse className="h-3 w-3 text-rose-400" /> {row.original.customFields?.medicalExpiry || "15 Nov 2026"}
        </span>
      ),
    },
    {
      id: "paymentOutstanding",
      header: "Outstanding Fee",
      cell: ({ row }) => {
        const amt = row.original.customFields?.paymentOutstanding || "₹0";
        const isPaid = amt.includes("Paid") || amt === "₹0" || amt === "0";
        return (
          <span className={`text-xs font-bold ${isPaid ? "text-emerald-400" : "text-rose-400"}`}>
            {isPaid ? "₹0 (Fully Paid)" : amt}
          </span>
        );
      },
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
          <DropdownMenuContent align="end" className="glass-panel border-white/10 w-48 text-white">
            <DropdownMenuItem onClick={() => { setSelectedStudent(row.original); setIsEditing(false); }} className="cursor-pointer hover:bg-white/5">
              <Eye className="mr-2 h-4 w-4 text-primary" />
              Open Dossier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedStudent(row.original); setIsEditing(true); }} className="cursor-pointer hover:bg-white/5">
              <Sparkles className="mr-2 h-4 w-4 text-amber-400" />
              Edit Cadet Telemetry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Active Cadet Database" 
        description="Holistic academic tracking, flight logging, DGCA exam clearances, and financial dossier management." 
      />

      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cadets by name, ID, batch..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-sm font-medium text-white"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-secondary/40 border-white/10 text-xs font-semibold text-white">
            <SelectValue placeholder="All Cadet Statuses" />
          </SelectTrigger>
          <SelectContent className="glass-panel border-white/10 text-xs text-white">
            {STUDENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s || "All Statuses"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          loading={isLoading}
          pageCount={data?.totalPages ?? 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          emptyTitle="No active cadets found"
          emptyDescription="Cadets will appear here upon completion of admissions batch allocation."
        />
      </div>

      {/* Detailed Cadet Academic & Financial Dossier Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={(o) => !o && setSelectedStudent(null)}>
        <DialogContent className="max-w-4xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden text-white">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/40 shadow-xl">
                  {selectedStudent?.avatarUrl && <AvatarImage src={selectedStudent.avatarUrl} />}
                  <AvatarFallback className="text-lg bg-primary/20 text-primary font-bold">{selectedStudent ? getInitials(selectedStudent.name || `${selectedStudent.firstName} ${selectedStudent.lastName}`) : "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    {selectedStudent?.name || `${selectedStudent?.firstName} ${selectedStudent?.lastName}`}
                    <span className="text-xs font-extrabold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full animate-pulse">
                      {selectedStudent?.status || "ACTIVE"}
                    </span>
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cadet ID: <span className="font-mono text-primary font-bold">{selectedStudent?.studentId || "PENDING"}</span> • Batch: <span className="text-white font-semibold">{editedFields.batch}</span>
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs text-muted-foreground block font-semibold">Medical Assessment Expiry</span>
                <span className="text-sm font-bold text-rose-400 flex items-center gap-1 justify-end mt-0.5">
                  <HeartPulse className="h-4 w-4" /> {editedFields.medicalExpiry}
                </span>
              </div>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 p-5 rounded-2xl border border-white/5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Cadet Status</Label>
                    <select
                      value={editedFields.status}
                      onChange={(e) => setEditedFields(prev => ({ ...prev, status: e.target.value }))}
                      className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="GRADUATED">GRADUATED</option>
                      <option value="DROPPED">DROPPED</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Batch Code</Label>
                    <Input value={editedFields.batch} onChange={(e) => setEditedFields(prev => ({ ...prev, batch: e.target.value }))} className="bg-secondary/60 border-white/10 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Overall Attendance Rate</Label>
                    <Input value={editedFields.attendanceRate} onChange={(e) => setEditedFields(prev => ({ ...prev, attendanceRate: e.target.value }))} className="bg-secondary/60 border-white/10 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Ground School Status</Label>
                    <select
                      value={editedFields.groundSchoolStatus}
                      onChange={(e) => setEditedFields(prev => ({ ...prev, groundSchoolStatus: e.target.value }))}
                      className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1"
                    >
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="ON_HOLD">ON HOLD</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Logged Flying Hours</Label>
                    <Input value={editedFields.flyingHours} onChange={(e) => setEditedFields(prev => ({ ...prev, flyingHours: e.target.value }))} className="bg-secondary/60 border-white/10 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">DGCA Exam Clearances</Label>
                    <Input value={editedFields.dgcaExams} onChange={(e) => setEditedFields(prev => ({ ...prev, dgcaExams: e.target.value }))} className="bg-secondary/60 border-white/10 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Medical Assessment Expiry Date</Label>
                    <Input value={editedFields.medicalExpiry} onChange={(e) => setEditedFields(prev => ({ ...prev, medicalExpiry: e.target.value }))} className="bg-secondary/60 border-white/10 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground">Outstanding Tuition Balance</Label>
                    <Input value={editedFields.paymentOutstanding} onChange={(e) => setEditedFields(prev => ({ ...prev, paymentOutstanding: e.target.value }))} className="bg-secondary/60 border-white/10 text-xs" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Key Academic Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">Ground School</span>
                      <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> {editedFields.groundSchoolStatus.replace("_", " ")}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">Logged Flying Hours</span>
                      <div className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                        <Plane className="h-4 w-4" /> {editedFields.flyingHours}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">DGCA Exam Clearances</span>
                      <div className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" /> {editedFields.dgcaExams}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">Overall Attendance</span>
                      <div className="text-sm font-bold text-white">{editedFields.attendanceRate}</div>
                    </div>
                  </div>

                  {/* Two Column Dossier: Academic Progress & Financial Ledger */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Academic Progress */}
                    <div className="p-5 rounded-2xl bg-secondary/20 border border-white/10 space-y-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
                        <BookOpen className="h-4 w-4 text-primary" /> DGCA Papers & Ground Modules
                      </h3>
                      <div className="space-y-3.5">
                        {[
                          { paper: "Air Navigation", score: "88%", status: "CLEARED", date: "12 Apr 2026" },
                          { paper: "Aviation Meteorology", score: "82%", status: "CLEARED", date: "15 Apr 2026" },
                          { paper: "Air Regulation", score: "90%", status: "CLEARED", date: "28 Apr 2026" },
                          { paper: "Aircraft Technical (General)", score: "85%", status: "CLEARED", date: "10 May 2026" },
                          { paper: "Radio Telephony RTR(A)", score: "Pending Exam", status: "SCHEDULED", date: "24 Jun 2026" },
                        ].map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/5">
                            <div>
                              <p className="text-xs font-bold text-white">{p.paper}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Exam Date: {p.date}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${p.status === "CLEARED" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"}`}>
                                {p.status}
                              </span>
                              <p className="text-xs font-bold text-muted-foreground mt-1">{p.score}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Ledger */}
                    <div className="p-5 rounded-2xl bg-secondary/20 border border-white/10 space-y-5">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2 border-b border-white/10 pb-3">
                        <DollarSign className="h-4 w-4 text-emerald-400" /> Financial Ledger & Tranches
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground font-semibold block">Total Outstanding Balance</span>
                            <span className={`text-lg font-extrabold mt-0.5 block ${editedFields.paymentOutstanding.includes("Paid") || editedFields.paymentOutstanding === "₹0" ? "text-emerald-400" : "text-rose-400"}`}>
                              {editedFields.paymentOutstanding}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Tranche Installments History</span>
                          {[
                            { tranche: "Tranche 1 (Admission Registration)", amount: "₹2,50,000", status: "PAID", date: "15 Jan 2026" },
                            { tranche: "Tranche 2 (Ground School Tuition)", amount: "₹4,00,000", status: "PAID", date: "15 Mar 2026" },
                            { tranche: "Tranche 3 (Flight Training Phase 1)", amount: "₹5,00,000", status: editedFields.paymentOutstanding.includes("Paid") || editedFields.paymentOutstanding === "₹0" ? "PAID" : "OVERDUE", date: "15 May 2026" },
                          ].map((tr, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-white/5 text-xs">
                              <div>
                                <p className="font-bold text-white">{tr.tranche}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Due/Paid: {tr.date}</p>
                              </div>
                              <div className="text-right">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${tr.status === "PAID" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                                  {tr.status}
                                </span>
                                <p className="font-mono font-bold text-white mt-1">{tr.amount}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
                <Button onClick={handleSaveStudent} disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                  {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" /> Save Changes</>}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setSelectedStudent(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
                  Close Dossier
                </Button>
                <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                  Edit Cadet Telemetry
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
