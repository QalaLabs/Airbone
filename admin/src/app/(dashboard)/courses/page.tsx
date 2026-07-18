"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Search, Globe, MoreHorizontal, Eye, Plus, BookOpen, Users, Calendar, DollarSign, SearchCode, CheckCircle2, SlidersHorizontal, Save, GraduationCap, Trash2, Loader2 } from "lucide-react";
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
  subtitle?: string;
  description?: string;
  status: string;
  category?: string;
  duration?: string;
  fee?: number;
  studentsCount?: number;
  publishedAt?: string;
  createdAt: string;
  curriculum?: any;
  seoTitle?: string;
  seoDesc?: string;
  metadata?: any;
}

interface CoursesResponse {
  items: Course[];
  total: number;
  totalPages: number;
}

const COURSE_STATUSES = ["", "DRAFT", "PUBLISHED", "ARCHIVED"];

export default function CoursesPage() {
  const queryClient = useQueryClient();
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("syllabus");

  // Create course form state
  const [newCourse, setNewCourse] = React.useState({
    title: "",
    slug: "",
    duration: "6 Months",
    fee: 450000,
    category: "Ground School",
    description: "",
    status: "DRAFT",
  });

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch courses
  const { data, isLoading } = useQuery<CoursesResponse>({
    queryKey: ["courses", pagination, debouncedSearch, statusFilter],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      return apiFetch<CoursesResponse>(`/courses?${p}`);
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: any) => apiFetch<Course>("/courses", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course Created", description: "The new academic program has been added to CRM." });
      setCreateOpen(false);
      setNewCourse({
        title: "",
        slug: "",
        duration: "6 Months",
        fee: 450000,
        category: "Ground School",
        description: "",
        status: "DRAFT",
      });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => 
      apiFetch<Course>(`/courses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course Updated", description: "Course configurations saved successfully." });
      setSelectedCourse(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/courses/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast({ title: "Course Deleted", description: "Course permanently removed." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = newCourse.slug || newCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    createMutation.mutate({
      ...newCourse,
      slug,
      fee: Number(newCourse.fee),
    });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    updateMutation.mutate({
      id: selectedCourse.id,
      body: {
        title: selectedCourse.title,
        duration: selectedCourse.duration,
        fee: Number(selectedCourse.fee),
        curriculum: selectedCourse.curriculum || [],
        seoTitle: selectedCourse.seoTitle || selectedCourse.title,
        seoDesc: selectedCourse.seoDesc || selectedCourse.description,
        metadata: selectedCourse.metadata || {},
      },
    });
  };

  const updateCurriculumModule = (index: number, val: string) => {
    if (!selectedCourse) return;
    const curr = [...(selectedCourse.curriculum || [])];
    if (curr[index]) {
      curr[index].module = val;
    } else {
      curr[index] = { module: val, topics: [] };
    }
    setSelectedCourse(prev => prev ? { ...prev, curriculum: curr } : null);
  };

  const addCurriculumModule = () => {
    if (!selectedCourse) return;
    const curr = [...(selectedCourse.curriculum || []), { module: "New Module Title", topics: [] }];
    setSelectedCourse(prev => prev ? { ...prev, curriculum: curr } : null);
  };

  const removeCurriculumModule = (index: number) => {
    if (!selectedCourse) return;
    const curr = (selectedCourse.curriculum || []).filter((_: any, i: number) => i !== index);
    setSelectedCourse(prev => prev ? { ...prev, curriculum: curr } : null);
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
          {row.original.fee != null ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(row.original.fee) : "—"}
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
          <DropdownMenuContent align="end" className="glass-panel border-white/10 w-48 text-white">
            <DropdownMenuItem onClick={() => { setSelectedCourse(row.original); setActiveTab("syllabus"); }} className="cursor-pointer hover:bg-white/5">
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              Manage Curriculum
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSelectedCourse(row.original); setActiveTab("seo"); }} className="cursor-pointer hover:bg-white/5">
              <SearchCode className="mr-2 h-4 w-4 text-sky-400" />
              SEO Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { if (confirm("Delete this course?")) deleteMutation.mutate(row.original.id); }} className="cursor-pointer hover:bg-white/5 text-rose-400">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Course
            </DropdownMenuItem>
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
              className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-sm font-medium text-white"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 bg-secondary/40 border-white/10 text-xs font-semibold text-white">
            <SelectValue placeholder="All Course Statuses" />
          </SelectTrigger>
          <SelectContent className="glass-panel border-white/10 text-xs text-white">
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

      {/* Create Course Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="glass-panel border-white/10 bg-slate-900/95 p-6 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Create New Course
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCourse} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Course Title *</Label>
              <Input
                value={newCourse.title}
                onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                required
                className="bg-secondary/40 border-white/10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">URL Slug (leave blank to auto-generate)</Label>
              <Input
                value={newCourse.slug}
                onChange={(e) => setNewCourse(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") }))}
                className="bg-secondary/40 border-white/10 text-xs text-primary font-bold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <Input
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                  className="bg-secondary/40 border-white/10 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tuition Fee (INR)</Label>
                <Input
                  type="number"
                  value={newCourse.fee}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, fee: Number(e.target.value) }))}
                  className="bg-secondary/40 border-white/10 text-xs font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Course Category</Label>
              <Input
                value={newCourse.category}
                onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
                className="bg-secondary/40 border-white/10 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <select
                value={newCourse.status}
                onChange={(e) => setNewCourse(prev => ({ ...prev, status: e.target.value }))}
                className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="DRAFT" className="bg-slate-900 text-amber-400">DRAFT (IN PROGRESS)</option>
                <option value="PUBLISHED" className="bg-slate-900 text-emerald-400">PUBLISHED (LIVE)</option>
              </select>
            </div>
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold">
                {createMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create Program"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Advanced Configuration Modal */}
      <Dialog open={!!selectedCourse} onOpenChange={(o) => !o && setSelectedCourse(null)}>
        <DialogContent className="max-w-4xl glass-panel border-white/10 bg-slate-900/95 p-0 overflow-hidden text-white">
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

          <form onSubmit={handleSaveConfig} id="course-config-form" className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === "syllabus" && (
                <motion.div key="syllabus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Curriculum Modules</h3>
                    <Button type="button" size="sm" onClick={addCurriculumModule} className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-xs font-bold h-8">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add New Module
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {((selectedCourse?.curriculum as any[]) ?? []).map((mod, i) => (
                      <div key={i} className="p-4 rounded-xl bg-secondary/30 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-extrabold bg-secondary px-2.5 py-1 rounded border border-white/5 text-muted-foreground">
                            0{i + 1}
                          </span>
                          <Input 
                            value={mod.module || ""} 
                            onChange={(e) => updateCurriculumModule(i, e.target.value)}
                            className="bg-transparent border-transparent focus:border-primary text-xs font-bold text-white w-96 h-8 focus:bg-secondary/60 focus:px-3 focus:rounded-lg" 
                          />
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeCurriculumModule(i)} className="text-destructive hover:bg-destructive/20 text-[11px] font-bold h-7">
                          Remove
                        </Button>
                      </div>
                    ))}
                    {(!selectedCourse?.curriculum || (selectedCourse.curriculum as any[]).length === 0) && (
                      <div className="text-xs text-muted-foreground py-8 text-center">No syllabus modules defined. Click "Add New Module" to start structuring the program.</div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "seo" && (
                <motion.div key="seo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">Public Page Search Engine Optimization (SEO)</h3>
                  <div className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">SEO Meta Title tag</Label>
                      <Input 
                        value={selectedCourse?.seoTitle || ""} 
                        onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, seoTitle: e.target.value } : null)}
                        className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-muted-foreground">SEO Meta Description tag</Label>
                      <Textarea 
                        value={selectedCourse?.seoDesc || ""} 
                        onChange={(e) => setSelectedCourse(prev => prev ? { ...prev, seoDesc: e.target.value } : null)}
                        rows={4} 
                        className="bg-secondary/40 border-white/10 text-xs font-medium text-white leading-relaxed" 
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                      <span className="text-xs font-bold text-white block">Search Preview</span>
                      <p className="text-[11px] text-primary underline truncate">{`https://www.airborneaviation.in/courses/${selectedCourse?.slug}`}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{selectedCourse?.seoDesc || "Meta description details will render here."}</p>
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
            <Button type="submit" form="course-config-form" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
              {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" /> Save Course Configuration</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
