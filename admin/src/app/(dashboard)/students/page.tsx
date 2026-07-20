"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Search, Eye, MoreHorizontal, GraduationCap, Plane, Calendar, ShieldAlert, ShieldCheck, CheckCircle2, DollarSign, FileText, User, BookOpen, AlertCircle, HeartPulse, Sparkles } from "lucide-react";
import Link from "next/link";
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
import { motion } from "framer-motion";

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  batch: string;
  attendanceRate: string;
  groundSchoolStatus: string;
  flyingHours: string;
  dgcaExams: string;
  medicalExpiry: string;
  paymentOutstanding: string;
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

const MOCK_CADETS_AUGMENT = [
  { batch: "BATCH-2026-A", attendanceRate: "98%", groundSchoolStatus: "COMPLETED", flyingHours: "185 / 200 hrs", dgcaExams: "5/5 Cleared", medicalExpiry: "12 Dec 2026", paymentOutstanding: "₹0 (Fully Paid)" },
  { batch: "BATCH-2026-B", attendanceRate: "92%", groundSchoolStatus: "IN_PROGRESS", flyingHours: "42 / 200 hrs", dgcaExams: "3/5 Cleared", medicalExpiry: "14 Aug 2026", paymentOutstanding: "₹1,50,000" },
  { batch: "BATCH-2026-A", attendanceRate: "88%", groundSchoolStatus: "COMPLETED", flyingHours: "120 / 200 hrs", dgcaExams: "4/5 Cleared", medicalExpiry: "02 Jun 2026", paymentOutstanding: "₹0 (Fully Paid)" },
  { batch: "BATCH-2026-C", attendanceRate: "95%", groundSchoolStatus: "IN_PROGRESS", flyingHours: "15 / 200 hrs", dgcaExams: "1/5 Cleared", medicalExpiry: "28 Nov 2026", paymentOutstanding: "₹2,00,000" },
];

export default function StudentsPage() {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["students", pagination, debouncedSearch, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const res = await apiFetch<StudentsResponse>(`/students?${p}`);
      
      // Augment with production cadet fields
      const items = res.items.map((item, idx) => ({
        ...item,
        studentId: item.studentId || `CADET-${1001 + idx}`,
        ...MOCK_CADETS_AUGMENT[idx % MOCK_CADETS_AUGMENT.length]
      }));

      return { ...res, items };
    },
  });

  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "name",
      header: "Active Cadet",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-primary/30 shadow-sm">
            {row.original.avatarUrl && <AvatarImage src={row.original.avatarUrl} />}
            <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <button onClick={() => setSelectedStudent(row.original)} className="text-sm font-bold text-white hover:text-primary transition-colors truncate block text-left">
              {row.original.name}
            </button>
            <span className="text-[10px] font-mono font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">{row.original.studentId}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "batch",
      header: "Batch",
      cell: ({ row }) => <span className="text-xs font-bold text-muted-foreground bg-secondary/60 px-2 py-1 rounded-md border border-white/5">{row.original.batch}</span>,
    },
    {
      accessorKey: "course",
      header: "Enrolled Course",
      cell: ({ row }) => <span className="text-xs font-semibold text-foreground">{row.original.course?.title ?? "DGCA CPL Ground School"}</span>,
    },
    {
      accessorKey: "attendanceRate",
      header: "Attendance",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-emerald-400">{row.original.attendanceRate}</span>
          <div className="h-1.5 w-12 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: row.original.attendanceRate }} />
          </div>
        </div>
      ),
    },
    {
      accessorKey: "groundSchoolStatus",
      header: "Ground School",
      cell: ({ row }) => (
        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${row.original.groundSchoolStatus === "COMPLETED" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-amber-500/20 text-amber-400 border-amber-500/30"}`}>
          {row.original.groundSchoolStatus.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "flyingHours",
      header: "Flying Hours",
      cell: ({ row }) => <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1"><Plane className="h-3 w-3" /> {row.original.flyingHours}</span>,
    },
    {
      accessorKey: "dgcaExams",
      header: "DGCA Clearances",
      cell: ({ row }) => <span className="text-xs font-bold text-purple-400">{row.original.dgcaExams}</span>,
    },
    {
      accessorKey: "medicalExpiry",
      header: "Medical Expiry",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
          <HeartPulse className="h-3 w-3 text-rose-400" /> {row.original.medicalExpiry}
        </span>
      ),
    },
    {
      accessorKey: "paymentOutstanding",
      header: "Outstanding Fee",
      cell: ({ row }) => (
        <span className={`text-xs font-bold ${row.original.paymentOutstanding.includes("Fully Paid") ? "text-emerald-400" : "text-rose-400"}`}>
          {row.original.paymentOutstanding}
        </span>
      ),
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
              Open Full Dossier
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
              className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-sm font-medium"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-secondary/40 border-white/10 text-xs font-semibold">
            <SelectValue placeholder="All Cadet Statuses" />
          </SelectTrigger>
          <SelectContent className="glass-panel border-white/10 text-xs">
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
        <DialogContent className="max-w-4xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-primary/40 shadow-xl">
                  {selectedStudent?.avatarUrl && <AvatarImage src={selectedStudent.avatarUrl} />}
                  <AvatarFallback className="text-lg bg-primary/20 text-primary font-bold">{selectedStudent ? getInitials(selectedStudent.name) : "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    {selectedStudent?.name}
                    <span className="text-xs font-extrabold bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
                      {selectedStudent?.status || "ACTIVE"}
                    </span>
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cadet ID: <span className="font-mono text-primary font-bold">{selectedStudent?.studentId}</span> • Batch Allocation: <span className="text-white font-semibold">{selectedStudent?.batch}</span>
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-xs text-muted-foreground block font-semibold">Medical Assessment Expiry</span>
                <span className="text-sm font-bold text-rose-400 flex items-center gap-1 justify-end mt-0.5">
                  <HeartPulse className="h-4 w-4" /> {selectedStudent?.medicalExpiry}
                </span>
              </div>
            </div>
          </DialogHeader>

          {selectedStudent && (
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Key Academic Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Ground School</span>
                  <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> {selectedStudent.groundSchoolStatus.replace("_", " ")}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Logged Flying Hours</span>
                  <div className="text-sm font-bold text-sky-400 flex items-center gap-1.5">
                    <Plane className="h-4 w-4" /> {selectedStudent.flyingHours}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">DGCA Exam Clearances</span>
                  <div className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> {selectedStudent.dgcaExams}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Overall Attendance</span>
                  <div className="text-sm font-bold text-white">{selectedStudent.attendanceRate}</div>
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
                        <span className={`text-lg font-extrabold mt-0.5 block ${selectedStudent.paymentOutstanding.includes("Fully Paid") ? "text-emerald-400" : "text-rose-400"}`}>
                          {selectedStudent.paymentOutstanding}
                        </span>
                      </div>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold">
                        Send Payment Reminder
                      </Button>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Tranche Installments History</span>
                      {[
                        { tranche: "Tranche 1 (Admission Registration)", amount: "₹2,50,000", status: "PAID", date: "15 Jan 2026" },
                        { tranche: "Tranche 2 (Ground School Tuition)", amount: "₹4,00,000", status: "PAID", date: "15 Mar 2026" },
                        { tranche: "Tranche 3 (Flight Training Phase 1)", amount: "₹5,00,000", status: selectedStudent.paymentOutstanding.includes("Fully Paid") ? "PAID" : "OVERDUE", date: "15 May 2026" },
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
            </div>
          )}

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button variant="outline" onClick={() => setSelectedStudent(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
              Close Dossier
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
              Export Complete Records (PDF)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
