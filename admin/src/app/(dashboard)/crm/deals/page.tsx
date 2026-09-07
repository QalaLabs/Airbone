"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DollarSign, CheckCircle2, TrendingDown, Layers, RotateCcw, ArrowRight, X, UserPlus } from "lucide-react";
import { getDeals, updateDeal, assignDeal, convertDealToAdmission, revertDealToProspect, getDealsData } from "@/lib/crm/deals";
import type { DealRecord, DealData } from "@/lib/crm/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

function formatINR(val: number): string {
  if (!isFinite(val)) return "₹0";
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

function dealValue(d: DealRecord): number {
  const v = typeof d.value === "string" ? Number(d.value) : d.value;
  return isFinite(v ?? NaN) ? (v ?? 0) : 0;
}

const stageOrder = [
  "ENQUIRY",
  "DOCUMENT_COLLECTION",
  "VERIFICATION",
  "OFFER_LETTER",
  "FEE_PAYMENT",
  "ENROLLED",
  "DROPPED",
  "CANCELLED",
];

const stageColor: Record<string, string> = {
  ENQUIRY: "bg-blue-500",
  DOCUMENT_COLLECTION: "bg-purple-500",
  VERIFICATION: "bg-indigo-500",
  OFFER_LETTER: "bg-amber-500",
  FEE_PAYMENT: "bg-orange-500",
  ENROLLED: "bg-emerald-500",
  DROPPED: "bg-red-500",
  CANCELLED: "bg-red-500",
};

const nextStage: Record<string, string> = {
  ENQUIRY: "DOCUMENT_COLLECTION",
  DOCUMENT_COLLECTION: "VERIFICATION",
  VERIFICATION: "OFFER_LETTER",
  OFFER_LETTER: "FEE_PAYMENT",
  FEE_PAYMENT: "ENROLLED",
};

async function fetchCounselors(): Promise<{ id: string; name: string; email: string }[]> {
  try {
    const res = await fetch("/api/v1/users?role=ADMISSIONS_COUNSELOR&limit=100", { credentials: "include" });
    if (!res.ok) return [];
    const payload = (await res.json()) as { data?: unknown };
    const list = (payload.data ?? payload) as unknown as { id: string; name: string; email: string }[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function statusOf(d: DealRecord): "open" | "won" | "lost" {
  if (d.lostAt) return "lost";
  if (d.wonAt) return "won";
  return "open";
}

export default function CRMDealsPage() {
  const router = useRouter();
  const [summary, setSummary] = React.useState<DealData | null>(null);
  const [deals, setDeals] = React.useState<DealRecord[]>([]);
  const [counselors, setCounselors] = React.useState<{ id: string; name: string; email: string }[]>([]);
  const [stageFilter, setStageFilter] = React.useState<string>("ALL");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      const [summaryData, list] = await Promise.all([
        getDealsData(),
        getDeals({ limit: 100, sortBy: "updatedAt", sortDir: "desc", ...(stageFilter !== "ALL" ? { stage: stageFilter } : {}), ...(search ? { search } : {}) }),
      ]);
      setSummary(summaryData);
      setDeals(list.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [stageFilter, search]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    void fetchCounselors().then(setCounselors);
  }, []);

  const action = async (fn: () => Promise<unknown>) => {
    setBusyId("all");
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  };

  const pipeline = summary?.pipeline;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white">Deals</h1>
          <p className="text-sm text-muted-foreground">Real pipeline from the Deal/opportunity entity</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search lead / deal…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 bg-card border-white/10 text-white text-sm"
          />
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40 bg-card border-white/10 text-white text-sm">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All stages</SelectItem>
              {stageOrder.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {note && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
          {note}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Open Pipeline</p>
              <p className="text-2xl font-bold text-white mt-1">{pipeline?.open ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{formatINR(pipeline?.openValue ?? 0)}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Won</p>
              <p className="text-2xl font-bold text-white mt-1">{pipeline?.won ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{formatINR(pipeline?.wonValue ?? 0)} value</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Lost</p>
              <p className="text-2xl font-bold text-white mt-1">{pipeline?.lost ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{formatINR(pipeline?.lostValue ?? 0)} value</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/10 shadow-lg">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Stage Coverage</p>
              <p className="text-2xl font-bold text-white mt-1">{pipeline?.byStage?.length ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Layers className="h-3 w-3" /> funnel stages with deals
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/10">
              <Layers className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="p-6 text-white text-xs">Loading deals pipeline…</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...stageOrder].map((stage) => {
            const stageDeals = deals.filter((d) => d.stage === stage);
            if (stageDeals.length === 0 && stage !== "ENQUIRY") return null;
            return (
              <Card key={stage} className="bg-card border-white/10 shadow-lg min-w-0">
                <CardHeader className={`border-b border-white/5 pb-3 flex flex-row items-center justify-between`}>
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${stageColor[stage] || "bg-gray-500"}`} />
                    {stage}
                  </CardTitle>
                  <Badge className="bg-white/5 text-white border-white/10">{stageDeals.length}</Badge>
                </CardHeader>
                <CardContent className="pt-3 p-0">
                  <ScrollArea className="h-72">
                    <div className="space-y-2 p-3">
                      {stageDeals.length === 0 && (
                        <p className="text-[11px] text-muted-foreground px-1">No deals in this stage yet.</p>
                      )}
                      {stageDeals.map((d) => {
                        const st = statusOf(d);
                        return (
                          <div key={d.id} className={`rounded-lg border border-white/10 bg-white/5 p-3 space-y-2 ${st === "lost" ? "opacity-70" : ""}`}>
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-white leading-tight truncate">{d.title}</p>
                              {st === "won" && <Badge className="bg-emerald-500 text-white border-none text-[9px]">WON</Badge>}
                              {st === "lost" && <Badge className="bg-red-500 text-white border-none text-[9px]">LOST</Badge>}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {d.lead?.name} · {d.lead?.phone ?? "—"}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-white">{formatINR(dealValue(d))}</span>
                              <span className="text-[10px] text-muted-foreground">{d.counselor?.name ?? "Unassigned"}</span>
                            </div>
                            {st === "won" && (
                              <p className="text-[10px] text-emerald-300">
                                {d.admission ? `Linked ${d.admission.applicationNo}` : "Converted"} · won {d.wonAt ? new Date(d.wonAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : ""}
                              </p>
                            )}
                            {st === "lost" && (
                              <p className="text-[10px] text-red-300 truncate">{d.lostReason || "Lost"}</p>
                            )}
                            {st === "open" && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {nextStage[d.stage] && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 text-[10px] border-white/10 text-white hover:bg-white/10"
                                    disabled={busyId === d.id || busyId === "all"}
                                    onClick={() =>
                                      action(async () => {
                                        if (nextStage[d.stage] === "ENROLLED") {
                                          const r = await convertDealToAdmission(d.id, {});
                                          setNote(
                                            r.created
                                              ? `Application ${r.admission.applicationNo} created`
                                              : `Linked existing application ${r.admission.applicationNo}`,
                                          );
                                          router.push(`/admissions?id=${r.admission.id}`);
                                          return;
                                        }
                                        await updateDeal(d.id, { stage: nextStage[d.stage] as never });
                                        setNote(`${d.title} moved to ${nextStage[d.stage]}`);
                                      })
                                    }
                                  >
                                    <ArrowRight className="h-3 w-3" /> {nextStage[d.stage]}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                                  disabled={busyId === d.id || busyId === "all"}
                                  onClick={() =>
                                    action(async () => {
                                      const r = await convertDealToAdmission(d.id, {});
                                      setNote(r.created ? `Application ${r.admission.applicationNo} created` : `Linked existing application ${r.admission.applicationNo}`);
                                    })
                                  }
                                >
                                  Convert
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 text-[10px] border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                                  disabled={busyId === d.id || busyId === "all"}
                                  onClick={() =>
                                    action(async () => {
                                      await revertDealToProspect(d.id, "Reverted to prospect from CRM pipeline");
                                      setNote(`${d.title} moved back to Prospect`);
                                    })
                                  }
                                >
                                  <RotateCcw className="h-3 w-3" /> To Prospect
                                </Button>
                                {counselors.length > 0 && (
                                  <div className="flex-1 min-w-0">
                                    <Select
                                      value={d.assignedTo ?? "__unassigned__"}
                                      onValueChange={(v) => {
                                        if (v !== "__unassigned__") {
                                          void action(async () => {
                                            await assignDeal(d.id, v);
                                            setNote(`${d.title} assigned`);
                                          });
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-6 text-[10px] bg-white/5 border-white/10 text-white">
                                        <UserPlus className="h-3 w-3 mr-1" />
                                        <SelectValue placeholder="Assign" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__unassigned__">Unassigned</SelectItem>
                                        {counselors.map((c) => (
                                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}