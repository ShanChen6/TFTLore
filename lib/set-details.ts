import "server-only";
import type { SetDetails } from "@/components/wiki/view";
import { abilityHtml, abilityVariableRows, itemHtml } from "./format";
import type { SetData } from "./types";

/** Phần dữ liệu nặng của trang mùa (mô tả kỹ năng, chỉ số, mô tả trang bị) – tải khi cần. */
export function buildSetDetails(set: SetData): SetDetails {
  return {
    champions: Object.fromEntries(
      set.champions.map((c) => [
        c.id,
        {
          stats: c.stats,
          ability: { name: c.ability.name, html: abilityHtml(c), variables: abilityVariableRows(c) },
        },
      ]),
    ),
    items: Object.fromEntries(set.items.map((i) => [i.id, itemHtml(i)])),
  };
}
