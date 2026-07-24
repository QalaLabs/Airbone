"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Award, Download, ExternalLink, ShieldCheck, Copy } from "lucide-react";
import Link from "next/link";
import type { MePayload } from "@/components/portal/types";
import { CardSkeleton } from "@/components/portal/portal-skeleton";
import { toast } from "@/components/ui/use-toast";

export default function PortalCertificatesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["lms-me"],
    queryFn: () => apiFetch<MePayload>("/lms/me"),
  });

  const certs = data?.certificates ?? [];

  function copyToClipboard(text: string, label: string) {
    void navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${label} copied`, description: text });
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">
          My Achievements
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">Certificates</h1>
        <p className="mt-1 text-sm text-white/50">
          Your issued course completion certificates from Airborne Aviation
        </p>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} className="h-52" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && certs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 p-14 text-center">
          <Award className="mx-auto h-14 w-14 text-white/10" aria-hidden="true" />
          <p className="mt-4 text-lg font-semibold text-white/60">No certificates yet</p>
          <p className="mt-2 text-sm text-white/35 max-w-sm mx-auto">
            Complete your enrolled course modules and pass all assessments to earn your certificate.
          </p>
        </div>
      )}

      {/* Certificate cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {certs.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.06] to-[#0a1a30] p-5"
          >
            {/* Card header */}
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20">
                <Award className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white leading-tight">{c.title}</p>
                {c.course?.title && (
                  <p className="mt-0.5 text-xs text-white/50">{c.course.title}</p>
                )}
                {c.issuedAt && (
                  <p className="mt-1 text-[11px] text-white/35">
                    Issued{" "}
                    {new Date(c.issuedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Certificate details */}
            <div className="mt-4 space-y-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-[11px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/40">Certificate No.</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-white/80">{c.certificateNo}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(c.certificateNo, "Certificate number")}
                    aria-label="Copy certificate number"
                    className="rounded p-0.5 text-white/30 hover:text-white/70 transition-colors"
                  >
                    <Copy className="h-3 w-3" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {c.verificationCode && c.verificationCode !== c.certificateNo && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white/40">Verification Code</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-white/80">{c.verificationCode}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(c.verificationCode!, "Verification code")}
                      aria-label="Copy verification code"
                      className="rounded p-0.5 text-white/30 hover:text-white/70 transition-colors"
                    >
                      <Copy className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/40">Status</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider text-emerald-400">
                  {c.status}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              {c.fileUrl && (
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  Download
                </a>
              )}
              <Link
                href={`/portal/certificates/${c.certificateNo}/print`}
                target="_blank"
                className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70 hover:bg-white/5 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                View / Print
              </Link>
              <a
                href={`/verify/${encodeURIComponent(c.verificationCode ?? c.certificateNo)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 px-3 py-2 text-xs text-emerald-400/80 hover:bg-emerald-500/10 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Verify
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
