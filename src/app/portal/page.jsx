"use client";

import Link from "next/link";

const ADMIN_PORTAL =
  process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, "") || "http://localhost:4000";

/**
 * Marketing entry → Admin student portal (auth cookies live on Admin OS origin).
 */
export default function StudentPortalPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0b1f3a 0%, #122b4d 45%, #1a3a5c 100%)",
        color: "#f5f7fa",
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "48px 20px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <p style={{ letterSpacing: "0.2em", fontSize: 12, textTransform: "uppercase", opacity: 0.7 }}>
          Airborne Aviation
        </p>
        <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", margin: "12px 0 8px", fontWeight: 700 }}>
          Student Portal
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.5, opacity: 0.85, maxWidth: 560 }}>
          Sign in for courses, progress, attendance, certificates, and the study assistant.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href={`${ADMIN_PORTAL}/login?callbackUrl=/portal`}
            style={{
              display: "inline-block",
              padding: "12px 20px",
              background: "#c8102e",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 4,
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Student sign in
          </a>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 20px",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 4,
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
            }}
          >
            Back to website
          </Link>
        </div>
      </div>
    </main>
  );
}
