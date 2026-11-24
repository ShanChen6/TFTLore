// Dữ liệu đã định dạng sẵn ở phía server để truyền xuống các component client.
import type { ChampionStats, TraitStyle } from "@/lib/types";

export interface ChampionView {
  id: string;
  name: string;
  cost: number;
  icon: string;
  traits: string[];
  stats: ChampionStats;
  ability: { name: string; html: string; variables: { name: string; values: string[] }[] };
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
  html: string;
  isUnique: boolean;
}
