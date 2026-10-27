import test from "node:test";
import assert from "node:assert/strict";
import { collectAllPages } from "./paginate";

function dataset(n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: i + 1 }));
}

function fakeApi(rows: ReturnType<typeof dataset>, calls: number[]) {
  return async (page: number, limit: number) => {
    calls.push(page);
    const start = (page - 1) * limit;
    return rows.slice(start, start + limit);
  };
}

test("CRM-07: retrieves every lead when the result spans more than one 100-row page", async () => {
  const rows = dataset(250);
  const calls: number[] = [];
  const collected = await collectAllPages(fakeApi(rows, calls));
  assert.equal(collected.length, 250);
  assert.deepEqual(collected.map((r) => r.id), rows.map((r) => r.id));
  assert.deepEqual(calls, [1, 2, 3]);
});

test("CRM-07: exact multiple of the page size performs one final empty request", async () => {
  const rows = dataset(200);
  const calls: number[] = [];
  const collected = await collectAllPages(fakeApi(rows, calls));
  assert.equal(collected.length, 200);
  assert.deepEqual(calls, [1, 2, 3]);
});

test("CRM-07: stops on a short page and never loops past the hard cap", async () => {
  const rows = dataset(130);
  const calls: number[] = [];
  const collected = await collectAllPages(fakeApi(rows, calls), 100, 10);
  assert.equal(collected.length, 130);
  assert.deepEqual(calls, [1, 2]);

  const infinite = async (_page: number, limit: number) => dataset(limit);
  const cappedCalls: number[] = [];
  const capped = await collectAllPages(
    async (page, limit) => {
      cappedCalls.push(page);
      return infinite(page, limit);
    },
    100,
    3,
  );
  assert.equal(capped.length, 300);
  assert.deepEqual(cappedCalls, [1, 2, 3]);
});

test("CRM-07: empty first page yields no rows", async () => {
  const collected = await collectAllPages(async () => []);
  assert.equal(collected.length, 0);
});
