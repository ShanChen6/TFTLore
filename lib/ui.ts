import type { TraitStyle } from "./types";

/** Màu viền/nhãn theo giá tướng. */
export function costColor(cost: number): { border: string; text: string; bg: string } {
  switch (cost) {
    case 1:
      return { border: "border-slate-400", text: "text-slate-300", bg: "bg-slate-500" };
    case 2:
      return { border: "border-emerald-500", text: "text-emerald-300", bg: "bg-emerald-600" };
    case 3:
      return { border: "border-sky-500", text: "text-sky-300", bg: "bg-sky-600" };
    case 4:
      return { border: "border-fuchsia-500", text: "text-fuchsia-300", bg: "bg-fuchsia-600" };
    case 5:
      return { border: "border-amber-400", text: "text-amber-300", bg: "bg-amber-500" };
    default:
      return { border: "border-rose-400", text: "text-rose-300", bg: "bg-rose-500" };
  }
}

export const TRAIT_STYLE: Record<TraitStyle, { label: string; className: string }> = {
  bronze: { label: "Đồng", className: "bg-[#a0715e] text-white" },
  silver: { label: "Bạc", className: "bg-[#9fb2bf] text-slate-900" },
  gold: { label: "Vàng", className: "bg-[#e2b33e] text-slate-900" },
  prismatic: {
    label: "Kim Cương",
    className: "bg-gradient-to-br from-cyan-200 via-fuchsia-200 to-amber-200 text-slate-900",
  },
  unique: { label: "Độc nhất", className: "bg-[#e07b39] text-white" },
};

export function formatDate(iso: string | null): string {
  if (!iso) return "Chưa rõ";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
