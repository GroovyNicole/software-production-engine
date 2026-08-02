import fs from "node:fs";
import path from "node:path";

export function readJson(file, fallback, { strict = false } = {}) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    if (!strict && error?.code === "ENOENT") return structuredClone(fallback);
    throw new Error(`Cannot read ${file}: ${error.message}`);
  }
}

export function writeTextAtomic(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}.tmp`);
  try {
    fs.writeFileSync(temp, text, { encoding: "utf8", flag: "wx" });
    fs.renameSync(temp, file);
  } finally {
    try { fs.unlinkSync(temp); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
}

export function writeJsonAtomic(file, value) {
  writeTextAtomic(file, JSON.stringify(value, null, 2) + "\n");
}

export function mutateJson(file, fallback, mutator) {
  const lock = `${file}.lock`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let handle;
  try {
    handle = fs.openSync(lock, "wx");
  } catch (error) {
    if (error?.code === "EEXIST") throw new Error(`Another process is updating ${path.basename(file)}. Retry after it finishes.`);
    throw error;
  }
  try {
    const current = readJson(file, fallback);
    const next = mutator(current) ?? current;
    writeJsonAtomic(file, next);
    return next;
  } finally {
    if (handle !== undefined) fs.closeSync(handle);
    try { fs.unlinkSync(lock); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
}

export async function withFileLock(lock, task) {
  fs.mkdirSync(path.dirname(lock), { recursive: true });
  let handle;
  try {
    handle = fs.openSync(lock, "wx");
  } catch (error) {
    if (error?.code === "EEXIST") throw new Error(`Another engine process is active (${path.basename(lock)} exists). Retry after it finishes.`);
    throw error;
  }
  try {
    return await task();
  } finally {
    if (handle !== undefined) fs.closeSync(handle);
    try { fs.unlinkSync(lock); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
}
