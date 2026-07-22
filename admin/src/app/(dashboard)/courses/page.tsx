"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Search, Globe, MoreHorizontal, Eye, Plus, BookOpen, Calendar, DollarSign, SearchCode, Save, AlertCircle, Trash2 } from "lucide-react";
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
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  category?: string;
  duration?: string;
  eligibility?: string;
  fee?: number;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  seoTitle?: string;
  seoDesc?: string;
  curriculum?: { module: string; topics: string[] }[];
  createdAt: string;
}

interface CoursesResponse {
  items: Course[];
  total: number;
  totalPages: number;
}

const COURSE_STATUSES = ["all", "DRAFT", "PUBLISHED", "ARCHIVED"];

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("syllabus");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["courses", pagination, debouncedSearch, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}),
      });
      return apiFetch<CoursesResponse>(`/courses?${p}`);
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

  // Mutate: Create Course
  const createMutation = useMutation({
    mutationFn: (body: Partial<Course>) => 
      apiFetch<Course>("/courses", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course Created Successfully", description: "The new academic training program has been added." });
      setCreateOpen(false);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  // Mutate: Update Course
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<Course> }) => 
      apiFetch<Course>(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course Configurations Saved", description: "Course configuration has been updated successfully." });
      setSelectedCourse(null);
    },
    onError: (err) => toast({ title: "Error Saving Course", description: err.message, variant: "destructive" }),
  });

  // Mutate: Delete Course
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/courses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course Deleted Successfully", description: "Course has been removed from database." });
      setSelectedCourse(null);
    },
    onError: (err) => toast({ title: "Error Deleting Course", description: err.message, variant: "destructive" }),
  });

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const duration = formData.get("duration") as string;
    const category = formData.get("category") as string;
    const feeStr = formData.get("fee") as string;
    const fee = feeStr ? parseFloat(feeStr) : undefined;
    const description = formData.get("description") as string;
    const status = formData.get("status") as Course["status"];

    createMutation.mutate({
      title,
      slug: slug || undefined,
      duration,
      category,
      fee,
      description,
      status: status || "DRAFT",
    });
  };

  const handleSaveConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const formData = new FormData(e.currentTarget);
    const seoTitle = formData.get("seoTitle") as string;
    const seoDesc = formData.get("seoDesc") as string;

    updateMutation.mutate({
      id: selectedCourse.id,
      body: {
        seoTitle: seoTitle || undefined,
        seoDesc: seoDesc || undefined,
      }
    });
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
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-panel border-white/10 w-40 text-xs">
            <DropdownMenuItem onClick={() => { setSelectedCourse(row.original); setActiveTab("syllabus"); }} className="cursor-pointer hover:bg-white/5">
              <Eye className="mr-2 h-4 w-4 text-primary" /> View Details
            </DropdownMenuItem>
            {row.original.status !== "PUBLISHED" && (
              <DropdownMenuItem onClick={() => publishMutation.mutate(row.original.id)} className="cursor-pointer hover:bg-white/5">
                <Globe className="mr-2 h-4 w-4 text-emerald-400" /> Go Live
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
        title="Academic Course Manager" 
        description="Configure academic syllabi, assign master airline instructors, schedule batches, establish fee tranches, and optimize public page SEO." 
        action={
          <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
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
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-400" />
          <div>
            <h3 className="text-base font-bold text-white">Failed to Load Courses</h3>
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
            emptyTitle="No academic courses found"
            emptyDescription="Create your first aviation training program to get started."
          />
        </div>
      )}

      {/* Create New Course Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create New Academic Course
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Course Title *</Label>
              <Input name="title" required placeholder="e.g. DGCA Commercial Pilot License (CPL)" className="bg-secondary/40 border-white/10 text-xs text-white" />
            </div>
            <div className="space-y-1.5">
              <Label>URL Slug (lowercase, alphanumeric with hyphens)</Label>
              <Input name="slug" placeholder="e.g. commercial-pilot-license" className="bg-secondary/40 border-white/10 text-xs text-white font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Duration (e.g. &quot;6 Months&quot;)</Label>
                <Input name="duration" placeholder="e.g. 6 Months" className="bg-secondary/40 border-white/10 text-xs text-white" />
              </div>
              <div className="space-y-1.5">
                <Label>Tuition Fee (INR)</Label>
                <Input name="fee" type="number" placeholder="e.g. 450000" className="bg-secondary/40 border-white/10 text-xs text-white" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input name="category" placeholder="e.g. Ground School" className="bg-secondary/40 border-white/10 text-xs text-white" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea name="description" placeholder="Provide course objectives and training phase breakdown..." rows={3} className="bg-secondary/40 border-white/10 text-xs text-white" />
            </div>
            <div className="space-y-1.5">
              <Label>Publishing Status</Label>
              <select name="status" className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none">
                <option value="DRAFT" className="bg-slate-900 text-amber-400">DRAFT (IN PROGRESS)</option>
                <option value="PUBLISHED" className="bg-slate-900 text-emerald-400">PUBLISHED (LIVE)</option>
              </select>
            </div>
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                {createMutation.isPending ? "Creating..." : "Create Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                  </div>
                  <div className="space-y-3">
                    {selectedCourse?.curriculum && selectedCourse.curriculum.length > 0 ? (
                      selectedCourse.curriculum.map((mod, i) => (
                        <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-white/5 space-y-2 group hover:border-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold bg-secondary px-2.5 py-1 rounded border border-white/5 text-muted-foreground">
                              0{i + 1}
                            </span>
                            <span className="text-xs font-semibold text-white">{mod.module}</span>
                          </div>
                          {mod.topics.length > 0 && (
                            <p className="text-[11px] text-muted-foreground pl-9">{mod.topics.join(", ")}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-4 text-center">No curriculum modules added yet.</p>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "batches" && (
                <motion.div key="batches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Batch Scheduling & Instructors</h3>
                  </div>
                  <p className="text-xs text-muted-foreground py-4 text-center">
                    Batch scheduling is not yet tracked in this system.
                  </p>
                </motion.div>
              )}

              {activeTab === "fees" && (
                <motion.div key="fees" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tuition Fee</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Total Course Fee</span>
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      {selectedCourse?.fee != null
                        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(selectedCourse.fee)
                        : "Not set"}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Per-installment tranche breakdown is not yet tracked in this system.
                  </p>
                </motion.div>
              )}

              {activeTab === "seo" && (
                <motion.div key="seo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">Public Page Search Engine Optimization (SEO)</h3>
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">SEO Meta Title tag</Label>
                      <Input name="seoTitle" defaultValue={selectedCourse?.seoTitle ?? `${selectedCourse?.title} | Airborne Aviation Academy`} className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">SEO Meta Description tag</Label>
                      <Textarea name="seoDesc" defaultValue={selectedCourse?.seoDesc ?? `Enroll in ${selectedCourse?.title} at Airborne Aviation Academy. Expert airline captain instructors and state of the art simulators.`} rows={4} className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" />
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                      <span className="text-xs font-bold text-white block">Search Preview</span>
                      <p className="text-[11px] text-primary underline truncate">{`https://www.airborneaviation.in/courses/${selectedCourse?.slug}`}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{selectedCourse?.seoDesc ?? `Enroll in ${selectedCourse?.title} at Airborne Aviation Academy.`}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <DialogFooter className="p-6 border-t border-white/10 bg-slate-900/80 flex items-center justify-between w-full">
            {selectedCourse && (
              <Button type="button" variant="destructive" onClick={() => { if (confirm("Are you sure you want to delete this course?")) { deleteMutation.mutate(selectedCourse.id); } }} disabled={deleteMutation.isPending} className="text-xs font-bold mr-auto">
                <Trash2 className="h-4 w-4 mr-1.5" /> Delete Course
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setSelectedCourse(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">
                Cancel
              </Button>
              <Button type="submit" form="course-config-form" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                <Save className="h-4 w-4 mr-1.5" /> {updateMutation.isPending ? "Saving..." : "Save Course Configuration"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
