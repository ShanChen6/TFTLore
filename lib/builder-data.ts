import "server-only";
import type { BuilderData, BuilderItem } from "./builder";
import { getSet } from "./data";
import type { Item, SetData, Trait } from "./types";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Tìm Tộc/Hệ mà một trang bị Ấn mang lại: theo tên, theo apiName, rồi theo mô tả. */
function emblemTrait(item: Item, traits: Trait[]): string | undefined {
  const byName = new Map(traits.map((t) => [norm(t.name), t.id]));

  // 1) "Ấn Hiệp Sĩ" / "Knight Emblem"
  const stripped = norm(item.name.replace(/^Ấn\s+/i, "").replace(/\s+Emblem$/i, ""));
  if (byName.has(stripped)) return byName.get(stripped);

  // 2) apiName: TFT9_Item_DemaciaEmblem / DA_18_EmblemSlayer <-> Set9_Demacia / DA_18_Slayer
  const key = item.id
    .replace(/^.*?_Item_/i, "")
    .replace(/^DA_\d+_/i, "")
    .replace(/Emblem(Item)?|Item|Spatula/gi, "")
    .toLowerCase();
  if (key) {
    const hit = traits.find((t) => t.id.split("_").pop()!.toLowerCase() === key);
    if (hit) return hit.id;
  }

  // 3) Mô tả nhắc tên Tộc/Hệ (chọn tên dài nhất để tránh khớp nhầm tên ngắn)
  const desc = ` ${norm(item.description)} `;
  const candidates = traits
    .filter((t) => norm(t.name).length >= 3 && desc.includes(` ${norm(t.name)} `))
    .sort((a, b) => b.name.length - a.name.length);
  return candidates[0]?.id;
}

function isEmblemLike(item: Item): boolean {
  if (/emblem/i.test(item.id) || /^Ấn\s/.test(item.name) || /Emblem$/i.test(item.name)) return true;
  const spatulas = item.components.filter((c) => /spatula|fryingpan/i.test(c)).length;
  return spatulas === 1;
}

export function buildBuilderData(set: SetData, id: string): BuilderData {
  const used = new Set(set.items.flatMap((i) => i.components));
  const items: BuilderItem[] = [];
  for (const i of set.items) {
    const isComponent = i.components.length === 0 && used.has(i.id);
    if (isComponent) continue;
    const trait = isEmblemLike(i) ? emblemTrait(i, set.traits) : undefined;
    items.push({
      id: i.id,
      name: i.name.trim(),
      icon: i.icon,
      kind: trait ? "emblem" : i.components.length === 2 ? "completed" : "special",
      isUnique: i.isUnique,
      ...(trait ? { trait } : {}),
    });
  }

  return {
    id,
    name: set.name,
    nameEn: set.nameEn,
    rows: set.boardSize.rows,
    cols: set.boardSize.cols,
    champions: set.champions
      .map((c) => ({ id: c.id, name: c.name, cost: c.cost, icon: c.icon, traits: c.traits }))
      .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, "vi")),
    traits: set.traits.map((t) => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      breakpoints: t.breakpoints.map((b) => ({ count: b.count, style: b.style })),
    })),
    items,
  };
}

export function getBuilderData(id: string): BuilderData | null {
  const set = getSet(id);
  return set ? buildBuilderData(set, id) : null;
}
