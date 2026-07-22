"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef, type PaginationState, type SortingState } from "@tanstack/react-table";
import { Search, MoreHorizontal, ExternalLink, AlertCircle } from "lucide-react";
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

interface Resource {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  fileUrl?: string;
  downloadCount?: number;
  publishedAt?: string;
  createdAt: string;
}

interface ResourcesResponse {
  data: Resource[];
  total: number;
}

const RESOURCE_STATUSES = ["all", "DRAFT", "PUBLISHED", "ARCHIVED"];
const RESOURCE_TYPES = ["all", "PDF", "VIDEO", "DOCUMENT", "LINK", "IMAGE", "OTHER"];

export default function ResourcesPage() {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 20 });
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["resources", pagination, sorting, debouncedSearch, statusFilter, typeFilter],
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
        ...(typeFilter && typeFilter !== "all" ? { type: typeFilter } : {}),
      });
      return apiFetch<ResourcesResponse>(`/resources?${p}`);
    },
  });

  const columns: ColumnDef<Resource>[] = [
    {
      accessorKey: "title",
      header: "Resource",
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.original.title}</p>
          <p className="text-xs text-muted-foreground">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} domain="resource" />,
    },
    {
      accessorKey: "downloadCount",
      header: "Downloads",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.downloadCount ?? 0}</span>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: "Published",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.publishedAt)}</span>
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
            {row.original.fileUrl && (
              <DropdownMenuItem asChild>
                <a href={row.original.fileUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Resource
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Resources" description={`${data?.total ?? 0} total resources`} />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s === "all" ? "All Statuses" : s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            {RESOURCE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{t === "all" ? "All Types" : t.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-400" />
          <div>
            <h3 className="text-base font-bold text-white">Failed to Load Resources</h3>
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
          data={data?.data ?? []}
          loading={isLoading}
          pageCount={data?.total ? Math.ceil(data.total / pagination.pageSize) : 0}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          emptyTitle="No resources found"
          emptyDescription="Upload your first resource to get started."
        />
      )}
    </div>
  );
}
