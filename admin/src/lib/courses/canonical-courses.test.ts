import test from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_COURSES,
  isCanonicalCourse,
  normalizeCourseInterest,
} from "./canonical-courses";

test("CRM-09: canonical course list contains primary aviation offerings", () => {
  assert.ok(CANONICAL_COURSES.includes("Commercial Pilot License (CPL)"));
  assert.ok(CANONICAL_COURSES.includes("Cadet Pilot Program Preparation"));
  assert.ok(CANONICAL_COURSES.includes("Cabin Crew & Aviation Hospitality Training"));
  assert.ok(CANONICAL_COURSES.includes("CAS / COMPASS / ADAPT Cadet Assessment"));
  assert.ok(CANONICAL_COURSES.includes("ATPL Ground School"));
  assert.ok(CANONICAL_COURSES.includes("A320 Simulator Training"));
  assert.ok(CANONICAL_COURSES.includes("Airline Interview Preparation"));
  assert.ok(CANONICAL_COURSES.includes("Flying Training (India & Abroad)"));
  assert.ok(CANONICAL_COURSES.includes("Private Pilot License (PPL)"));
  assert.ok(CANONICAL_COURSES.includes("Flight Dispatcher"));
});

test("CRM-09: isCanonicalCourse validates known courses", () => {
  assert.equal(isCanonicalCourse("Commercial Pilot License (CPL)"), true);
  assert.equal(isCanonicalCourse("Cabin Crew & Aviation Hospitality Training"), true);
  assert.equal(isCanonicalCourse("Random Untracked String"), false);
});

test("CRM-09: normalizeCourseInterest maps legacy CPL variants", () => {
  assert.equal(normalizeCourseInterest("CPL"), "Commercial Pilot License (CPL)");
  assert.equal(normalizeCourseInterest("CPL Combo Full"), "Commercial Pilot License (CPL)");
  assert.equal(normalizeCourseInterest("DGCA CPL Ground School"), "Commercial Pilot License (CPL)");
  assert.equal(normalizeCourseInterest("DGCA CPL Ground Classes"), "Commercial Pilot License (CPL)");
  assert.equal(normalizeCourseInterest("CPL Ground School"), "Commercial Pilot License (CPL)");
  assert.equal(normalizeCourseInterest("DGCA CPL Ground Classes (₹2,70,000)"), "Commercial Pilot License (CPL)");
  assert.equal(normalizeCourseInterest("Tech Genreral"), "Commercial Pilot License (CPL)");
  assert.equal(normalizeCourseInterest("270000"), "Commercial Pilot License (CPL)");
});

test("CRM-09: normalizeCourseInterest maps legacy Cabin Crew variants", () => {
  assert.equal(normalizeCourseInterest("Cabin Crew"), "Cabin Crew & Aviation Hospitality Training");
  assert.equal(normalizeCourseInterest("Cabin Crew Training (Eligible)"), "Cabin Crew & Aviation Hospitality Training");
  assert.equal(normalizeCourseInterest("Cabin Crew Training (₹59,000)"), "Cabin Crew & Aviation Hospitality Training");
  assert.equal(normalizeCourseInterest("Cabin crew"), "Cabin Crew & Aviation Hospitality Training");
});

test("CRM-09: normalizeCourseInterest maps Cadet and Compass variants", () => {
  assert.equal(normalizeCourseInterest("Cadet Pilot Prepration"), "Cadet Pilot Program Preparation");
  assert.equal(normalizeCourseInterest("Cadet Preparation (₹50,000)"), "Cadet Pilot Program Preparation");
  assert.equal(normalizeCourseInterest("CASS Compass Adapt (₹30,000)"), "CAS / COMPASS / ADAPT Cadet Assessment");
  assert.equal(normalizeCourseInterest("Compass"), "CAS / COMPASS / ADAPT Cadet Assessment");
  assert.equal(normalizeCourseInterest("Cass&Compass"), "CAS / COMPASS / ADAPT Cadet Assessment");
});

test("CRM-09: normalizeCourseInterest maps ATPL and Simulator variants", () => {
  assert.equal(normalizeCourseInterest("ATPL Ground School (₹1,50,000)"), "ATPL Ground School");
  assert.equal(normalizeCourseInterest("Airbus A320 Simulator FBS (₹12,000)"), "A320 Simulator Training");
  assert.equal(normalizeCourseInterest("SIM"), "A320 Simulator Training");
});

test("CRM-09: normalizeCourseInterest handles empty, null and general inquiries", () => {
  assert.equal(normalizeCourseInterest(null), null);
  assert.equal(normalizeCourseInterest(""), null);
  assert.equal(normalizeCourseInterest("   "), null);
  assert.equal(normalizeCourseInterest("Not sure yet"), "General Inquiry");
  assert.equal(normalizeCourseInterest("General Inquiry"), "General Inquiry");
});
