// Dữ liệu đã định dạng sẵn ở phía server để truyền xuống các component client.
import type { ChampionStats, TraitStyle } from "@/lib/types";

/** Dữ liệu tướng gọn, nhúng sẵn trong trang (lưới tướng, bộ lọc). */
export interface ChampionView {
  id: string;
  name: string;
  cost: number;
  icon: string;
  traits: string[];
}

/** Chi tiết tướng, chỉ tải khi mở popup (từ /api/sets/<id>/details). */
export interface ChampionDetail {
  stats: ChampionStats;
  ability: { name: string; html: string; variables: { name: string; values: string[] }[] };
}

/** Dữ liệu tải theo yêu cầu cho trang mùa. */
export interface SetDetails {
  champions: Record<string, ChampionDetail>;
  /** HTML mô tả trang bị theo id. */
  items: Record<string, string>;
}

export interface TraitView {
  id: string;
  name: string;
  icon: string;
  introHtml: string;
  breakpoints: { count: number; style: TraitStyle; effectHtml: string }[];
  champions: string[];
}

export interface ItemView {
  id: string;
  name: string;
  icon: string;
  components: string[];
  isUnique: boolean;
}
