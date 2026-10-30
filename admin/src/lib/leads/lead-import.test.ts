import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv } from "./csv";
import { canonicalImportPhone, parseImportDate, prepareImportRows, resolveImportSource, resolveImportStatus } from "./lead-import";

test("parseCsv handles BOM, quotes, embedded commas/newlines and CRLF", () => {
  const csv = '\uFEFFName,Phone,Notes\r\n"Sharma, Rahul",9876543210,"line1\nline2"\r\n\r\nAsha,+91 98111 22333,"said ""call later"""\r\n';
  const { headers, rows } = parseCsv(csv);
  assert.deepEqual(headers, ["Name", "Phone", "Notes"]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0]?.Name, "Sharma, Rahul");
  assert.equal(rows[0]?.Notes, "line1\nline2");
  assert.equal(rows[1]?.Notes, 'said "call later"');
});

test("parseCsv auto-detects semicolon delimiter", () => {
  const { rows } = parseCsv("Name;Phone\nAsha;9811122333\n");
  assert.equal(rows[0]?.Phone, "9811122333");
});

test("canonicalImportPhone strips +91 / 91 / leading 0 to 10-digit national", () => {
  assert.equal(canonicalImportPhone("+91 98765-43210"), "9876543210");
  assert.equal(canonicalImportPhone("919876543210"), "9876543210");
  assert.equal(canonicalImportPhone("09876543210"), "9876543210");
  assert.equal(canonicalImportPhone("12345"), null);
  assert.equal(canonicalImportPhone("abc"), null);
});

test("parseImportDate accepts ISO and day-first Indian dates, rejects bad/future", () => {
  const d = parseImportDate("15-08-2025");
  assert.ok(d instanceof Date);
  assert.equal((d as Date).getUTCDate(), 15);
  assert.equal((d as Date).getUTCMonth(), 7);
  assert.ok(parseImportDate("2025-08-15") instanceof Date);
  assert.ok(parseImportDate("15/08/2025") instanceof Date);
  assert.equal(parseImportDate("31-02-2025"), "invalid");
  assert.equal(parseImportDate("next week"), "invalid");
  assert.equal(parseImportDate("01-01-2999"), "invalid");
  assert.equal(parseImportDate(""), null);
});

test("source and status resolution", () => {
  assert.equal(resolveImportSource("Google Ads"), "GOOGLE_ADS");
  assert.equal(resolveImportSource("facebook"), "FACEBOOK_ADS");
  assert.equal(resolveImportSource("newspaper"), "DIRECT");
  assert.equal(resolveImportSource(""), "DIRECT");
  assert.equal(resolveImportStatus(""), "NEW");
  assert.equal(resolveImportStatus("not interested"), "NOT_INTERESTED");
  assert.equal(resolveImportStatus("maybe"), null);
});

test("prepareImportRows maps header aliases, validates, and rejects in-file duplicates", () => {
  const { valid, errors } = prepareImportRows([
    { "Full Name": "Rahul Sharma", "Mobile No": "+91 9876543210", "Email ID": "Rahul@Example.com", Course: "CPL", Remarks: "hot" },
    { "Full Name": "Rahul Again", "Mobile No": "9876543210" },
    { "Full Name": "", "Mobile No": "9811122333" },
    { "Full Name": "Bad Phone", "Mobile No": "12" },
    { "Full Name": "Bad Status", "Mobile No": "9811122334", Status: "maybe" },
    { "Full Name": "", "Mobile No": "" },
  ]);
  assert.equal(valid.length, 1);
  assert.equal(valid[0]?.phone, "9876543210");
  assert.equal(valid[0]?.email, "rahul@example.com");
  assert.equal(valid[0]?.courseInterest, "CPL");
  assert.equal(valid[0]?.notes, "hot");
  assert.equal(valid[0]?.status, "NEW");
  assert.deepEqual(errors.map((e) => e.rowNumber), [3, 4, 5, 6]);
  assert.match(errors[0]!.reason, /earlier in this file/);
});

test("canonicalImportPhone normalizes last 10 digits across country codes, spaces, and hyphens", () => {
  // Variations of the same number must resolve to the identical last 10 digits
  const expected = "9876543210";
  assert.equal(canonicalImportPhone("9876543210"), expected);
  assert.equal(canonicalImportPhone("+91 98765 43210"), expected);
  assert.equal(canonicalImportPhone("+91-98765-43210"), expected);
  assert.equal(canonicalImportPhone("098765 43210"), expected);
  assert.equal(canonicalImportPhone("+919876543210"), expected);
  assert.equal(canonicalImportPhone("91 9876543210"), expected);

  // Missing or invalid phones handled safely without throwing
  assert.equal(canonicalImportPhone(""), null);
  assert.equal(canonicalImportPhone("   "), null);
  assert.equal(canonicalImportPhone(undefined as any), null);
  assert.equal(canonicalImportPhone(null as any), null);
  assert.equal(canonicalImportPhone("invalid-phone"), null);
  assert.equal(canonicalImportPhone("12345"), null); // too short (< 7 digits)
  assert.equal(canonicalImportPhone("12345678901234567"), null); // too long (> 15 digits)
});

test("duplicate detection flags matching leads with last 10 digits across format variations", () => {
  const { valid, errors } = prepareImportRows([
    { "Full Name": "Priya Sharma", "Phone": "+91 98111 22333" },
    { "Full Name": "Priya Duplicate Space", "Phone": "98111 22333" },
    { "Full Name": "Priya Duplicate Hyphen", "Phone": "+91-98111-22333" },
    { "Full Name": "Priya Duplicate LeadingZero", "Phone": "09811122333" },
    { "Full Name": "New Lead Unique", "Phone": "+91 98222 33444" },
  ]);

  assert.equal(valid.length, 2);
  assert.equal(valid[0]?.phone, "9811122333");
  assert.equal(valid[1]?.phone, "9822233444");

  // Rows 3, 4, 5 duplicate row 2
  assert.equal(errors.length, 3);
  assert.equal(errors[0]?.rowNumber, 3);
  assert.equal(errors[0]?.isDuplicate, true);
  assert.equal(errors[1]?.rowNumber, 4);
  assert.equal(errors[1]?.isDuplicate, true);
  assert.equal(errors[2]?.rowNumber, 5);
  assert.equal(errors[2]?.isDuplicate, true);
});
