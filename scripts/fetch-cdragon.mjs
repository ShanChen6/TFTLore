#!/usr/bin/env node
// Tải dữ liệu TFT tiếng Việt từ CommunityDragon và tách thành data/sets/set-<n>.json
// theo schema trong lib/types.ts.
//
// Cách dùng:
//   npm run data:fetch                 # tải từ CommunityDragon
//   npm run data:fetch -- ./vi_vn.json # dùng file đã tải sẵn
//
// Lưu ý: CommunityDragon không phải lúc nào cũng còn giữ đủ dữ liệu các mùa cũ
// (đặc biệt Mùa 1 – 5). Script sẽ in ra danh sách mùa còn thiếu để bổ sung thủ công.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_URL = "https://raw.communitydragon.org/latest/cdragon/tft/vi_vn.json";
const ASSET_BASE = "https://raw.communitydragon.org/latest/game/";
const OUT_DIR = path.resolve("data/sets");
const TOTAL_SETS = 18;

// Mã style của CommunityDragon -> cấp bậc mốc kích hoạt.
// TODO: đối chiếu lại với dữ liệu thật của từng mùa.
const STYLE_MAP = { 1: "bronze", 2: "silver", 3: "unique", 4: "gold", 5: "prismatic", 6: "prismatic" };

const assetUrl = (p) =>
  p ? ASSET_BASE + p.toLowerCase().replace(/\.(tex|dds)$/, ".png") : "";

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

async function loadSource() {
  const file = process.argv[2];
  if (file) return JSON.parse(await readFile(file, "utf8"));
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Tải ${SOURCE_URL} thất bại: HTTP ${res.status}`);
  return res.json();
}

// Một mùa có thể có nhiều biến thể (PBE, chế độ phụ…); ưu tiên mutator "TFTSet<n>".
function pickSetEntry(setData, n) {
  const candidates = setData.filter((s) => Number(s.number) === n);
  return candidates.find((s) => s.mutator === `TFTSet${n}`) ?? candidates[0] ?? null;
}

function normalizeTraits(rawTraits = []) {
  return rawTraits.map((t) => ({
    id: t.apiName,
    name: t.name,
    description: t.desc ?? "",
    icon: assetUrl(t.icon),
    breakpoints: (t.effects ?? []).map((e) => ({
      count: e.minUnits,
      style: STYLE_MAP[e.style] ?? "bronze",
      effect: "",
    })),
  }));
}

function normalizeChampions(rawChamps = [], traitIdByName) {
  return rawChamps
    .filter((c) => c.cost > 0 && (c.traits ?? []).length > 0) // bỏ lính, quái, vật phẩm trên bàn
    .map((c) => ({
      id: c.apiName,
      name: c.name,
      cost: c.cost,
      traits: (c.traits ?? []).map((name) => traitIdByName.get(name) ?? name),
      stats: {
        hp: num(c.stats?.hp),
        mana: { initial: num(c.stats?.initialMana), max: num(c.stats?.mana) },
        armor: num(c.stats?.armor),
        mr: num(c.stats?.magicResist),
        ad: num(c.stats?.damage),
        as: num(c.stats?.attackSpeed),
        range: num(c.stats?.range),
      },
      ability: {
        name: c.ability?.name ?? "",
        description: c.ability?.desc ?? "",
        icon: assetUrl(c.ability?.icon),
      },
      icon: assetUrl(c.squareIcon ?? c.icon),
    }));
}

function normalizeItems(rawItems = [], n) {
  const setPrefix = new RegExp(`^TFT${n}_`);
  return rawItems
    .filter((i) => i.apiName && (i.apiName.startsWith("TFT_Item_") || setPrefix.test(i.apiName)))
    .map((i) => ({
      id: i.apiName,
      name: i.name ?? "",
      components: i.composition ?? i.from ?? [],
      description: i.desc ?? "",
      isUnique: Boolean(i.unique),
      icon: assetUrl(i.icon),
    }));
}

async function main() {
  const src = await loadSource();
  const setData = src.setData ?? [];
  await mkdir(OUT_DIR, { recursive: true });

  const missing = [];
  for (let n = 1; n <= TOTAL_SETS; n++) {
    const entry = pickSetEntry(setData, n);
    if (!entry) {
      missing.push(n);
      continue;
    }
    const traits = normalizeTraits(entry.traits);
    const traitIdByName = new Map(traits.map((t) => [t.name, t.id]));
    const out = {
      setId: n,
      name: entry.name ?? `Mùa ${n}`,
      releaseDate: null,
      boardSize: { rows: n === 1 ? 3 : 4, cols: 7 },
      mechanic: "",
      traits,
      champions: normalizeChampions(entry.champions, traitIdByName),
      items: normalizeItems(src.items, n),
    };
    const file = path.join(OUT_DIR, `set-${n}.json`);
    await writeFile(file, JSON.stringify(out, null, 2) + "\n");
    console.log(`✔ Mùa ${n}: ${out.champions.length} tướng, ${out.traits.length} tộc/hệ → ${file}`);
  }

  if (missing.length) {
    console.warn(`⚠ Thiếu dữ liệu các mùa: ${missing.join(", ")} – cần bổ sung thủ công.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
