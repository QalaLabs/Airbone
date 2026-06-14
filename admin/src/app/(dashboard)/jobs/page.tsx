"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Search, MoreHorizontal, Eye, Briefcase } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface Job {
  id: string;
  title: string;
  slug: string;
  status: string;
  jobType?: string;
  location?: string;
  hiringPartner?: { name: string };
  applicationCount?: number;
  postedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

interface JobsResponse {
  items: Job[];
  total: number;
  totalPages: number;
}

const JOB_STATUSES = ["", "DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"];

export default function JobsPage() {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", pagination, debouncedSearch, statusFilter],
    queryFn: () => {
      const p = new URLSearchParams({
        page: String(pagination.pageIndex + 1),
        limit: String(pagination.pageSize),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      return apiFetch<JobsResponse>(`/jobs?${p}`);
    },
  });

  const columns: ColumnDef<Job>[] = [
    {
      accessorKey: "title",
      header: "Job Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <Link
              href={`/jobs/${row.original.id}`}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {row.original.title}
            </Link>
            {row.original.hiringPartner && (
              <p className="text-xs text-muted-foreground">{row.original.hiringPartner.name}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} domain="job" />,
    },
    {
      accessorKey: "jobType",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.jobType?.replace(/_/g, " ") ?? "—"}</span>
      ),
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.location ?? "—"}</span>,
    },
    {
      accessorKey: "applicationCount",
      header: "Applications",
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {row.original.applicationCount ?? 0}
        </Badge>
      ),
    },
    {
      accessorKey: "expiresAt",
      header: "Expires",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.expiresAt)}</span>
      ),
    },
    {
      id: "actions",
      size: 50,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/jobs/${row.original.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Jobs" description={`${data?.total ?? 0} total job listings`} />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
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
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s || "All Statuses"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={isLoading}
        pageCount={data?.totalPages ?? 0}
        pagination={pagination}
        onPaginationChange={setPagination}
        emptyTitle="No jobs found"
        emptyDescription="Post your first job to get started."
      />
    </div>
  );
}
