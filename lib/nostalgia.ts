import "server-only";
import { getSet, getSetIndex } from "./data";
import type { TraitStyle } from "./types";

/** Khóa nhận diện xuyên mùa: bỏ tiền tố mùa (TFT9_, Set3_, DA_18_…) và hậu tố số. */
export function crossSetKey(id: string): string {
  return id
    .toLowerCase()
    .replace(/^(tft\d*|set\d*|da(_\d+)?)_/, "")
    .replace(/_/g, "")
    .replace(/\d+$/, "");
}

const isMain = (setId: string) => !setId.includes(".");

// ---------------------------------------------------------------------------
// Bảng vàng tướng

export interface ChampionAppearance {
  setId: string;
  setName: string;
  cost: number;
  icon: string;
  abilityName: string;
  traits: string[];
}

export interface ChampionHistory {
  key: string;
  name: string;
  icon: string;
  mainSets: number;
  appearances: ChampionAppearance[];
}

export function championHistory(limit = 16): ChampionHistory[] {
  const map = new Map<string, ChampionAppearance[]>();
  const names = new Map<string, string>();
  for (const entry of getSetIndex()) {
    const set = getSet(entry.id)!;
    const traitName = new Map(set.traits.map((t) => [t.id, t.name]));
    for (const c of set.champions) {
      const key = crossSetKey(c.id);
      if (!map.has(key)) map.set(key, []);
      // một mùa có thể có 2 phiên bản cùng tướng (vd. dạng biến hình) -> chỉ lấy bản đầu
      if (map.get(key)!.some((a) => a.setId === entry.id)) continue;
      map.get(key)!.push({
        setId: entry.id,
        setName: set.name,
        cost: c.cost,
        icon: c.icon,
        abilityName: c.ability.name,
        traits: c.traits.map((t) => traitName.get(t) ?? t),
      });
      names.set(key, c.name);
    }
  }
  return [...map.entries()]
    .map(([key, appearances]) => ({
      key,
      name: names.get(key)!,
      icon: appearances[appearances.length - 1].icon,
      mainSets: new Set(appearances.filter((a) => isMain(a.setId)).map((a) => a.setId)).size,
      appearances,
    }))
    .sort((a, b) => b.mainSets - a.mainSets || b.appearances.length - a.appearances.length)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Tiến hóa Tộc/Hệ

export interface TraitAppearance {
  setId: string;
  setName: string;
  name: string;
  icon: string;
  breakpoints: { count: number; style: TraitStyle }[];
  champions: { name: string; icon: string; cost: number }[];
}

export interface TraitEvolution {
  title: string;
  keys: string[];
  appearances: TraitAppearance[];
}

/** Các Tộc/Hệ kinh điển (khóa apiName đã chuẩn hóa). */
export const CLASSIC_TRAITS: { title: string; keys: string[] }[] = [
  { title: "Vệ Binh Tinh Tú", keys: ["starguardian"] },
  { title: "Hư Không", keys: ["void"] },
  { title: "Ác Quỷ", keys: ["demon"] },
  { title: "Đấu Sĩ", keys: ["brawler", "bruiser"] },
  { title: "Pháp Sư", keys: ["sorcerer", "mage", "arcanist"] },
  { title: "Sát Thủ", keys: ["assassin"] },
  { title: "Bắn Tỉa", keys: ["sniper"] },
  { title: "Yordle", keys: ["yordle"] },
];

export function traitEvolution(): TraitEvolution[] {
  const index = getSetIndex();
  return CLASSIC_TRAITS.map(({ title, keys }) => {
    const appearances: TraitAppearance[] = [];
    for (const entry of index) {
      const set = getSet(entry.id)!;
      for (const t of set.traits) {
        if (!keys.includes(crossSetKey(t.id))) continue;
        appearances.push({
          setId: entry.id,
          setName: set.name,
          name: t.name,
          icon: t.icon,
          breakpoints: t.breakpoints.map((b) => ({ count: b.count, style: b.style })),
          champions: set.champions
            .filter((c) => c.traits.includes(t.id))
            .sort((a, b) => a.cost - b.cost)
            .map((c) => ({ name: c.name, icon: c.icon, cost: c.cost })),
        });
      }
    }
    return { title, keys, appearances };
  }).filter((t) => t.appearances.length > 0);
}

// ---------------------------------------------------------------------------
// Kỷ lục nhanh

export interface RecordStat {
  label: string;
  value: string;
  detail: string;
}

export function quickRecords(): RecordStat[] {
  const sets = getSetIndex().map((e) => getSet(e.id)!);
  const most = (f: (s: (typeof sets)[number]) => number) => sets.reduce((a, b) => (f(b) > f(a) ? b : a));
  const mostChamps = most((s) => s.champions.length);
  const mostTraits = most((s) => s.traits.length);
  const deepest = sets
    .flatMap((s) => s.traits.map((t) => ({ s, t })))
    .reduce((a, b) => {
      const max = (x: typeof a) => x.t.breakpoints[x.t.breakpoints.length - 1]?.count ?? 0;
      return max(b) > max(a) ? b : a;
    });
  const totalChamps = sets.reduce((n, s) => n + s.champions.length, 0);
  const uniqueChamps = new Set(sets.flatMap((s) => s.champions.map((c) => crossSetKey(c.id)))).size;
  return [
    { label: "Mùa giải", value: String(sets.length), detail: `${sets.filter((s) => !s.isMidSet).length} mùa chính + ${sets.filter((s) => s.isMidSet).length} mùa giữa kỳ` },
    { label: "Lượt tướng", value: String(totalChamps), detail: `${uniqueChamps} tướng khác nhau qua các mùa` },
    { label: "Đông tướng nhất", value: String(mostChamps.champions.length), detail: `${mostChamps.name}${mostChamps.nameEn ? ` (${mostChamps.nameEn})` : ""}` },
    { label: "Nhiều Tộc/Hệ nhất", value: String(mostTraits.traits.length), detail: mostTraits.name },
    {
      label: "Mốc Tộc/Hệ cao nhất",
      value: String(deepest.t.breakpoints[deepest.t.breakpoints.length - 1].count),
      detail: `${deepest.t.name} – ${deepest.s.name}`,
    },
  ];
}
