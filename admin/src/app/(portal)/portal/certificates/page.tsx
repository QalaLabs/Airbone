"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Award, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

interface MePayload {
  student: { firstName: string; lastName: string; studentCode: string };
  certificates: Array<{
    id: string;
    title: string;
    certificateNo: string;
    verificationCode?: string | null;
    issuedAt?: string | null;
    fileUrl?: string | null;
    status: string;
    course?: { title: string };
  }>;
}

export default function PortalCertificatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["lms-me"],
    queryFn: () => apiFetch<MePayload>("/lms/me"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Certificates</h1>
        <p className="mt-1 text-sm text-white/50">Your issued course completion certificates</p>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1,2].map((i) => <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/[0.03]" />)}
        </div>
      )}

      {!isLoading && (data?.certificates.length ?? 0) === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <Award className="mx-auto h-10 w-10 text-white/15" />
          <p className="mt-3 font-medium text-white/60">No certificates yet</p>
          <p className="mt-1 text-sm text-white/35">Complete your course assessments to earn a certificate.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.certificates.map((c) => (
          <div key={c.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                <Award className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{c.title}</p>
                <p className="mt-0.5 text-xs text-white/50">{c.course?.title}</p>
                <p className="mt-0.5 text-[11px] text-white/40">
                  Cert No: <span className="font-mono">{c.certificateNo}</span>
                </p>
                {c.issuedAt && (
                  <p className="text-[11px] text-white/40">
                    Issued: {new Date(c.issuedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {c.fileUrl && (
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              )}
              <Link
                href={`/portal/certificates/${c.certificateNo}/print`}
                target="_blank"
                className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View / Print
              </Link>
              <a
                href={`/verify/${encodeURIComponent(c.verificationCode ?? c.certificateNo)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-md border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
              >
                Verify
              </a>
            </div>

            {c.verificationCode && (
              <p className="mt-3 text-[10px] text-white/30">
                Verification code: <span className="font-mono">{c.verificationCode}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
