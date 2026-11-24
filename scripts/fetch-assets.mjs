#!/usr/bin/env node
// Tải icon Tướng / Tộc-Hệ / Trang bị từ CommunityDragon, chuyển sang .webp và lưu vào
// public/assets/set<n>/<loại>/<id>.webp, rồi cập nhật đường dẫn trong data/sets/*.json.
//
// Chạy sau `npm run data:fetch`:
//   npm run assets:fetch            # toàn bộ 18 mùa
//   npm run assets:fetch -- 1 18    # chỉ một số mùa
//
// Ảnh gốc được cache trong .cache/assets nên chạy lại không phải tải lại.

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const DATA_DIR = path.resolve("data/sets");
const PUBLIC_DIR = path.resolve("public");
const CACHE_DIR = path.resolve(".cache/assets");
const CONCURRENCY = 16;
const RETRIES = 3;

// Kích thước đầu ra (chiều rộng, px) theo loại ảnh.
const SIZES = { champions: 256, traits: 64, items: 96 };

const safe = (id) => id.replace(/[^A-Za-z0-9_-]/g, "_");

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function download(url) {
  const file = path.join(CACHE_DIR, createHash("sha1").update(url).digest("hex"));
  if (await exists(file)) return readFile(file);
  let lastErr;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 404) throw Object.assign(new Error("404"), { fatal: true });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(file, buf);
      return buf;
    } catch (err) {
      lastErr = err;
      if (err.fatal) break;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  throw lastErr;
}

async function processJob(job) {
  const out = path.join(PUBLIC_DIR, job.localPath);
  if (!(await exists(out))) {
    const buf = await download(job.url);
    await mkdir(path.dirname(out), { recursive: true });
    await sharp(buf)
      .resize({ width: SIZES[job.kind], withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(out);
  }
  return job.localPath;
}

async function runPool(jobs, worker) {
  let i = 0;
  let done = 0;
  const failures = [];
  const tick = () => {
    done++;
    if (done % 100 === 0 || done === jobs.length) process.stdout.write(`  ${done}/${jobs.length}\n`);
  };
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (i < jobs.length) {
        const job = jobs[i++];
        try {
          await worker(job);
          job.ok = true;
        } catch (err) {
          failures.push(`${job.url} (${err.message})`);
        }
        tick();
      }
    }),
  );
  return failures;
}

async function main() {
  const only = process.argv.slice(2).map(Number).filter(Boolean);
  await mkdir(CACHE_DIR, { recursive: true });

  const sets = [];
  for (let n = 1; n <= 18; n++) {
    if (only.length && !only.includes(n)) continue;
    const file = path.join(DATA_DIR, `set-${n}.json`);
    if (!(await exists(file))) continue;
    sets.push({ n, file, data: JSON.parse(await readFile(file, "utf8")) });
  }

  // Gom việc cần làm; bỏ qua mục đã là đường dẫn cục bộ.
  const jobs = [];
  for (const { n, data } of sets) {
    for (const kind of ["champions", "traits", "items"]) {
      for (const entry of data[kind]) {
        if (!entry.icon?.startsWith("http")) continue;
        jobs.push({
          entry,
          kind,
          url: entry.icon,
          localPath: `/assets/set${n}/${kind}/${safe(entry.id)}.webp`,
        });
      }
    }
  }

  console.log(`Xử lý ${jobs.length} ảnh của ${sets.length} mùa…`);
  const failures = await runPool(jobs, processJob);

  for (const job of jobs) if (job.ok) job.entry.icon = job.localPath;
  for (const { file, data } of sets) await writeFile(file, JSON.stringify(data, null, 2) + "\n");

  console.log(`✔ Xong: ${jobs.length - failures.length} ảnh.`);
  if (failures.length) {
    console.warn(`⚠ ${failures.length} ảnh lỗi (giữ nguyên URL gốc trong JSON):`);
    for (const f of failures.slice(0, 30)) console.warn("  - " + f);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
