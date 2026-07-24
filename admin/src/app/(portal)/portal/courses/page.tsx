"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { ArrowRight } from "lucide-react";

interface MePayload {
  enrollments: Array<{
    id: string;
    course: { id: string; title: string; slug: string };
  }>;
}

export default function PortalCoursesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["lms-me"],
    queryFn: () => apiFetch<MePayload>("/lms/me"),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">My courses</h1>
      {isLoading && <p className="text-white/50">Loading…</p>}
      <div className="grid gap-3">
        {data?.enrollments.map((e) => (
          <Link
            key={e.id}
            href={`/portal/courses/${e.course.id}`}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 hover:bg-white/[0.07]"
          >
            <div>
              <p className="font-medium">{e.course.title}</p>
              <p className="text-xs text-white/45">Open course player</p>
            </div>
            <ArrowRight className="h-4 w-4 text-white/40" />
          </Link>
        ))}
      </div>
    </div>
  );
}
