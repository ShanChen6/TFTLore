#!/usr/bin/env node
// Tải dữ liệu TFT từ CommunityDragon và tách thành data/sets/set-<id>.json
// (id: "1", "3.5", "18"…) theo schema trong lib/types.ts, kèm data/sets/index.json.
//
// Cách dùng:
//   npm run data:fetch              # tải (có cache trong .cache/cdragon) và sinh toàn bộ
//   npm run data:fetch -- 7 7.5 18  # chỉ sinh lại một số mùa
//   npm run data:fetch -- --refresh   # tải lại bản "latest" thay vì dùng cache
//
// Nguồn của từng mùa (kể cả mùa giữa kỳ .5) khai báo trong SET_SOURCES. Mùa 1 – 6.5
// chỉ còn dữ liệu tiếng Anh; tên trang bị/tộc hệ được dịch sang tiếng Việt khi khớp
// apiName với dữ liệu tiếng Việt của các bản vá sau.

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const CDRAGON = "https://raw.communitydragon.org";
const CACHE_DIR = path.resolve(".cache/cdragon");
const OUT_DIR = path.resolve("data/sets");
const META_FILE = path.resolve("data/set-meta.json");
const REFRESH = process.argv.includes("--refresh");

/**
 * Danh sách mùa theo thứ tự thời gian, gồm cả mùa giữa kỳ (.5).
 * legacy: true  -> định dạng cũ, đọc từ `sets[setKey]` (chưa có apiName).
 * mutators      -> định dạng mới, đọc từ `setData` theo thứ tự ưu tiên.
 * Mỗi mùa lấy bản vá CUỐI CÙNG trước khi mùa kế tiếp ra mắt (không dùng bản Hồi Sinh).
 */
const SET_SOURCES = [
  ["1", { patch: "9.21", lang: "en_us", legacy: true }],
  ["2", { patch: "10.5", lang: "en_us", legacy: true }],
  ["3", { patch: "10.11", lang: "en_us", legacy: true }],
  ["3.5", { patch: "10.18", lang: "en_us", legacy: true }],
  ["4", { patch: "11.1", lang: "en_us", mutators: ["TFTSet4"] }],
  ["4.5", { patch: "11.8", lang: "en_us", mutators: ["TFTSet4_Act2"] }],
  ["5", { patch: "11.14", lang: "en_us", mutators: ["TFT_Set5", "TFTTURBOSet5"] }],
  ["5.5", { patch: "11.21", lang: "en_us", mutators: ["TFT_Set5_Stage2"] }],
  ["6", { patch: "12.3", lang: "en_us", mutators: ["TFTTURBOSet6", "TFT_Set6"] }],
  ["6.5", { patch: "12.10", lang: "en_us", mutators: ["TFTSet6_Stage2"] }],
  ["7", { patch: "latest", lang: "vi_vn", mutators: ["TFTSet7"] }],
  ["7.5", { patch: "12.22", lang: "vi_vn", mutators: ["TFTSet7_Stage2"] }],
  ["8", { patch: "13.5", lang: "vi_vn", mutators: ["TFTSet8"] }],
  ["8.5", { patch: "13.11", lang: "vi_vn", mutators: ["TFTSet8_Stage2"] }],
  ["9", { patch: "13.17", lang: "vi_vn", mutators: ["TFTSet9"] }],
  ["9.5", { patch: "13.22", lang: "vi_vn", mutators: ["TFTSet9_Stage2"] }],
  ["10", { patch: "14.6", lang: "vi_vn", mutators: ["TFTSet10"] }],
  ["11", { patch: "14.14", lang: "vi_vn", mutators: ["TFTSet11"] }],
  ["12", { patch: "14.23", lang: "vi_vn", mutators: ["TFTSet12"] }],
  ["13", { patch: "latest", lang: "vi_vn", mutators: ["TFTSet13"] }],
  ["14", { patch: "latest", lang: "vi_vn", mutators: ["TFTSet14"] }],
  ["15", { patch: "latest", lang: "vi_vn", mutators: ["TFTSet15"] }],
  ["16", { patch: "latest", lang: "vi_vn", mutators: ["TFTSet16"] }],
  ["17", { patch: "latest", lang: "vi_vn", mutators: ["TFTSet17"] }],
  ["18", { patch: "latest", lang: "vi_vn", mutators: ["TFTSet18"], itemFamily: "DA" }],
];

// Các file tiếng Việt dùng để dịch dữ liệu tiếng Anh của mùa 1–6.
const TRANSLATION_PATCHES = ["latest", "14.23", "14.6", "13.22", "13.17", "13.11", "13.5", "12.22"];

// Mã style của CommunityDragon -> cấp bậc mốc kích hoạt. Quy ước thay đổi theo thời kỳ
// (đã đối chiếu với các Tộc/Hệ đã biết của Mùa 4, 6, 8, 9, 10, 12, 14, 18).
const STYLE_MAPS = {
  // <= 12.10 (Mùa 4 – 6.5)
  A: { 1: "bronze", 2: "silver", 3: "gold", 4: "prismatic" },
  // 12.11 – 14.14 (Mùa 7.5 – 11)
  B: { 1: "bronze", 2: "silver", 3: "silver", 4: "gold", 5: "prismatic", 6: "unique" },
  // >= 14.23 (Mùa 12 trở đi)
  C: { 1: "bronze", 2: "silver", 3: "silver", 4: "unique", 5: "gold", 6: "prismatic" },
};
function styleEra(patch) {
  if (patch === "latest") return "C";
  const [major, minor] = patch.split(".").map(Number);
  if (major < 12 || (major === 12 && minor <= 10)) return "A";
  if (major <= 13 || (major === 14 && minor <= 14)) return "B";
  return "C";
}
const BASE_COMPONENTS = [
  "BFSword", "RecurveBow", "NeedlesslyLargeRod", "TearOfTheGoddess", "ChainVest",
  "NegatronCloak", "GiantsBelt", "SparringGloves", "Spatula", "FryingPan",
].join("|");
const LEGACY_STYLES = ["bronze", "silver", "gold", "prismatic"];

// ---------------------------------------------------------------------------

const assetUrl = (p) => {
  if (!p || p === "None" || p.startsWith("{")) return "";
  return `${CDRAGON}/latest/game/${p.toLowerCase().replace(/\.(tex|dds)$/, ".png")}`;
};
const versionedAssetUrl = (p, patch) => (assetUrl(p) ? assetUrl(p).replace("/latest/", `/${patch}/`) : "");

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "");
// Mô tả CommunityDragon dùng "\r\n" thô và các thẻ định dạng riêng.
const cleanText = (s) => (s ?? "").replace(/\r/g, "").replace(/\\n/g, "\n").trim();

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

const cache = new Map();
async function loadPatch(patch, lang) {
  const key = `${patch}-${lang}`;
  if (cache.has(key)) return cache.get(key);
  const file = path.join(CACHE_DIR, `${key}.json`);
  let text;
  if (!(patch === "latest" && REFRESH) && (await exists(file))) {
    text = await readFile(file, "utf8");
  } else {
    const url = `${CDRAGON}/${patch}/cdragon/tft/${lang}.json`;
    process.stdout.write(`↓ ${url}\n`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Tải ${url} thất bại: HTTP ${res.status}`);
    text = await res.text();
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(file, text);
  }
  const data = JSON.parse(text);
  cache.set(key, data);
  return data;
}

// ---------------------------------------------------------------------------
// Bảng dịch apiName -> { name, desc } lấy từ dữ liệu tiếng Việt.

async function buildTranslations() {
  const items = new Map();
  const traits = new Map();
  for (const patch of TRANSLATION_PATCHES) {
    const d = await loadPatch(patch, "vi_vn");
    for (const i of d.items ?? []) {
      if (i.apiName && i.name && !items.has(i.apiName.toLowerCase())) items.set(i.apiName.toLowerCase(), i);
    }
    for (const s of d.setData ?? []) {
      for (const t of s.traits ?? []) {
        if (t.apiName && t.name && !traits.has(t.apiName.toLowerCase())) traits.set(t.apiName.toLowerCase(), t);
      }
    }
  }
  return { items, traits };
}

// ---------------------------------------------------------------------------
// Chuẩn hóa

function breakpointsOf(effects, legacy, patch) {
  const list = (effects ?? []).filter((e) => typeof e.minUnits === "number");
  const map = STYLE_MAPS[styleEra(patch)];
  return list.map((e, idx) => {
    let style;
    if (list.length === 1 && e.minUnits === 1) style = "unique";
    else if (!legacy && e.style != null) style = map[e.style] ?? "bronze";
    else style = LEGACY_STYLES[Math.min(idx, LEGACY_STYLES.length - 1)];
    return { count: e.minUnits, style, effect: "", variables: e.variables ?? {} };
  });
}

function normalizeSet(n, src, raw, items, tr) {
  const { legacy, patch } = src;
  const translate = src.lang !== "vi_vn";

  // Tộc/Hệ
  const allTraits = (raw.traits ?? []).map((t) => {
    const id = t.apiName ?? `Set${n}_${slug(t.name)}`;
    const vi = translate ? tr.traits.get(id.toLowerCase()) : null;
    return {
      id,
      name: vi?.name ?? t.name,
      description: cleanText(vi?.desc ?? t.desc),
      icon: versionedAssetUrl(t.icon, patch),
      breakpoints: breakpointsOf(t.effects, legacy, patch),
      _rawName: t.name,
    };
  });
  const traitIdByName = new Map(allTraits.map((t) => [t._rawName, t.id]));

  // Tướng: bỏ lính, quái, vật thể trên bàn (không có giá hoặc không có tộc/hệ).
  const champions = (raw.champions ?? [])
    .filter((c) => c.cost > 0 && c.cost < 20 && (c.traits ?? []).length > 0)
    .map((c) => ({
      id: c.apiName ?? `TFT${n}_${slug(c.name)}`,
      name: c.name,
      cost: c.cost,
      traits: c.traits.map((name) => traitIdByName.get(name) ?? `Set${n}_${slug(name)}`),
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
        description: cleanText(c.ability?.desc),
        icon: versionedAssetUrl(c.ability?.icon, patch),
        variables: Object.fromEntries(
          (c.ability?.variables ?? []).map((v) => [v.name, (v.value ?? []).map(num)]),
        ),
      },
      icon: versionedAssetUrl(c.squareIcon ?? c.tileIcon ?? c.icon, patch),
    }));

  // Chỉ giữ tộc/hệ mà ít nhất một tướng sở hữu (loại cơ chế phụ, Lõi, Kỳ Ngộ…).
  const used = new Set(champions.flatMap((c) => c.traits));
  const traits = allTraits.filter((t) => used.has(t.id));
  for (const t of allTraits) delete t._rawName;

  return {
    traits,
    champions,
    items: normalizeItems(n, items, src.itemFamily ?? "TFT", patch, translate ? tr : null),
  };
}

function normalizeItems(n, rawItems = [], family, patch, tr) {
  // Định dạng cũ: id dạng số, công thức ở `from` (mảng id số). Suy ra apiName từ tên icon.
  const legacyApi = (i) => {
    const m = /(TFT\d*_Item_[A-Za-z0-9]+)/i.exec(i.icon ?? "");
    return m ? m[1].replace(/^tft/i, "TFT").replace(/_item_/i, "_Item_") : `TFT${n}_Item_${slug(i.name)}`;
  };
  const list = rawItems.map((i) => {
    const id = i.apiName || legacyApi(i);
    return { raw: i, id };
  });
  const byNumericId = new Map(list.filter((x) => x.raw.id != null).map((x) => [x.raw.id, x.id]));
  const componentsOf = (i) =>
    i.composition?.length
      ? i.composition
      : (i.from ?? []).map((id) => byNumericId.get(id)).filter(Boolean);

  // Mảnh cơ bản của mùa. Mùa 18 dùng hệ trang bị mới (tiền tố DA_Component_).
  const componentRe =
    family === "DA"
      ? new RegExp(`^DA_Component_(${BASE_COMPONENTS})$`)
      : new RegExp(`^TFT(${n})?_Item_(${BASE_COMPONENTS})$`);
  // Trang bị thuộc mùa này: dùng chung (TFT_Item_ / DA_) hoặc riêng của mùa (TFT<n>_ / DA_<n>_).
  const ownRe = family === "DA" ? new RegExp(`^DA_(?!\\d+_)|^DA_${n}_`) : new RegExp(`^TFT(${n})?_Item_`);
  const isPlaceholder = (name) => /^tft_item_name_|^tft\d*_|_Name$/i.test(name);

  const withComp = list.map((x) => ({ ...x, components: componentsOf(x.raw) }));
  const componentIds = new Set(withComp.filter((x) => componentRe.test(x.id)).map((x) => x.id));

  const seen = new Set();
  return withComp
    .filter(({ raw, id, components }) => {
      if (!id || seen.has(id) || !raw.name || isPlaceholder(raw.name)) return false;
      if (raw.isAugment || /_Augment_|_Consumable_|_Merc/i.test(id)) return false;
      if (!ownRe.test(id)) return false; // trang bị/Ấn của mùa khác
      const keep =
        componentIds.has(id) ||
        (components.length === 2 && components.every((c) => componentIds.has(c))) ||
        (new RegExp(`^(TFT${n}_Item_|DA_${n}_)`).test(id) && // Ấn, trang bị đặc biệt riêng của mùa
          (family !== "DA" || /Emblem|Radiant|Artifact|Ornn/i.test(id))); // DA_ còn chứa cả Lõi
      // Một số trang bị có nhiều bản sao (theo cấp/biến thể) cùng tên: chỉ giữ bản đầu tiên.
      const nameKey = `${components.join("+")}|${raw.name.trim()}`;
      if (!keep || seen.has(nameKey)) return false;
      seen.add(id);
      seen.add(nameKey);
      return true;
    })
    .map(({ raw, id, components }) => {
      const vi = tr?.items.get(id.toLowerCase());
      return {
        id,
        name: vi?.name ?? raw.name,
        components,
        description: cleanText(vi?.desc ?? raw.desc),
        isUnique: Boolean(raw.unique),
        icon: versionedAssetUrl(raw.icon, patch),
      };
    });
}

// ---------------------------------------------------------------------------

async function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const meta = JSON.parse(await readFile(META_FILE, "utf8"));
  const tr = await buildTranslations();
  await mkdir(OUT_DIR, { recursive: true });

  const problems = [];
  for (const [id, src] of SET_SOURCES) {
    if (only.length && !only.includes(id)) continue;
    const n = Math.floor(Number(id)); // số mùa gốc, dùng cho tiền tố apiName (TFT4_, Set4_…)
    const data = await loadPatch(src.patch, src.lang);

    let raw;
    if (src.legacy) raw = data.sets?.[String(n)];
    else {
      for (const m of src.mutators) {
        raw = (data.setData ?? []).find((s) => s.mutator === m && (s.champions ?? []).length > 10);
        if (raw) break;
      }
    }
    if (!raw) {
      problems.push(`Mùa ${id}: không tìm thấy dữ liệu trong bản vá ${src.patch}`);
      continue;
    }

    const m = meta[id] ?? {};
    const out = {
      setId: Number(id),
      name: m.name ?? `Mùa ${id}`,
      nameEn: m.nameEn ?? null,
      isMidSet: id.includes("."),
      releaseDate: m.releaseDate ?? null,
      boardSize: { rows: id === "1" ? 3 : 4, cols: 7 },
      mechanic: m.mechanic ?? "",
      source: { patch: src.patch, lang: src.lang },
      ...normalizeSet(n, src, raw, data.items, tr),
    };
    const file = path.join(OUT_DIR, `set-${id}.json`);
    await writeFile(file, JSON.stringify(out, null, 2) + "\n");
    console.log(
      `✔ Mùa ${id.padStart(4)}: ${out.champions.length} tướng, ${out.traits.length} tộc/hệ, ` +
        `${out.items.length} trang bị  (${src.patch}/${src.lang})`,
    );
  }

  // Mục lục các mùa theo thứ tự thời gian, dùng cho trang Dòng thời gian & script ảnh.
  const index = SET_SOURCES.map(([id]) => ({
    id,
    name: meta[id]?.name ?? `Mùa ${id}`,
    nameEn: meta[id]?.nameEn ?? null,
    releaseDate: meta[id]?.releaseDate ?? null,
    isMidSet: id.includes("."),
  }));
  await writeFile(path.join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2) + "\n");

  if (problems.length) {
    console.warn("\n⚠ " + problems.join("\n⚠ "));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
