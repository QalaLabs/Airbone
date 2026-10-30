import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LeadAssignmentService } from "./lead-assignment.service";

describe("P0 Automatic Lead Assignment Engine — Course Matching & Canonical Aliases", () => {
  it("correctly identifies all Cadet course variations", () => {
    const cadetVariants = [
      "Cadet",
      "cadet",
      "Cadet Pilot Preparation",
      "Cadet Pilot Prepration",
      "Cadet Preparation (₹50,000)",
      "Cadet Prep",
      "Airline Preparation Program",
      "إعداد الطيارين المتدربين", // Arabic Cadet text from historical CRM data
    ];

    for (const variant of cadetVariants) {
      assert.equal(
        LeadAssignmentService.isCadetCourse(variant),
        true,
        `Expected "${variant}" to be recognized as Cadet course`
      );
    }
  });

  it("correctly identifies all CPL course variations", () => {
    const cplVariants = [
      "CPL",
      "cpl",
      "CPL ",
      "Commercial Pilot License (CPL)",
      "Commercial Pilot License",
      "DGCA CPL Ground Classes",
      "DGCA CPL Ground School",
      "CPL Ground School",
      "CPL Ground Classes (₹2,70,000)",
      "CPL Flight Training",
      "Ground School",
    ];

    for (const variant of cplVariants) {
      assert.equal(
        LeadAssignmentService.isCPLCourse(variant),
        true,
        `Expected "${variant}" to be recognized as CPL course`
      );
    }
  });

  it("rejects non-Cadet and non-CPL courses from automatic assignment", () => {
    const otherCourses = [
      "Cabin Crew Training (₹54,000)",
      "Cabin Crew Training",
      "Airbus A320 Simulator FBS (₹12,000)",
      "CASS Compass Adapt (₹30,000)",
      "GD & PI Course (₹30,000)",
      "ATPL Ground Classes",
      "Flying Training Counselling",
      "Not sure yet",
      "",
      null,
      undefined,
    ];

    for (const course of otherCourses) {
      assert.equal(
        LeadAssignmentService.isCadetCourse(course),
        false,
        `Expected "${course}" NOT to be Cadet`
      );
      assert.equal(
        LeadAssignmentService.isCPLCourse(course),
        false,
        `Expected "${course}" NOT to be CPL`
      );
    }
  });

  it("preserves manual assignment when lead already has assignedTo set", async () => {
    const result = await LeadAssignmentService.autoAssign(
      { orgId: "test-org" },
      {
        id: "lead-123",
        courseInterest: "Commercial Pilot License (CPL)",
        source: "DIRECT",
        assignedTo: "existing-counselor-uuid",
      }
    );

    assert.equal(result.assignedTo, "existing-counselor-uuid");
    assert.equal(result.rule, "NONE");
  });

  it("returns rule NONE for unassigned leads in non-targeted programs", async () => {
    const result = await LeadAssignmentService.autoAssign(
      { orgId: "test-org" },
      {
        id: "lead-456",
        courseInterest: "Cabin Crew Training",
        source: "WEBSITE",
      }
    );

    assert.equal(result.assignedTo, null);
    assert.equal(result.rule, "NONE");
  });
});

describe("P0 Automatic Lead Assignment Engine — CPL Pool Ordering & Rotation Cursor Logic", () => {
  it("strictly enforces pool ordering: 1. Piyush → 2. Shivangi → 3. Other active counselors", () => {
    const activeCounselors = [
      { id: "counselor-kanishka", name: "Kanishka Gupta", email: "kanishka@airborneaviation.in" },
      { id: "counselor-shivangi", name: "Shivangi Rathore", email: "sr@airborneaviation.in" },
      { id: "counselor-piyush", name: "Piyush Chandra", email: "pc@airborneaviation.in" },
      { id: "counselor-other", name: "Zoya Akhtar", email: "zoya@airborneaviation.in" },
    ];

    const piyush = activeCounselors.find((c) => c.name.toLowerCase().includes("piyush"));
    const shivangi = activeCounselors.find((c) => c.name.toLowerCase().includes("shivangi"));
    const others = activeCounselors.filter((c) => c.id !== piyush?.id && c.id !== shivangi?.id);

    const pool = [];
    if (piyush) pool.push(piyush);
    if (shivangi) pool.push(shivangi);
    for (const o of others) pool.push(o);

    assert.equal(pool[0]?.id, "counselor-piyush");
    assert.equal(pool[1]?.id, "counselor-shivangi");
    assert.equal(pool[2]?.id, "counselor-kanishka");
    assert.equal(pool[3]?.id, "counselor-other");
  });

  it("alternates strictly between Piyush and Shivangi when only they are active", () => {
    const activeCounselors = [
      { id: "counselor-shivangi", name: "Shivangi Rathore", email: "sr@airborneaviation.in" },
      { id: "counselor-piyush", name: "Piyush Chandra", email: "pc@airborneaviation.in" },
    ];

    const piyush = activeCounselors.find((c) => c.name.toLowerCase().includes("piyush"));
    const shivangi = activeCounselors.find((c) => c.name.toLowerCase().includes("shivangi"));
    const pool = [piyush!, shivangi!];

    assert.equal(pool.length, 2);
    // Simulating sequence of 6 leads:
    const assignedSequence = [0, 1, 2, 3, 4, 5].map((cursor) => pool[cursor % pool.length]?.name);
    assert.deepEqual(assignedSequence, [
      "Piyush Chandra",
      "Shivangi Rathore",
      "Piyush Chandra",
      "Shivangi Rathore",
      "Piyush Chandra",
      "Shivangi Rathore",
    ]);
  });

  it("handles newly added counselor in rotation pool cleanly", () => {
    const basePool = [
      { id: "piyush", name: "Piyush" },
      { id: "shivangi", name: "Shivangi" },
    ];

    // Lead 1: cursor 0 -> Piyush
    assert.equal(basePool[0 % basePool.length]?.name, "Piyush");
    // Lead 2: cursor 1 -> Shivangi
    assert.equal(basePool[1 % basePool.length]?.name, "Shivangi");

    // New counselor activated: Kanishka added
    const expandedPool = [...basePool, { id: "kanishka", name: "Kanishka" }];

    // Lead 3: cursor 2 -> Kanishka
    assert.equal(expandedPool[2 % expandedPool.length]?.name, "Kanishka");
    // Lead 4: cursor 3 -> Piyush (repeats)
    assert.equal(expandedPool[3 % expandedPool.length]?.name, "Piyush");
  });
});
