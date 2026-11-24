// Schema chuẩn hóa dùng chung cho dữ liệu 18 mùa (xem docs/ROADMAP.md – Phụ lục).

export type TraitStyle = "bronze" | "silver" | "gold" | "prismatic" | "unique";

export interface TraitBreakpoint {
  count: number;
  style: TraitStyle;
  effect: string;
  /** Giá trị biến (@Tên@) trong mô tả Tộc/Hệ ở mốc này. */
  variables: Record<string, number | null>;
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
  ability: {
    name: string;
    description: string;
    icon: string;
    /** Giá trị biến (@Tên@) trong mô tả theo chỉ số sao (index 1 = 1★, 2 = 2★, 3 = 3★). */
    variables: Record<string, (number | null)[]>;
  };
  icon: string;
}

export interface Item {
  id: string;
  name: string;
  components: string[];
  description: string;
  isUnique: boolean;
  icon: string;
  /** Giá trị biến (@Tên@) trong mô tả trang bị. */
  variables: Record<string, number | null>;
}

export interface SetData {
  /** Số mùa, mùa giữa kỳ dùng số thập phân (3.5, 4.5…). File tương ứng: data/sets/set-<setId>.json */
  setId: number;
  name: string;
  nameEn: string | null;
  /** Mùa giữa kỳ (.5). */
  isMidSet: boolean;
  releaseDate: string | null;
  boardSize: { rows: number; cols: number };
  mechanic: string;
  /** Bản vá & ngôn ngữ CommunityDragon đã dùng để sinh dữ liệu. */
  source: { patch: string; lang: "vi_vn" | "en_us" };
  traits: Trait[];
  champions: Champion[];
  items: Item[];
}

/** Một mục trong data/sets/index.json (theo thứ tự thời gian). */
export interface SetIndexEntry {
  id: string;
  name: string;
  nameEn: string | null;
  releaseDate: string | null;
  isMidSet: boolean;
}
