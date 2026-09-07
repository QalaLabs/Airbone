/**
 * M-07 remediation gate: dead permission resources (`seo`, `cms`, `enquiries`,
 * `campaigns`) were pruned from the static matrix because no route guards
 * reference them. Removing dead entitlements keeps the matrix honest and
 * removes the SUPER_ADMIN/ADMIN-vs-subordinate inconsistency. Pure unit test.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { hasPermission, PERMISSION_MATRIX } from "./permissions";

function user(role: string, id = "u1") {
  return { id, role, orgId: "o1", name: "T", email: "t@x.com" } as never;
}

test("M-07: dead resources are not granted to any role", () => {
  for (const role of Object.keys(PERMISSION_MATRIX)) {
    const m = PERMISSION_MATRIX[role as keyof typeof PERMISSION_MATRIX];
    assert.equal("seo" in m, false, `${role} must not grant seo`);
    assert.equal("cms" in m, false, `${role} must not grant cms`);
    assert.equal("enquiries" in m, false, `${role} must not grant enquiries`);
    assert.equal("campaigns" in m, false, `${role} must not grant campaigns`);
  }
});

test("M-07: a formerly-dead entitlement now denies", () => {
  // CONTENT_MANAGER previously had `cms`; it is now pruned → no permission.
  assert.equal(hasPermission(user("CONTENT_MANAGER"), "read", "cms"), false);
  // MARKETING_MANAGER previously had `campaigns`; now pruned → denied.
  assert.equal(hasPermission(user("MARKETING_MANAGER"), "read", "campaigns"), false);
  // ADMISSIONS_COUNSELOR previously had `enquiries`; now pruned → denied.
  assert.equal(hasPermission(user("ADMISSIONS_COUNSELOR"), "read", "enquiries"), false);
});

test("M-07: real resources still grant (guards are not over-pruned)", () => {
  assert.equal(hasPermission(user("ADMIN"), "read", "analytics"), true);
  assert.equal(hasPermission(user("ADMISSIONS_COUNSELOR"), "read", "leads"), true);
  assert.equal(hasPermission(user("CONTENT_MANAGER"), "publish", "pages"), true);
  assert.equal(hasPermission(user("MARKETING_MANAGER"), "read", "jobs"), true);
});

test("I6: lead/deal assignment is restricted to Admin, SuperAdmin and Manager", () => {
  // Sales agents (ADMISSIONS_COUNSELOR) must get server-side denial.
  assert.equal(hasPermission(user("ADMISSIONS_COUNSELOR"), "assign", "leads"), false, "counselor must not assign leads");
  assert.equal(hasPermission(user("ADMISSIONS_COUNSELOR"), "assign", "deals"), false, "counselor must not assign deals");
  // Admin / SuperAdmin / Manager keep assign.
  assert.equal(hasPermission(user("ADMIN"), "assign", "leads"), true);
  assert.equal(hasPermission(user("ADMIN"), "assign", "deals"), true);
  assert.equal(hasPermission(user("SUPER_ADMIN"), "assign", "leads"), true);
  assert.equal(hasPermission(user("SUPER_ADMIN"), "assign", "deals"), true);
  assert.equal(hasPermission(user("MARKETING_MANAGER"), "assign", "leads"), true);
});
