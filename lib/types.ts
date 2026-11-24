// Schema chuẩn hóa dùng chung cho dữ liệu 18 mùa (xem docs/ROADMAP.md – Phụ lục).

export type TraitStyle = "bronze" | "silver" | "gold" | "prismatic" | "unique";

export interface TraitBreakpoint {
  count: number;
  style: TraitStyle;
  effect: string;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  icon: string;
  breakpoints: TraitBreakpoint[];
}

export interface ChampionStats {
  hp: number | null;
  mana: { initial: number | null; max: number | null };
  armor: number | null;
  mr: number | null;
  ad: number | null;
  as: number | null;
  range: number | null;
}

export interface Champion {
  id: string;
  name: string;
  cost: number;
  traits: string[];
  stats: ChampionStats;
  ability: { name: string; description: string; icon: string };
  icon: string;
}

export interface Item {
  id: string;
  name: string;
  components: string[];
  description: string;
  isUnique: boolean;
  icon: string;
}

export interface SetData {
  setId: number;
  name: string;
  releaseDate: string | null;
  boardSize: { rows: number; cols: number };
  mechanic: string;
  traits: Trait[];
  champions: Champion[];
  items: Item[];
}
