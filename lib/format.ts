// Chuyển mô tả thô của Riot/CommunityDragon (biến @Tên@, thẻ <magicDamage>, %i:scaleAP%…)
// thành HTML an toàn để hiển thị. Chạy ở phía server khi build trang tĩnh.

import type { Champion, Item, Trait } from "./types";

/** Giá trị biến: một số, hoặc mảng số theo 1★/2★/3★ (kỹ năng tướng). */
type VarValue = number | number[];
type Vars = Record<string, VarValue | null | undefined>;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Thẻ được giữ lại -> class Tailwind. */
const TAG_CLASS: Record<string, string> = {
  magicdamage: "text-sky-300",
  physicaldamage: "text-orange-300",
  truedamage: "font-semibold text-white",
  tftbonus: "text-amber-200",
  tftkeyword: "font-semibold text-amber-200",
  keyword: "font-semibold text-amber-200",
  tftbold: "font-semibold text-white",
  tftstrong: "font-semibold text-white",
  bright: "font-semibold text-white",
  spellactive: "font-semibold text-emerald-300",
  spellpassive: "font-semibold text-emerald-300",
  status: "font-semibold text-violet-300",
  active: "font-semibold text-emerald-300",
  tftshadowitembonus: "text-violet-300",
  tftradiantitembonus: "text-yellow-200",
};
/** Thẻ dạng khối ghi chú luật chơi. */
const RULE_TAGS = new Set(["rules", "tftitemrules", "specialrules"]);
/** Thẻ điều kiện của client game: không có ngữ cảnh trận đấu nên bỏ nội dung. */
const DROP_CONTENT_TAGS = new Set(["showifnot"]);

/** Biểu tượng chỉ số %i:scaleXX% -> nhãn viết tắt tiếng Việt. */
const STAT_LABEL: Record<string, string> = {
  scaleAP: "SMPT",
  scaleAD: "SMCK",
  scaleHealth: "Máu",
  scaleArmor: "Giáp",
  scaleMR: "KP",
  scaleAS: "TĐĐ",
  scaleLevel: "Cấp",
  scaleMana: "NL",
  scaleRange: "Tầm",
  scaleSouls: "Linh Hồn",
  scaleSerpents: "Xà Bạc",
  scaleCrit: "TLCM",
  scaleCritMult: "STCM",
  scaleDA: "Khuếch đại ST",
  scaleDR: "Giảm ST",
  scaleSV: "Hút máu toàn phần",
  scaleManaRegen: "Hồi NL",
  TFTManaRegen: "Hồi NL",
  scaleMS: "Tốc chạy",
  scaleHPRegen: "Hồi máu",
  TFTBaseAD: "SMCK gốc",
  goldCoins: "Vàng",
  star: "★",
};

function formatNumber(v: number): string {
  const r = Math.round(v * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

/** Tra biến theo tên (không phân biệt hoa thường), thử cả bản bỏ tiền tố "Modified"/"Total". */
function lookup(vars: Vars, name: string): VarValue | null {
  const keys = Object.keys(vars);
  const find = (n: string) => keys.find((k) => k.toLowerCase() === n.toLowerCase());
  const candidates = [name, name.replace(/^(Modified|Total|Calc)/, ""), name.replace(/Calc\d*$/, "")];
  for (const c of candidates) {
    const k = find(c);
    if (k !== undefined && vars[k] != null) return vars[k] as VarValue;
  }
  return null;
}

function formatValue(v: VarValue, mult = 1): string {
  const list = (Array.isArray(v) ? v : [v]).map((x) => formatNumber(x * mult));
  return list.every((x) => x === list[0]) ? list[0] : list.join(" / ");
}

const isRatio = (v: VarValue) => (Array.isArray(v) ? v : [v]).every((x) => x > 0 && x < 1);

/**
 * Thay @Tên@ / @Tên*100@ bằng giá trị. Với "@Tên@%" mà giá trị là tỉ lệ (0 < x < 1),
 * nhân 100 như cách client game hiển thị.
 */
function substitute(text: string, vars: Vars): string {
  return text
    .replace(/@[A-Za-z0-9_]*[.:][^@\s]*@/g, "") // thuộc tính nội bộ của client (TFTUnitProperty…)
    .replace(
      /@([A-Za-z0-9_.{}]+?)(?:\*(\d+(?:\.\d+)?))?@(%?)/g,
      (_, name: string, mult: string | undefined, pct: string) => {
        const v = lookup(vars, name);
        if (v == null) return "\u0000?\u0000" + pct; // giá trị chưa xác định, xử lý ở bước render
        const factor = mult ? Number(mult) : pct && isRatio(v) ? 100 : 1;
        return formatValue(v, factor) + pct;
      },
    );
}

/** Render chuỗi đã thay biến thành HTML (whitelist thẻ). */
function renderMarkup(text: string): string {
  let out = "";
  let dropDepth = 0;
  const cleaned = text
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\r/g, "")
    .replace(/\\n/g, "\n");
  const re = /<\/?([A-Za-z]+)[^>]*>|%i:([A-Za-z]+)%|\n|\u0000\?\u0000/g;
  let last = 0;
  const stack: string[] = [];
  for (const m of cleaned.matchAll(re)) {
    const chunk = cleaned.slice(last, m.index);
    if (!dropDepth) out += escapeHtml(chunk);
    last = (m.index ?? 0) + m[0].length;
    const token = m[0];
    if (token === "\n") {
      if (!dropDepth) out += "<br/>";
      continue;
    }
    if (token === "\u0000?\u0000") {
      if (!dropDepth) out += '<span class="text-white/40" title="Giá trị được tính trong trận">?</span>';
      continue;
    }
    if (m[2]) {
      const label = STAT_LABEL[m[2]];
      if (label && !dropDepth) out += `<span class="ml-0.5 text-[0.7em] text-white/50">${label}</span>`;
      continue;
    }
    const tag = m[1].toLowerCase();
    const closing = token.startsWith("</");
    if (tag === "br") {
      if (!dropDepth) out += "<br/>";
      continue;
    }
    if (DROP_CONTENT_TAGS.has(tag)) {
      dropDepth += closing ? -1 : 1;
      dropDepth = Math.max(0, dropDepth);
      continue;
    }
    if (dropDepth) continue;
    if (closing) {
      const idx = stack.lastIndexOf(tag);
      if (idx !== -1) {
        // đóng các thẻ còn mở phía trên để HTML luôn hợp lệ
        while (stack.length > idx) {
          stack.pop();
          out += "</span>";
        }
      }
      continue;
    }
    if (token.endsWith("/>")) continue;
    if (RULE_TAGS.has(tag)) {
      stack.push(tag);
      out += '<span class="mt-1 block text-xs text-white/50">';
    } else if (TAG_CLASS[tag]) {
      stack.push(tag);
      out += `<span class="${TAG_CLASS[tag]}">`;
    }
  }
  if (!dropDepth) out += escapeHtml(cleaned.slice(last));
  while (stack.pop()) out += "</span>";
  // gộp các <br/> thừa ở đầu/cuối
  return out.replace(/^(<br\/>)+|(<br\/>)+$/g, "").replace(/(<br\/>){3,}/g, "<br/><br/>");
}

/** Giá trị kỹ năng theo sao (index 1–3 của mảng CommunityDragon). */
function starVars(variables: Champion["ability"]["variables"]): Vars {
  const out: Vars = {};
  for (const [k, arr] of Object.entries(variables)) {
    const stars = [1, 2, 3].map((i) => arr[i] ?? arr[0]).filter((v): v is number => v != null);
    if (stars.length) out[k] = stars;
  }
  return out;
}

export function abilityHtml(champ: Champion): string {
  return renderMarkup(substitute(champ.ability.description, starVars(champ.ability.variables)));
}

export function itemHtml(item: Item): string {
  return renderMarkup(substitute(item.description, item.variables ?? {}));
}

export interface FormattedTrait {
  introHtml: string;
  /** HTML hiệu ứng ở từng mốc, cùng thứ tự với trait.breakpoints. */
  effectsHtml: string[];
}

export function formatTrait(trait: Trait): FormattedTrait {
  const desc = trait.description;
  const bps = trait.breakpoints;
  const varsAt = (i: number): Vars => ({ ...(bps[i]?.variables ?? {}), MinUnits: bps[i]?.count });

  const expand = /<expandRow>([\s\S]*?)<\/expandRow>/i.exec(desc);
  const rows = [...desc.matchAll(/<row>([\s\S]*?)<\/row>/gi)].map((m) => m[1]);

  let intro = desc;
  let effects: string[] = [];
  if (expand) {
    intro = desc.replace(expand[0], "");
    effects = bps.map((_, i) => renderMarkup(substitute(expand[1], varsAt(i))));
  } else if (rows.length) {
    intro = desc.replace(/<row>[\s\S]*?<\/row>/gi, "");
    effects = bps.map((_, i) => (rows[i] ? renderMarkup(substitute(rows[i], varsAt(i))) : ""));
  }
  // Bỏ tiền tố "(3)" ở đầu mỗi dòng vì giao diện đã hiển thị số mốc riêng.
  effects = effects.map((e) => e.replace(/^\(\s*\d+\s*\)\s*/, ""));
  return { introHtml: renderMarkup(substitute(intro, varsAt(0))), effectsHtml: effects };
}

/** Bảng giá trị biến kỹ năng theo sao (bỏ biến hằng 0 và biến nội bộ dạng {hash}). */
export function abilityVariableRows(champ: Champion): { name: string; values: string[] }[] {
  return Object.entries(champ.ability.variables)
    .filter(([k, arr]) => !k.startsWith("{") && arr.slice(1, 4).some((v) => v != null && v !== 0))
    .map(([name, arr]) => ({
      name,
      values: [1, 2, 3].map((i) => (arr[i] == null ? "–" : formatNumber(arr[i] as number))),
    }));
}
