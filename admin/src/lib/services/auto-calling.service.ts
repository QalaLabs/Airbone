import { prisma } from "@/lib/db/client";
import type { CallingJobStatus } from "@prisma/client";

export interface AutoCallResult {
  status: "dispatched" | "queued" | "skipped" | "failed";
  reason?: string;
  activityId?: string;
  jobId?: string;
  error?: string;
}

export interface CallEventPayload {
  providerCallId?: string;
  phone?: string;
  status: string; // e.g. ringing, answered, completed, hangup, missed, busy, no-answer, failed
  direction?: string;
  duration?: number;
  recordingUrl?: string;
  transcript?: string;
  summary?: string;
  classification?: string;
  bookingIntent?: string;
  userQuery?: string;
  courseInterest?: string;
}

export class AutoCallingService {
  /** Maximum number of simultaneous voice agent calls permitted at any moment */
  static readonly MAX_CONCURRENT_CALLS = 2;

  /** Maximum number of total call attempts permitted per candidate (initial attempt + up to 2 retries) */
  static readonly MAX_CALL_ATTEMPTS = 3;

  /** Minimum cool-off duration before retrying an unanswered lead (2 hours) */
  static readonly RETRY_COOL_OFF_MS = 2 * 60 * 60 * 1000;

  /** Safety expiration lease for active calls (15 mins) to prevent orphaned locks */
  static readonly ACTIVE_CALL_LEASE_MS = 15 * 60 * 1000;

  /** Non-callable statuses that must never receive an automated dial attempt */
  static readonly NON_CALLABLE_STATUSES = new Set([
    "TEST_LEAD",
    "OPTED_OUT",
    "DND",
    "LOST",
    "WON",
    "CONVERTED",
    "NOT_INTERESTED",
    "INVALID_NUMBER",
    "JOINED_OTHERS",
    "JOB_SEEKER",
  ]);

  /**
   * Returns current number of active calls for the organization.
   * Checks calling_jobs first (authoritative queue), with fallback to lead_activities.
   */
  static async getActiveCallsCount(orgId: string): Promise<number> {
    const activeThreshold = new Date(Date.now() - this.ACTIVE_CALL_LEASE_MS);
    
    // Check authoritative CallingJob queue
    const activeJobs = await prisma.callingJob.count({
      where: {
        orgId,
        status: { in: ["PROCESSING", "INITIATED", "RINGING", "ANSWERED"] as CallingJobStatus[] },
        updatedAt: { gte: activeThreshold },
      },
    });

    if (activeJobs > 0) return activeJobs;

    // Fallback to active lead activities if no calling_jobs exist yet
    return prisma.leadActivity.count({
      where: {
        orgId,
        activityType: "CALL",
        completedAt: null,
        outcome: { in: ["INITIATED", "IN_PROGRESS", "RINGING", "DISPATCHED"] },
        createdAt: { gte: activeThreshold },
      },
    });
  }

  /**
   * Checks whether the current time falls inside India Standard Time calling hours (09:00 - 20:00 IST).
   */
  static isCallingWindowOpen(now = new Date()): boolean {
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    const hour = istDate.getHours();
    return hour >= 9 && hour < 20;
  }

  /**
   * Calculates next timestamp when the calling window opens (09:00 IST).
   */
  static getNextWindowOpening(now = new Date()): Date {
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    const nextIST = new Date(istDate);
    if (istDate.getHours() >= 20) {
      nextIST.setDate(nextIST.getDate() + 1);
    }
    nextIST.setHours(9, 0, 0, 0);
    // Convert back to UTC
    const diff = nextIST.getTime() - istDate.getTime();
    return new Date(now.getTime() + diff);
  }

  /**
   * Normalizes raw phone to E.164 (+91XXXXXXXXXX for 10-digit Indian numbers).
   */
  static normalizePhone(rawPhone: string): string {
    const cleaned = rawPhone.replace(/[\s-]/g, "");
    if (cleaned.startsWith("+")) return cleaned;
    const digits = cleaned.replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    return `+${digits}`;
  }

  /**
   * Evaluates whether an unanswered candidate qualifies for an automated retry call.
   * Pure business logic method for easy testing and predictable execution.
   */
  static isEligibleForRetry(params: {
    totalCalls: number;
    hasConnectedCall: boolean;
    lastCallOutcome: string | null;
    lastCallCompleted: boolean;
    lastCallCreatedAt: Date;
    hasManualIntervention: boolean;
    nextFollowUp?: Date | null;
    now?: Date;
  }): { eligible: boolean; reason?: string } {
    if (params.totalCalls >= this.MAX_CALL_ATTEMPTS) {
      return { eligible: false, reason: "max_attempts_reached" };
    }
    if (params.hasConnectedCall) {
      return { eligible: false, reason: "already_connected" };
    }
    if (!params.lastCallCompleted) {
      return { eligible: false, reason: "call_in_progress" };
    }
    const unanswered = ["NO_ANSWER", "BUSY", "MISSED", "REJECTED", "FAILED", "UNREACHABLE", "EARLY_HANGUP"];
    if (!unanswered.includes(params.lastCallOutcome || "")) {
      return { eligible: false, reason: "last_call_not_unanswered" };
    }
    if (params.hasManualIntervention) {
      return { eligible: false, reason: "manual_agent_active" };
    }
    const currentTime = params.now || new Date();
    const isPastDue = params.nextFollowUp ? new Date(params.nextFollowUp) <= currentTime : false;
    const isCoolOffElapsed =
      currentTime.getTime() - new Date(params.lastCallCreatedAt).getTime() >= this.RETRY_COOL_OFF_MS;
    if (!isPastDue && !isCoolOffElapsed) {
      return { eligible: false, reason: "cool_off_period" };
    }
    return { eligible: true };
  }

  /**
   * Automatically schedules an outbound call for a newly created or updated eligible lead.
   * Persists a durable CallingJob in PostgreSQL to avoid the dual-write problem.
   * Dispatches immediately if within calling hours and under concurrency limit.
   */
  static async handleNewLead(orgId: string, leadId: string): Promise<AutoCallResult> {
    if (process.env.AUTO_CALLING_ENABLED === "false") {
      return { status: "skipped", reason: "auto_calling_disabled" };
    }

    const lead = await prisma.lead.findFirst({
      where: { id: leadId, orgId, deletedAt: null },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        city: true,
        state: true,
        status: true,
        source: true,
        courseInterest: true,
        customFields: true,
        doNotCall: true,
        autoCallingEnabled: true,
        callAttemptCount: true,
        createdAt: true,
      },
    });

    if (!lead) return { status: "skipped", reason: "lead_not_found" };
    if (!lead.phone) return { status: "skipped", reason: "no_phone" };
    if (lead.doNotCall) return { status: "skipped", reason: "do_not_call_enabled" };
    if (lead.autoCallingEnabled === false) return { status: "skipped", reason: "lead_auto_calling_disabled" };

    if (this.NON_CALLABLE_STATUSES.has(lead.status)) {
      return { status: "skipped", reason: `non_callable_status_${lead.status}` };
    }

    const targetPhone = this.normalizePhone(lead.phone);
    const idempotencyKey = `lead:${lead.id}:attempt:1`;

    // 1. Check or create durable CallingJob record
    let job = await prisma.callingJob.findUnique({
      where: {
        orgId_idempotencyKey: { orgId, idempotencyKey },
      },
    });

    if (job) {
      if (["COMPLETED", "INITIATED", "RINGING", "ANSWERED", "PROCESSING"].includes(job.status)) {
        return { status: "skipped", reason: "already_called_or_in_progress", jobId: job.id };
      }
    } else {
      job = await prisma.callingJob.create({
        data: {
          orgId,
          leadId: lead.id,
          provider: "telecmi",
          status: "QUEUED",
          phone: targetPhone,
          leadName: lead.name,
          courseInterest: lead.courseInterest,
          attemptCount: 1,
          maxAttempts: this.MAX_CALL_ATTEMPTS,
          idempotencyKey,
          scheduledAt: new Date(),
          leadCreatedAt: lead.createdAt,
          jobCreatedAt: new Date(),
        },
      });
    }

    // 2. Calling hours check (09:00 - 20:00 IST)
    if (!this.isCallingWindowOpen()) {
      const nextOpen = this.getNextWindowOpening();
      await prisma.callingJob.update({
        where: { id: job.id },
        data: {
          status: "QUEUED",
          scheduledAt: nextOpen,
          skipReason: "outside_calling_hours",
        },
      });

      // Update lead latest status
      await prisma.lead.update({
        where: { id: lead.id },
        data: { latestCallStatus: "QUEUED" },
      });

      return { status: "queued", reason: "outside_calling_hours", jobId: job.id };
    }

    // 3. Concurrency check: Agent must not exceed MAX_CONCURRENT_CALLS (2)
    const activeCalls = await this.getActiveCallsCount(orgId);
    if (activeCalls >= this.MAX_CONCURRENT_CALLS) {
      await prisma.callingJob.update({
        where: { id: job.id },
        data: {
          status: "QUEUED",
          skipReason: "concurrency_limit_reached",
        },
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: { latestCallStatus: "QUEUED" },
      });

      return { status: "queued", reason: "concurrency_limit_reached", jobId: job.id };
    }

    // 4. Concurrency slot available: dispatch outbound call immediately
    return await this.dispatchCallingJob(job, lead, targetPhone);
  }

  /**
   * Internal call dispatcher to the voice assistant microservice.
   * Atomically locks the CallingJob and measures lead-to-provider initiation latency.
   */
  static async dispatchCallingJob(
    job: any,
    lead: any,
    targetPhone: string,
    options?: { customNotes?: string }
  ): Promise<AutoCallResult> {
    const attempt = job.attemptCount || 1;
    const workerId = `worker-${process.pid}-${Date.now()}`;

    // Atomically claim and lock the job
    const locked = await prisma.callingJob.updateMany({
      where: {
        id: job.id,
        status: { in: ["QUEUED", "RETRY_SCHEDULED"] as CallingJobStatus[] },
      },
      data: {
        status: "PROCESSING",
        lockedAt: new Date(),
        lockedBy: workerId,
        jobStartedAt: new Date(),
      },
    });

    if (locked.count === 0 && job.status !== "PROCESSING") {
      return { status: "skipped", reason: "already_locked_or_processed", jobId: job.id };
    }

    const title =
      attempt > 1
        ? `AI Voice Agent Retry Call In Progress (Attempt ${attempt}/${this.MAX_CALL_ATTEMPTS})`
        : "AI Voice Agent Call In Progress";

    // Create or update LeadActivity record
    const activity = await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        orgId: job.orgId,
        activityType: "CALL",
        title,
        notes:
          options?.customNotes ||
          `Automated outbound AI voice call dispatched to ${targetPhone} for enquiry (${
            lead.courseInterest || "Pilot Training"
          }).`,
        outcome: "IN_PROGRESS",
        completedAt: null,
        metadata: {
          autoCall: true,
          callingJobId: job.id,
          isRetry: attempt > 1,
          retryAttempt: attempt,
          maxAttempts: this.MAX_CALL_ATTEMPTS,
          phone: targetPhone,
          candidate: lead.name,
          course: lead.courseInterest,
          dispatchedAt: new Date().toISOString(),
        },
      },
    });

    const voiceAssistantUrl =
      process.env.VOICE_ASSISTANT_URL || "https://airborne-voice-assistant-368523757732.asia-south1.run.app";
    const apiKey =
      process.env.VOICE_ASSISTANT_API_KEY ||
      process.env.API_SHARED_SECRET ||
      "AbvgRHR33ZOCqBb2tLsslaCL69qc3UJvC4FDGFl9t2A";

    const callPayload = {
      phone: targetPhone,
      name: lead.name || "Candidate",
      course_interest: lead.courseInterest || "Commercial Pilot License (CPL)",
      city: lead.city || undefined,
      notes:
        options?.customNotes ||
        `Automated lead qualification call. Course: ${lead.courseInterest || "CPL"}. Candidate: ${lead.name}`,
      call_objective:
        attempt > 1 ? "Follow-up qualification and callback scheduling" : "Lead qualification and counseling booking",
      custom_instructions:
        attempt > 1
          ? `Candidate previously did not answer (attempt ${attempt} of ${this.MAX_CALL_ATTEMPTS}). Warmly re-introduce Captain Navrang from Airborne Aviation.`
          : undefined,
      source: attempt > 1 ? "AI_AUTO_RETRY" : "AI_AUTO_DIALER",
      idempotency_key: job.idempotencyKey,
    };

    const providerRequestAt = new Date();
    await prisma.callingJob.update({
      where: { id: job.id },
      data: { providerRequestAt },
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${voiceAssistantUrl.replace(/\/$/, "")}/api/calls/dispatch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(callPayload),
        signal: controller.signal,
      });

      const resData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
      const providerAcceptedAt = new Date();

      if (!response.ok) {
        const errorMsg =
          (typeof resData?.message === "string" && resData.message) ||
          (typeof resData?.error === "string" && resData.error) ||
          `Voice assistant dispatch failed (${response.status})`;
        throw new Error(errorMsg);
      }

      // Compute P95 latency: leadCreatedAt (or jobCreatedAt) -> providerAcceptedAt
      const referenceStartTime = job.leadCreatedAt
        ? new Date(job.leadCreatedAt).getTime()
        : new Date(job.jobCreatedAt).getTime();
      const initiationLatencyMs = Math.max(0, providerAcceptedAt.getTime() - referenceStartTime);

      const providerCallId =
        (typeof resData?.request_id === "string" && resData.request_id) ||
        (typeof resData?.call_id === "string" && resData.call_id) ||
        null;

      // Update CallingJob to INITIATED
      await prisma.callingJob.update({
        where: { id: job.id },
        data: {
          status: "INITIATED",
          providerAcceptedAt,
          initiationLatencyMs,
          providerCallId,
          lastErrorCode: null,
          lastErrorMessage: null,
        },
      });

      // Update LeadActivity
      await prisma.leadActivity.update({
        where: { id: activity.id },
        data: {
          outcome: "IN_PROGRESS",
          metadata: {
            ...(activity.metadata as Record<string, unknown>),
            provider: resData?.provider || "telecmi",
            requestId: providerCallId,
            initiationLatencyMs,
            greeting: resData?.greeting || null,
          },
        },
      });

      // Update Lead state
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          latestCallStatus: "INITIATED",
          callAttemptCount: attempt,
          lastActivityAt: new Date(),
        },
      });

      return { status: "dispatched", activityId: activity.id, jobId: job.id };
    } catch (err: unknown) {
      const error = err as Error;

      // Update CallingJob on failure
      const willRetry = attempt < this.MAX_CALL_ATTEMPTS;
      const nextAttemptAt = willRetry ? new Date(Date.now() + this.RETRY_COOL_OFF_MS) : null;

      await prisma.callingJob.update({
        where: { id: job.id },
        data: {
          status: willRetry ? "RETRY_SCHEDULED" : "FAILED",
          lastErrorCode: "DISPATCH_FAILED",
          lastErrorMessage: error.message || String(err),
          nextAttemptAt,
          lockedAt: null,
          lockedBy: null,
        },
      });

      await prisma.leadActivity.update({
        where: { id: activity.id },
        data: {
          outcome: "FAILED",
          completedAt: new Date(),
          notes: `Call dispatch failure: ${error.message || String(err)}`,
        },
      });

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          latestCallStatus: willRetry ? "RETRY_SCHEDULED" : "FAILED",
          nextCallAt: nextAttemptAt,
        },
      });

      return { status: "failed", error: error.message, activityId: activity.id, jobId: job.id };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Dispatches a call given a lead ID and options (for backward compatibility).
   */
  static async dispatchCall(
    orgId: string,
    lead: any,
    targetPhone: string,
    options?: { attemptNumber?: number; customNotes?: string }
  ): Promise<AutoCallResult> {
    const attempt = options?.attemptNumber || 1;
    const idempotencyKey = `lead:${lead.id}:attempt:${attempt}`;

    let job = await prisma.callingJob.findUnique({
      where: { orgId_idempotencyKey: { orgId, idempotencyKey } },
    });

    if (!job) {
      job = await prisma.callingJob.create({
        data: {
          orgId,
          leadId: lead.id,
          provider: "telecmi",
          status: "QUEUED",
          phone: targetPhone,
          leadName: lead.name,
          courseInterest: lead.courseInterest,
          attemptCount: attempt,
          maxAttempts: this.MAX_CALL_ATTEMPTS,
          idempotencyKey,
          scheduledAt: new Date(),
          leadCreatedAt: lead.createdAt || new Date(),
        },
      });
    }

    return await this.dispatchCallingJob(job, lead, targetPhone, options);
  }

  /**
   * Synchronizes real-time call events from TeleCMI / Voice Assistant into the CRM.
   * Updates CallingJob, LeadActivity, and Lead records.
   * If a call completes or terminates, immediately triggers processQueue to dial next waiting lead.
   */
  static async handleCallEvent(orgId: string, payload: CallEventPayload): Promise<boolean> {
    const {
      providerCallId,
      phone,
      status,
      duration = 0,
      recordingUrl = "",
      transcript = "",
      summary = "",
      classification,
      bookingIntent,
      courseInterest,
    } = payload;

    const normalizedStatus = (status || "").toLowerCase();
    const cleanPhone = phone ? this.normalizePhone(phone) : "";

    // 1. Locate matching CallingJob
    let job = null;
    if (providerCallId) {
      job = await prisma.callingJob.findFirst({
        where: { orgId, providerCallId },
        include: { lead: true },
      });
    }
    if (!job && cleanPhone) {
      job = await prisma.callingJob.findFirst({
        where: {
          orgId,
          phone: cleanPhone,
          status: { in: ["INITIATED", "RINGING", "ANSWERED", "PROCESSING"] as CallingJobStatus[] },
        },
        orderBy: { createdAt: "desc" },
        include: { lead: true },
      });
    }

    const leadId = job?.leadId || (job?.lead?.id);
    const now = new Date();

    // 2. Map TeleCMI status to CallingJobStatus and CRM outcome
    if (normalizedStatus.includes("ring")) {
      if (job) {
        await prisma.callingJob.update({
          where: { id: job.id },
          data: { status: "RINGING", callStartedAt: now },
        });
      }
      if (leadId) {
        await prisma.lead.update({
          where: { id: leadId },
          data: { latestCallStatus: "RINGING" },
        });
      }
      return true;
    }

    if (normalizedStatus.includes("answer") || normalizedStatus === "connected") {
      if (job) {
        await prisma.callingJob.update({
          where: { id: job.id },
          data: { status: "ANSWERED", callAnsweredAt: now },
        });
      }
      if (leadId) {
        await prisma.lead.update({
          where: { id: leadId },
          data: { latestCallStatus: "ANSWERED" },
        });
      }
      return true;
    }

    // Call Completion / Disconnection / Failure
    const isSuccess = ["completed", "hangup", "end", "terminated"].includes(normalizedStatus) && duration > 8;
    const isEarlyHangup = ["completed", "hangup", "end", "terminated"].includes(normalizedStatus) && duration > 0 && duration <= 8;
    const isUnanswered = ["missed", "no-answer", "no_answer", "busy", "rejected", "failed", "cancelled", "unavailable"].includes(normalizedStatus);

    let finalOutcome = "COMPLETED";
    if (isEarlyHangup) finalOutcome = "EARLY_HANGUP";
    else if (normalizedStatus === "busy") finalOutcome = "BUSY";
    else if (isUnanswered) finalOutcome = "NO_ANSWER";

    const durationMins = maxMins(duration);

    // Resolve or schedule retry
    let nextAttemptAt: Date | null = null;
    let nextJobStatus: CallingJobStatus = "COMPLETED";

    if (isUnanswered || isEarlyHangup) {
      const currentAttempts = job?.attemptCount || 1;
      if (currentAttempts < this.MAX_CALL_ATTEMPTS) {
        nextJobStatus = "RETRY_SCHEDULED";
        nextAttemptAt = new Date(Date.now() + this.RETRY_COOL_OFF_MS);
      } else {
        nextJobStatus = "FAILED";
      }
    }

    // Update CallingJob
    if (job) {
      await prisma.callingJob.update({
        where: { id: job.id },
        data: {
          status: nextJobStatus,
          callCompletedAt: now,
          durationSecs: duration,
          callOutcome: finalOutcome,
          recordingUrl: recordingUrl || job.recordingUrl,
          transcript: transcript || job.transcript,
          summary: summary || job.summary,
          nextAttemptAt,
        },
      });
    }

    // Update or create LeadActivity (closes the in-progress call activity)
    if (leadId) {
      const inProgressActivity = await prisma.leadActivity.findFirst({
        where: {
          leadId,
          orgId,
          activityType: "CALL",
          completedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });

      const activityNotes =
        summary ||
        (isSuccess
          ? `AI Voice Call completed (${duration}s). ${classification ? `Classification: ${classification}.` : ""}`
          : `Call ${finalOutcome.toLowerCase()} (duration: ${duration}s).`);

      if (inProgressActivity) {
        await prisma.leadActivity.update({
          where: { id: inProgressActivity.id },
          data: {
            outcome: finalOutcome,
            completedAt: now,
            durationMins,
            notes: activityNotes,
            metadata: {
              ...(inProgressActivity.metadata as Record<string, unknown>),
              recordingUrl: recordingUrl || "",
              recording_url: recordingUrl || "",
              record_url: recordingUrl || "",
              gcs_recording_url: recordingUrl || "",
              transcript: transcript || "",
              durationSeconds: duration,
              classification: classification || "",
              bookingIntent: bookingIntent || "",
            },
          },
        });
      } else {
        await prisma.leadActivity.create({
          data: {
            leadId,
            orgId,
            activityType: "CALL",
            title: `AI Voice Call - ${finalOutcome.replace("_", " ")}`,
            notes: activityNotes,
            outcome: finalOutcome,
            completedAt: now,
            durationMins,
            metadata: {
              recordingUrl: recordingUrl || "",
              recording_url: recordingUrl || "",
              record_url: recordingUrl || "",
              gcs_recording_url: recordingUrl || "",
              transcript: transcript || "",
              durationSeconds: duration,
              classification: classification || "",
              bookingIntent: bookingIntent || "",
            },
          },
        });
      }

      // Update Lead commercial and calling metrics
      const updateLeadData: Record<string, any> = {
        latestCallStatus: nextJobStatus,
        latestCallOutcome: finalOutcome,
        lastCallAt: now,
        lastCallDuration: duration,
        lastActivityAt: now,
        lastCallSummary: summary || activityNotes,
      };

      if (nextAttemptAt) {
        updateLeadData.nextCallAt = nextAttemptAt;
        updateLeadData.status = "FOLLOW_UP";
      } else if (isSuccess) {
        if (classification === "Hot" || classification === "Warm" || bookingIntent) {
          updateLeadData.status = "INTERESTED";
        } else {
          updateLeadData.status = "CONTACTED";
        }
      }

      if (courseInterest) {
        updateLeadData.courseInterest = courseInterest;
      }

      await prisma.lead.update({
        where: { id: leadId },
        data: updateLeadData,
      });
    }

    // Call has concluded -> immediately drain waiting queued leads to minimize latency!
    try {
      await this.processQueue(orgId);
    } catch (drainErr) {
      console.error("[AutoCallingService.handleCallEvent] processQueue drain error:", drainErr);
    }

    return true;
  }

  /**
   * Drains the auto-call queue when an ongoing call completes or via cron.
   * Priority:
   * 1. Waiting new leads in QUEUED state (strictly FIFO, highest priority).
   * 2. Unanswered retry candidates (when no new leads remain, max 3 attempts per lead).
   * Dials sequentially while strictly adhering to MAX_CONCURRENT_CALLS (2).
   */
  static async processQueue(orgId: string): Promise<number> {
    if (!this.isCallingWindowOpen()) return 0;

    let activeCalls = await this.getActiveCallsCount(orgId);
    if (activeCalls >= this.MAX_CONCURRENT_CALLS) return 0;

    const availableSlots = this.MAX_CONCURRENT_CALLS - activeCalls;
    if (availableSlots <= 0) return 0;

    const now = new Date();

    // Phase 1: Drain waiting new leads in QUEUED state
    const queuedJobs = await prisma.callingJob.findMany({
      where: {
        orgId,
        status: "QUEUED",
        scheduledAt: { lte: now },
      },
      orderBy: { scheduledAt: "asc" }, // FIFO
      take: availableSlots,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            city: true,
            status: true,
            source: true,
            courseInterest: true,
            deletedAt: true,
            doNotCall: true,
            autoCallingEnabled: true,
          },
        },
      },
    });

    let dispatchedCount = 0;

    for (const job of queuedJobs) {
      if (!job.lead || job.lead.deletedAt || !job.lead.phone || job.lead.doNotCall || job.lead.autoCallingEnabled === false) {
        await prisma.callingJob.update({
          where: { id: job.id },
          data: { status: "CANCELLED", skipReason: "lead_deleted_or_opted_out" },
        });
        continue;
      }

      // Re-verify concurrency before each dispatch
      const currentActive = await this.getActiveCallsCount(orgId);
      if (currentActive >= this.MAX_CONCURRENT_CALLS) break;

      const targetPhone = this.normalizePhone(job.lead.phone);
      const res = await this.dispatchCallingJob(job, job.lead, targetPhone);
      if (res.status === "dispatched") {
        dispatchedCount++;
      }
    }

    // Phase 2: If available slots remain and no queued jobs are waiting, process RETRY_SCHEDULED jobs
    const currentActiveAfterQueued = await this.getActiveCallsCount(orgId);
    const remainingSlots = this.MAX_CONCURRENT_CALLS - currentActiveAfterQueued;

    if (remainingSlots > 0) {
      const retryJobs = await prisma.callingJob.findMany({
        where: {
          orgId,
          status: "RETRY_SCHEDULED",
          nextAttemptAt: { lte: now },
          attemptCount: { lt: this.MAX_CALL_ATTEMPTS },
        },
        orderBy: { nextAttemptAt: "asc" },
        take: remainingSlots,
        include: {
          lead: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              city: true,
              status: true,
              source: true,
              courseInterest: true,
              deletedAt: true,
              doNotCall: true,
              autoCallingEnabled: true,
            },
          },
        },
      });

      for (const rJob of retryJobs) {
        if (!rJob.lead || rJob.lead.deletedAt || !rJob.lead.phone || rJob.lead.doNotCall || rJob.lead.autoCallingEnabled === false) {
          await prisma.callingJob.update({
            where: { id: rJob.id },
            data: { status: "CANCELLED", skipReason: "lead_deleted_or_opted_out" },
          });
          continue;
        }

        const currentActive = await this.getActiveCallsCount(orgId);
        if (currentActive >= this.MAX_CONCURRENT_CALLS) break;

        const nextAttempt = rJob.attemptCount + 1;
        await prisma.callingJob.update({
          where: { id: rJob.id },
          data: { attemptCount: nextAttempt },
        });

        const targetPhone = this.normalizePhone(rJob.lead.phone);
        const res = await this.dispatchCallingJob(rJob, rJob.lead, targetPhone, {
          customNotes: `Automated retry call #${nextAttempt} of ${this.MAX_CALL_ATTEMPTS} for ${rJob.lead.name}`,
        });

        if (res.status === "dispatched") {
          dispatchedCount++;
        }
      }
    }

    return dispatchedCount;
  }

  /**
   * Drains queues across all organizations in the workspace.
   */
  static async processAllQueues(): Promise<{ orgId: string; dispatched: number }[]> {
    try {
      const orgs = await prisma.organization.findMany({
        select: { id: true },
      });
      const results: { orgId: string; dispatched: number }[] = [];
      for (const org of orgs) {
        const count = await this.processQueue(org.id);
        if (count > 0) {
          results.push({ orgId: org.id, dispatched: count });
        }
      }
      return results;
    } catch (e) {
      console.error("[AutoCallingService.processAllQueues] Error:", e);
      return [];
    }
  }

  /**
   * Identifies leads that did not pick up an agent call (for backward compatibility).
   */
  static async processUnansweredRetries(orgId: string): Promise<number> {
    return this.processQueue(orgId);
  }
}

function maxMins(durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return Math.max(1, Math.floor(durationSeconds / 60));
}
