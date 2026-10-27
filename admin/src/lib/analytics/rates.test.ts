import test from "node:test";
import assert from "node:assert/strict";
import { computeReplyRate, percentRate } from "./rates";

test("SMS-03: reply rate divides by sent + delivered (not sent alone)", () => {
  // 5 replies on 3 sent + 2 delivered is 100%, not 167%.
  assert.equal(computeReplyRate(3, 2, 5), 1);
});

test("SMS-03: reply rate can never exceed 100%", () => {
  for (const value of [1.4, 2, 10]) {
    const rate = computeReplyRate(10, 10, value * 20);
    assert.ok(rate !== null && rate <= 1, `rate ${rate} must be clamped to 1`);
  }
});

test("SMS-03: no delivered messages returns null, not a fake 0%", () => {
  assert.equal(computeReplyRate(0, 0, 0), null);
  assert.equal(computeReplyRate(0, 0, 4), null);
});

test("SMS-03: zero replies is reported as null (unknown), not 0%", () => {
  assert.equal(computeReplyRate(10, 0, 0), null);
});

test("SMS-03: percentage helper clamps and rounds", () => {
  assert.equal(percentRate(1, 3), 33);
  assert.equal(percentRate(5, 2), 100);
  assert.equal(percentRate(0, 0), null);
  assert.equal(percentRate(4, 0), null);
});
