// Logic thuần của Team Builder: kiểu dữ liệu, tính Tộc/Hệ, luật trang bị, mã hóa URL.
// Không phụ thuộc React để có thể dùng ở cả server lẫn client.

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { TraitStyle } from "./types";

// ---------------------------------------------------------------------------
// Dữ liệu rút gọn cho builder (sinh tại /api/builder/[setId])

export interface BuilderChampion {
  id: string;
  name: string;
  cost: number;
  icon: string;
  traits: string[];
}

export interface BuilderTrait {
  id: string;
  name: string;
  icon: string;
  breakpoints: { count: number; style: TraitStyle }[];
}

export type ItemKind = "completed" | "emblem" | "special";

export interface BuilderItem {
  id: string;
  name: string;
  icon: string;
  kind: ItemKind;
  isUnique: boolean;
  /** Tộc/Hệ mà Ấn mang lại (chỉ với kind = "emblem"). */
  trait?: string;
}

export interface BuilderData {
  id: string;
  name: string;
  nameEn: string | null;
  rows: number;
  cols: number;
  champions: BuilderChampion[];
  traits: BuilderTrait[];
  items: BuilderItem[];
}

// ---------------------------------------------------------------------------
// Trạng thái bàn cờ

export const MAX_ITEMS = 3;
export const MAX_STARS = 3;

export interface Unit {
  champion: string;
  /** Vị trí ô = hàng * số cột + cột. */
  pos: number;
  stars: number;
  items: string[];
}

// ---------------------------------------------------------------------------
// Synergy Engine

export interface ActiveTrait {
  trait: BuilderTrait;
  count: number;
  /** Mốc đang kích hoạt (chỉ số trong breakpoints), -1 nếu chưa kích hoạt. */
  level: number;
  style: TraitStyle | null;
  /** Số lượng cần cho mốc kế tiếp, null nếu đã đạt mốc cao nhất. */
  next: number | null;
}

const STYLE_RANK: Record<TraitStyle, number> = {
  prismatic: 5,
  gold: 4,
  unique: 4,
  silver: 3,
  bronze: 2,
};

/**
 * Đếm Tộc/Hệ trên bàn cờ:
 * - Mỗi tướng chỉ tính một lần dù xuất hiện nhiều lần (đếm theo tướng độc nhất).
 * - Ấn Tộc/Hệ cộng thêm tộc/hệ cho tướng đang giữ (nếu tướng chưa có tộc/hệ đó).
 * Sắp xếp: Kim Cương → Vàng/Độc nhất → Bạc → Đồng → chưa kích hoạt.
 */
export function computeTraits(units: Unit[], data: BuilderData): ActiveTrait[] {
  const champById = new Map(data.champions.map((c) => [c.id, c]));
  const itemById = new Map(data.items.map((i) => [i.id, i]));
  const contributors = new Map<string, Set<string>>();

  for (const u of units) {
    const champ = champById.get(u.champion);
    if (!champ) continue;
    const traits = new Set(champ.traits);
    for (const itemId of u.items) {
      const t = itemById.get(itemId)?.trait;
      if (t) traits.add(t);
    }
    for (const t of traits) {
      if (!contributors.has(t)) contributors.set(t, new Set());
      contributors.get(t)!.add(u.champion);
    }
  }

  const traitById = new Map(data.traits.map((t) => [t.id, t]));
  const result: ActiveTrait[] = [];
  for (const [id, set] of contributors) {
    const trait = traitById.get(id);
    if (!trait) continue;
    const count = set.size;
    let level = -1;
    trait.breakpoints.forEach((b, i) => {
      if (count >= b.count) level = i;
    });
    const nextBp = trait.breakpoints[level + 1];
    result.push({
      trait,
      count,
      level,
      style: level >= 0 ? trait.breakpoints[level].style : null,
      next: nextBp ? nextBp.count : null,
    });
  }

  return result.sort(
    (a, b) =>
      (b.style ? STYLE_RANK[b.style] : 0) - (a.style ? STYLE_RANK[a.style] : 0) ||
      b.count - a.count ||
      a.trait.name.localeCompare(b.trait.name, "vi"),
  );
}

// ---------------------------------------------------------------------------
// Luật trang bị

/** Trả về lý do từ chối (tiếng Việt) hoặc null nếu được phép gắn. */
export function canEquip(unit: Unit, item: BuilderItem, data: BuilderData): string | null {
  if (unit.items.length >= MAX_ITEMS) return `Mỗi tướng chỉ mang tối đa ${MAX_ITEMS} trang bị.`;
  if (item.isUnique && unit.items.includes(item.id)) return `${item.name} là trang bị Duy Nhất.`;
  if (item.kind === "emblem" && item.trait) {
    const champ = data.champions.find((c) => c.id === unit.champion);
    const traitName = data.traits.find((t) => t.id === item.trait)?.name ?? "";
    if (champ?.traits.includes(item.trait)) return `Tướng đã có Tộc/Hệ ${traitName}.`;
    const itemById = new Map(data.items.map((i) => [i.id, i]));
    if (unit.items.some((id) => itemById.get(id)?.trait === item.trait))
      return `Tướng đã mang Ấn ${traitName}.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Mã hóa trạng thái vào URL (không cần database)

type EncodedUnit = [champion: string, pos: number, stars: number, items: string[]];

export function encodeBoard(units: Unit[]): string {
  if (!units.length) return "";
  const payload: EncodedUnit[] = units.map((u) => [u.champion, u.pos, u.stars, u.items]);
  return compressToEncodedURIComponent(JSON.stringify(payload));
}

/** Giải mã và lọc bỏ dữ liệu không hợp lệ với mùa hiện tại. */
export function decodeBoard(code: string, data: BuilderData): Unit[] {
  try {
    const raw = JSON.parse(decompressFromEncodedURIComponent(code) ?? "[]") as EncodedUnit[];
    if (!Array.isArray(raw)) return [];
    const champs = new Set(data.champions.map((c) => c.id));
    const items = new Set(data.items.map((i) => i.id));
    const cells = data.rows * data.cols;
    const used = new Set<number>();
    const units: Unit[] = [];
    for (const entry of raw) {
      if (!Array.isArray(entry)) continue;
      const [champion, pos, stars, itemIds] = entry;
      if (!champs.has(champion) || !Number.isInteger(pos) || pos < 0 || pos >= cells || used.has(pos)) continue;
      used.add(pos);
      units.push({
        champion,
        pos,
        stars: Math.min(MAX_STARS, Math.max(1, Number(stars) || 1)),
        items: (Array.isArray(itemIds) ? itemIds : []).filter((i) => items.has(i)).slice(0, MAX_ITEMS),
      });
    }
    return units;
  } catch {
    return [];
  }
}
