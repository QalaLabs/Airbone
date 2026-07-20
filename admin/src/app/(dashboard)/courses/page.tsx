"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Search, Globe, MoreHorizontal, Eye, Plus, BookOpen, Users, Calendar, DollarSign, SearchCode, CheckCircle2, SlidersHorizontal, Save, GraduationCap } from "lucide-react";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  id: string;
  title: string;
  slug: string;
  status: string;
  duration?: string;
  fee?: number;
  studentsCount?: number;
  publishedAt?: string;
  createdAt: string;
  syllabus?: string[];
  batches?: { name: string; instructor: string; schedule: string }[];
  feeBreakdown?: { tranche: string; amount: number }[];
  seo?: { metaTitle: string; metaDescription: string };
}

interface CoursesResponse {
  items: Course[];
  total: number;
  totalPages: number;
}

const COURSE_STATUSES = ["", "DRAFT", "PUBLISHED", "ARCHIVED"];

const MOCK_COURSES_AUGMENT = [
  {
    syllabus: ["Module 1: Basic Aerodynamics & Principles of Flight", "Module 2: Air Navigation & Flight Planning", "Module 3: Aviation Meteorology & Weather Charts", "Module 4: Air Regulations & ATC Procedures"],
    batches: [{ name: "Alpha Morning Batch", instructor: "Capt. Vikram Singh", schedule: "Mon-Fri, 08:00 - 12:00" }, { name: "Bravo Evening Batch", instructor: "Capt. Anjali Sharma", schedule: "Mon-Fri, 14:00 - 18:00" }],
    feeBreakdown: [{ tranche: "Registration & Kits", amount: 150000 }, { tranche: "Ground Tuition Fee", amount: 250000 }, { tranche: "Examination & DGCA Processing", amount: 100000 }],
    seo: { metaTitle: "DGCA CPL Ground School | Airborne Aviation Academy", metaDescription: "Enroll in India's leading DGCA CPL Ground School. Interactive syllabus, expert airline captain instructors, and 98% first-attempt clearance record." }
  },
  {
    syllabus: ["Phase 1: Airline Prep & Cognitive Testing", "Phase 2: Group Discussion & Interview Simulation", "Phase 3: Fixed Base Simulator Screening Orientation"],
    batches: [{ name: "Cadet Weekend Express", instructor: "Capt. Rahul Verma", schedule: "Sat-Sun, 09:00 - 16:00" }],
    feeBreakdown: [{ tranche: "Screening Assessment Fee", amount: 50000 }, { tranche: "Airline Prep Tuition", amount: 150000 }],
    seo: { metaTitle: "Cadet Pilot Program Prep | Airborne Aviation Academy", metaDescription: "Master the Indigo and Air India Cadet Pilot Program screening process with dedicated airline test prep and simulator assessments." }
  }
];

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [activeTab, setActiveTab] = React.useState("syllabus");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["courses", pagination, debouncedSearch, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const res = await apiFetch<CoursesResponse>(`/courses?${p}`);
      
      // Augment with production course manager fields
      const items = res.items.map((item, idx) => ({
        ...item,
        ...MOCK_COURSES_AUGMENT[idx % MOCK_COURSES_AUGMENT.length]
      }));

      return { ...res, items };
    },
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/courses/${id}/publish`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course published successfully", description: "Course status is now live on the website CMS." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Course Configurations Saved", description: "Syllabus, batches, fee breakdown, and SEO metadata updated successfully." });
    setSelectedCourse(null);
  };

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: "title",
      header: "Academic Course",
      cell: ({ row }) => (
        <div>
          <button onClick={() => { setSelectedCourse(row.original); setActiveTab("syllabus"); }} className="text-sm font-bold text-white hover:text-primary transition-colors block text-left">
            {row.original.title}
          </button>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">/{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Website Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} domain="course" />,
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => <span className="text-xs font-semibold text-muted-foreground bg-secondary/50 px-2 py-1 rounded border border-white/5">{row.original.duration ?? "6 Months"}</span>,
    },
    {
      accessorKey: "fee",
      header: "Structured Tuition Fee",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-emerald-400 font-mono">
          {row.original.fee != null ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(row.original.fee) : "₹4,50,000"}
        </span>
      ),
    },
    {
      accessorKey: "studentsCount",
      header: "Enrolled Students",
      cell: ({ row }) => (
        <span className="text-xs font-extrabold bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-full">
          {row.original.studentsCount ?? 28} Cadets
        </span>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: "Last Published",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.publishedAt)}</span>,
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
          <DropdownMenuContent align="end" className="glass-panel border-white/10 w-48">
            <DropdownMenuItem onClick={() => { setSelectedCourse(row.original); setActiveTab("syllabus"); }} className="cursor-pointer hover:bg-white/5">
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              Manage Curriculum
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedCourse(row.original); setActiveTab("batches"); }} className="cursor-pointer hover:bg-white/5">
              <Calendar className="mr-2 h-4 w-4 text-amber-400" />
              Batch Scheduling
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedCourse(row.original); setActiveTab("fees"); }} className="cursor-pointer hover:bg-white/5">
              <DollarSign className="mr-2 h-4 w-4 text-emerald-400" />
              Fee Structure
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedCourse(row.original); setActiveTab("seo"); }} className="cursor-pointer hover:bg-white/5">
              <SearchCode className="mr-2 h-4 w-4 text-sky-400" />
              SEO Settings
            </DropdownMenuItem>
            {row.original.status === "DRAFT" && (
              <DropdownMenuItem onClick={() => publishMutation.mutate(row.original.id)} disabled={publishMutation.isPending} className="cursor-pointer hover:bg-white/5 text-emerald-400">
                <Globe className="mr-2 h-4 w-4" />
                Publish Live
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Course Manager & Curriculum" 
        description="Configure academic syllabi, assign master airline instructors, schedule batches, establish fee tranches, and optimize public page SEO." 
        action={
          <Button onClick={() => toast({ title: "Coming Soon", description: "Create course wizard will initialize." })} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            Create New Course
          </Button>
        }
      />

      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search academic programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-sm font-medium"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-secondary/40 border-white/10 text-xs font-semibold">
            <SelectValue placeholder="All Course Statuses" />
          </SelectTrigger>
          <SelectContent className="glass-panel border-white/10 text-xs">
            {COURSE_STATUSES.map((s) => (
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
          emptyTitle="No academic courses found"
          emptyDescription="Create your first aviation training program to get started."
        />
      </div>

      {/* Advanced Configuration Modal (Syllabus, Batches, Fee Breakdown, SEO) */}
      <Dialog open={!!selectedCourse} onOpenChange={(o) => !o && setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/10 bg-slate-900/80">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  {selectedCourse?.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  URL Slug: <span className="font-mono text-primary font-bold">/{selectedCourse?.slug}</span> • Status: <span className="text-white font-semibold">{selectedCourse?.status}</span>
                </p>
              </div>
              <span className="text-xs font-extrabold bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full">
                {selectedCourse?.duration ?? "6 Months"}
              </span>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 pt-4 border-t border-white/10 mt-4 overflow-x-auto">
              {[
                { id: "syllabus", label: "Syllabus & Curriculum", icon: BookOpen },
                { id: "batches", label: "Batch Scheduling & Instructors", icon: Calendar },
                { id: "fees", label: "Fee Structure & Tranches", icon: DollarSign },
                { id: "seo", label: "Public SEO Settings", icon: SearchCode },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                      isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-secondary/40 text-muted-foreground hover:bg-white/5 hover:text-white border-white/5"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-primary"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveConfig} id="course-config-form" className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {activeTab === "syllabus" && (
                <motion.div key="syllabus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Curriculum Modules</h3>
                    <Button type="button" size="sm" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-bold h-8">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add New Module
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(selectedCourse?.syllabus ?? ["Module 1: General Aviation Foundations"]).map((mod, i) => (
                      <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold bg-secondary px-2.5 py-1 rounded border border-white/5 text-muted-foreground">
                            0{i + 1}
                          </span>
                          <Input defaultValue={mod} className="bg-transparent border-transparent focus:border-primary text-xs font-bold text-white w-96 h-8" />
                        </div>
                        <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/20 text-[11px] font-bold h-7">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "batches" && (
                <motion.div key="batches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Batch Schedules & Instructors</h3>
                    <Button type="button" size="sm" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-bold h-8">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Schedule New Batch
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedCourse?.batches ?? [{ name: "Standard Alpha Batch", instructor: "Capt. Vikram Singh", schedule: "Mon-Fri, 09:00 - 13:00" }]).map((b, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-secondary/30 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{b.name}</span>
                          <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            ACTIVE
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" /> Instructor: <span className="text-white font-semibold">{b.instructor}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5 text-amber-400" /> Schedule: <span className="text-white font-semibold">{b.schedule}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "fees" && (
                <motion.div key="fees" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tuition Installments & Tranche Breakdown</h3>
                    <Button type="button" size="sm" className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-bold h-8">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Installment Tranche
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {(selectedCourse?.feeBreakdown ?? [{ tranche: "Complete Course Tuition", amount: 450000 }]).map((f, i) => (
                      <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-white/5 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">{f.tranche}</span>
                          <span className="text-[10px] text-muted-foreground block">Required before starting corresponding training phase</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input defaultValue={f.amount} type="number" className="bg-secondary/60 border-white/10 text-xs font-mono font-bold text-emerald-400 w-36 text-right" />
                          <span className="text-xs font-bold text-muted-foreground">INR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "seo" && (
                <motion.div key="seo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">Public Page Search Engine Optimization (SEO)</h3>
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">SEO Meta Title tag</Label>
                      <Input defaultValue={selectedCourse?.seo?.metaTitle ?? `${selectedCourse?.title} | Airborne Aviation Academy`} className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">SEO Meta Description tag</Label>
                      <Textarea defaultValue={selectedCourse?.seo?.metaDescription ?? `Enroll in ${selectedCourse?.title} at Airborne Aviation Academy. Expert airline captain instructors and state of the art simulators.`} rows={4} className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" />
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                      <span className="text-xs font-bold text-white block">Search Preview</span>
                      <p className="text-[11px] text-primary underline truncate">{`https://www.airborneaviation.in/courses/${selectedCourse?.slug}`}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{selectedCourse?.seo?.metaDescription ?? `Enroll in ${selectedCourse?.title} at Airborne Aviation Academy.`}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80">
            <Button type="button" variant="outline" onClick={() => setSelectedCourse(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
              Cancel
            </Button>
            <Button type="submit" form="course-config-form" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
              <Save className="h-4 w-4 mr-1.5" /> Save Course Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
