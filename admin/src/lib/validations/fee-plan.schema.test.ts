import test from "node:test";
import assert from "node:assert/strict";
import {
  feePlanItemSchema,
  createFeePlanSchema,
  feePlanFiltersSchema,
} from "@/lib/validations/fee-plan.schema";

test("fee plan item accepts a fixed amount", () => {
  const r = feePlanItemSchema.safeParse({ name: "Install 1", amount: 29500, dueOffsetDays: 30 });
  assert.equal(r.success, true);
});

test("fee plan item accepts a percent of course fee", () => {
  const r = feePlanItemSchema.safeParse({ name: "Down payment", percentOfFee: 25, dueOffsetDays: 0 });
  assert.equal(r.success, true);
});

test("fee plan item rejects specifying both amount and percent", () => {
  const r = feePlanItemSchema.safeParse({ name: "Bad", amount: 5000, percentOfFee: 50 });
  assert.equal(r.success, false);
});

test("fee plan item rejects specifying neither amount nor percent", () => {
  const r = feePlanItemSchema.safeParse({ name: "Empty" });
  assert.equal(r.success, false);
});

test("fee plan item rejects percent above 100", () => {
  const r = feePlanItemSchema.safeParse({ name: "Too much", percentOfFee: 101 });
  assert.equal(r.success, false);
});

test("fee plan item rejects amounts above the maximum", () => {
  const r = feePlanItemSchema.safeParse({ name: "Huge", amount: 10_000_000 });
  assert.equal(r.success, false);
});

test("createFeePlanSchema requires at least one item", () => {
  assert.equal(createFeePlanSchema.safeParse({ name: "Plan", items: [] }).success, false);
  assert.equal(
    createFeePlanSchema.safeParse({ name: "Plan", items: [{ name: "A", amount: 1000 }] }).success,
    true,
  );
});

test("feePlanFiltersSchema parses query-style input with defaults", () => {
  const r = feePlanFiltersSchema.parse({ search: "cabin", isActive: "true", page: "2", limit: "10" });
  assert.deepEqual(r, { search: "cabin", isActive: true, page: 2, limit: 10 });
  assert.equal(feePlanFiltersSchema.parse({}).page, 1);
});