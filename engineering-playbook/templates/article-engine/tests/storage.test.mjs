import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { mutateJson, readJson, writeJsonAtomic, withFileLock } from "../src/storage.js";

test("atomic JSON writes and locked mutations preserve valid data", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "article-engine-test-"));
  const file = path.join(dir, "state.json");
  try {
    writeJsonAtomic(file, { count: 1 });
    mutateJson(file, {}, (value) => ({ count: value.count + 1 }));
    assert.deepEqual(readJson(file, null, { strict: true }), { count: 2 });
    await withFileLock(path.join(dir, "job.lock"), async () => assert.ok(true));
    assert.equal(fs.existsSync(path.join(dir, "job.lock")), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
