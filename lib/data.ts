import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { SetData, SetIndexEntry } from "./types";

const DATA_DIR = path.join(process.cwd(), "data/sets");

/** Mục lục các mùa theo thứ tự thời gian (gồm cả mùa giữa kỳ). */
export const getSetIndex = cache((): SetIndexEntry[] =>
  JSON.parse(readFileSync(path.join(DATA_DIR, "index.json"), "utf8")),
);

export const getSet = cache((id: string): SetData | null => {
  if (!getSetIndex().some((s) => s.id === id)) return null;
  return JSON.parse(readFileSync(path.join(DATA_DIR, `set-${id}.json`), "utf8"));
});

/** Tướng đắt nhất (ưu tiên giá 5) làm ảnh đại diện cho mùa. */
export function coverChampionIcon(set: SetData): string | null {
  const sorted = [...set.champions].sort((a, b) => {
    const score = (c: number) => (c === 5 ? 100 : c);
    return score(b.cost) - score(a.cost);
  });
  return sorted[0]?.icon ?? null;
}
