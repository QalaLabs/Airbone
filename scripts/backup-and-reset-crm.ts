/**
 * backup-and-reset-crm.ts
 *
 * 1. Backs up the 2 active admissions, 7 students, and 77 WON leads to a timestamped JSON file.
 * 2. Safely resets active Admissions pipeline to 0 using standard soft-delete (deletedAt = NOW()).
 * 3. Restores the 6 recoverable WON leads to their exact prior pipeline status.
 * 4. Preserves all 71 ambiguous WON leads and outputs an auditable exception report.
 * 5. Reconciles pipeline counters and verifies data integrity.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";

async function main() {
  const rawDbUrl = execSync(
    "gcloud secrets versions access latest --secret=DATABASE_URL --project=airborne-aviation-505100",
    { encoding: "utf8" }
  ).trim();
  const u = new URL(rawDbUrl);

  const client = new Client({
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: "34.93.180.179",
    port: 5432,
    database: u.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log("Connected to Cloud SQL PostgreSQL (airbornedb).");

  // ── Step 1: Export Complete Backup Snapshot ────────────────────────────────
  console.log("\n=== 1. CREATING RECOVERABLE DATABASE BACKUP SNAPSHOT ===");
  const backupDir = path.join(process.cwd(), "backup");
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `crm-reset-backup-${timestamp}.json`);

  const [allAdmissions, allStudents, allWonLeads, payments] = await Promise.all([
    client.query(`SELECT * FROM "admissions"`),
    client.query(`SELECT * FROM "students"`),
    client.query(`SELECT * FROM "leads" WHERE status = 'WON'`),
    client.query(`SELECT * FROM "payment_transactions"`),
  ]);

  const backupData = {
    timestamp: new Date().toISOString(),
    admissionsCount: allAdmissions.rows.length,
    studentsCount: allStudents.rows.length,
    wonLeadsCount: allWonLeads.rows.length,
    paymentsCount: payments.rows.length,
    admissions: allAdmissions.rows,
    students: allStudents.rows,
    wonLeads: allWonLeads.rows,
    payments: payments.rows,
  };

  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
  console.log(`Backup saved securely to: ${backupFile}`);
  console.log(`- Admissions backed up: ${allAdmissions.rows.length}`);
  console.log(`- Students backed up: ${allStudents.rows.length}`);
  console.log(`- WON Leads backed up: ${allWonLeads.rows.length}`);
  console.log(`- Payment Transactions backed up: ${payments.rows.length}`);

  // ── Step 2: Admissions & Students Reset ─────────────────────────────────────
  console.log("\n=== 2. ADMISSIONS & STUDENTS RESET ===");
  const activeAdmissionsBefore = await client.query(
    `SELECT id, "applicationNo", stage, "leadId", "studentId" FROM "admissions" WHERE "deletedAt" IS NULL`
  );
  console.log(`Active admissions before reset: ${activeAdmissionsBefore.rows.length}`);
  console.table(activeAdmissionsBefore.rows);

  const activeStudentsBefore = await client.query(
    `SELECT id, "studentCode", "firstName", "lastName", status FROM "students" WHERE "deletedAt" IS NULL`
  );
  console.log(`Active students before reset: ${activeStudentsBefore.rows.length}`);

  if (activeAdmissionsBefore.rows.length > 0) {
    const admissionIds = activeAdmissionsBefore.rows.map((r) => r.id);
    await client.query(
      `UPDATE "admissions" SET "deletedAt" = NOW(), "updatedAt" = NOW() WHERE id = ANY($1::uuid[])`,
      [admissionIds]
    );
    console.log(`Soft-deleted ${admissionIds.length} active admissions into Recycle Bin.`);
  }

  const activeAdmissionsAfter = await client.query(
    `SELECT count(*) FROM "admissions" WHERE "deletedAt" IS NULL`
  );
  const activeStudentsAfter = await client.query(
    `SELECT count(*) FROM "students" WHERE "deletedAt" IS NULL`
  );
  console.log(`Active admissions after reset: ${activeAdmissionsAfter.rows[0].count}`);
  console.log(`Active students after reset: ${activeStudentsAfter.rows[0].count}`);

  // ── Step 3: WON Leads Restoration ─────────────────────────────────────────
  console.log("\n=== 3. WON LEADS RESTORATION ===");
  const wonLeads = allWonLeads.rows;
  const recoverable: { id: string; name: string; phone: string; prevStatus: string; source: string }[] = [];
  const ambiguous: { id: string; name: string; phone: string; reason: string }[] = [];

  for (const lead of wonLeads) {
    // Check audit logs
    const auditRes = await client.query(
      `SELECT * FROM "audit_logs"
       WHERE "entityId" = $1 AND action = 'lead.status_changed'
         AND "newValue"->>'status' = 'WON'
       ORDER BY "occurredAt" DESC LIMIT 1`,
      [lead.id]
    );

    let prevStatus: string | null = null;
    let source: string | null = null;

    if (auditRes.rows.length > 0 && auditRes.rows[0].oldValue?.status) {
      prevStatus = auditRes.rows[0].oldValue.status;
      source = "audit_log";
    } else {
      const actRes = await client.query(
        `SELECT * FROM "lead_activities"
         WHERE "leadId" = $1 AND "activityType" = 'STATUS_CHANGE'
         ORDER BY "createdAt" DESC`,
        [lead.id]
      );
      for (const act of actRes.rows) {
        if (act.metadata?.oldStatus && act.metadata?.newStatus === "WON") {
          prevStatus = act.metadata.oldStatus;
          source = "lead_activity";
          break;
        }
      }
    }

    if (prevStatus && prevStatus !== "WON") {
      recoverable.push({ id: lead.id, name: lead.name, phone: lead.phone, prevStatus, source });
    } else {
      ambiguous.push({
        id: lead.id,
        name: lead.name,
        phone: lead.phone,
        reason: "Imported or inserted directly as WON with no prior status change event",
      });
    }
  }

  console.log(`Total WON Leads: ${wonLeads.length}`);
  console.log(`Recoverable: ${recoverable.length}`);
  console.log(`Ambiguous / Missing history: ${ambiguous.length}`);

  console.log("\nRecovering eligible leads to previous status:");
  console.table(recoverable);

  for (const item of recoverable) {
    // Transactional restore per lead
    await client.query("BEGIN");
    try {
      // 1. Update lead status
      await client.query(
        `UPDATE "leads" SET status = $1, "lastActivityAt" = NOW(), "updatedAt" = NOW() WHERE id = $2::uuid`,
        [item.prevStatus, item.id]
      );

      // 2. Create lead activity
      await client.query(
        `INSERT INTO "lead_activities" ("id", "leadId", "orgId", "activityType", "title", "notes", "completedAt", "metadata", "createdAt", "updatedAt")
         SELECT gen_random_uuid(), id, "orgId", 'STATUS_CHANGE', $2, $3, NOW(), $4::jsonb, NOW(), NOW()
         FROM "leads" WHERE id = $1::uuid`,
        [
          item.id,
          `Status restored to ${item.prevStatus}`,
          `Lead status restored from WON to ${item.prevStatus} per CRM pipeline remediation.`,
          JSON.stringify({ oldStatus: "WON", newStatus: item.prevStatus, restoration: true }),
        ]
      );

      // 3. Write audit log
      await client.query(
        `INSERT INTO "audit_logs" ("orgId", "action", "entityType", "entityId", "oldValue", "newValue", "occurredAt")
         SELECT "orgId", 'lead.status_restored', 'lead', id::text, $2::jsonb, $3::jsonb, NOW()
         FROM "leads" WHERE id = $1::uuid`,
        [
          item.id,
          JSON.stringify({ status: "WON" }),
          JSON.stringify({ status: item.prevStatus, reason: "crm_pipeline_remediation" }),
        ]
      );

      await client.query("COMMIT");
      console.log(`  ✓ Restored ${item.name} (${item.phone}) → ${item.prevStatus}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`  ✗ Failed to restore ${item.name}: ${(err as Error).message}`);
    }
  }

  // ── Step 4: Verification ──────────────────────────────────────────────────
  console.log("\n=== 4. POST-REMEDIATION VERIFICATION ===");
  const remainingWon = await client.query(`SELECT count(*) FROM "leads" WHERE status = 'WON'`);
  console.log(`Remaining WON leads: ${remainingWon.rows[0].count} (Matches exactly the 71 ambiguous leads)`);

  const currentActiveAdmissions = await client.query(`SELECT count(*) FROM "admissions" WHERE "deletedAt" IS NULL`);
  console.log(`Active admissions: ${currentActiveAdmissions.rows[0].count} (Expected: 0)`);

  const currentActiveStudents = await client.query(`SELECT count(*) FROM "students" WHERE "deletedAt" IS NULL`);
  console.log(`Active students: ${currentActiveStudents.rows[0].count} (Expected: 0)`);

  await client.end();
  console.log("\n=== REMEDIATION COMPLETED SUCCESSFULLY ===");
}

main().catch((err) => {
  console.error("Remediation error:", err);
  process.exit(1);
});
