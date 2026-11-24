"use client";

import Image from "next/image";
import type { ActiveTrait, BuilderChampion, BuilderItem, BuilderTrait, Unit } from "@/lib/builder";
import { MAX_STARS } from "@/lib/builder";
import { costColor, TRAIT_STYLE } from "@/lib/ui";

export function SynergyPanel({ traits }: { traits: ActiveTrait[] }) {
  if (!traits.length) {
    return <p className="text-sm text-white/55">Chưa có Tộc/Hệ nào. Hãy thêm tướng lên bàn cờ.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {traits.map((t) => (
        <li
          key={t.trait.id}
          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${t.style ? "bg-white/5" : "opacity-50"}`}
        >
          <span
            className={`hex flex h-8 w-8 shrink-0 items-center justify-center ${
              t.style ? TRAIT_STYLE[t.style].className : "bg-slate-700"
            }`}
          >
            {t.trait.icon && (
              <Image
                src={t.trait.icon}
                alt=""
                width={18}
                height={18}
                className={t.style && t.style !== "bronze" && t.style !== "unique" ? "invert" : ""}
              />
            )}
          </span>
          <span className="w-6 text-center font-mono font-bold">{t.count}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{t.trait.name}</p>
            <p className="flex flex-wrap gap-x-1 text-[11px] text-white/55">
              {t.trait.breakpoints.map((b, i) => (
                <span key={i} className={i === t.level ? "font-bold text-white" : ""}>
                  {i > 0 && <span className="text-white/20">›</span>} {b.count}
                </span>
              ))}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function UnitPanel({
  unit,
  champ,
  traitById,
  itemById,
  onStars,
  onRemoveItem,
  onRemove,
  onClose,
}: {
  unit: Unit;
  champ: BuilderChampion;
  traitById: Map<string, BuilderTrait>;
  itemById: Map<string, BuilderItem>;
  onStars: (stars: number) => void;
  onRemoveItem: (index: number) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  return (
    <div className="rounded-xl border border-amber-300/40 bg-slate-900 p-3">
      <div className="flex items-start gap-3">
        <span className={`relative block h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${costColor(champ.cost).border}`}>
          <Image src={champ.icon} alt="" fill sizes="56px" className="object-cover" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{champ.name}</p>
          <p className="truncate text-xs text-white/50">
            {champ.cost} vàng · {champ.traits.map((t) => traitById.get(t)?.name ?? t).join(" · ")}
          </p>
          <div className="mt-1.5 flex gap-1" role="group" aria-label="Cấp sao">
            {Array.from({ length: MAX_STARS }, (_, i) => i + 1).map((s) => (
              <button
                key={s}
                onClick={() => onStars(s)}
                aria-pressed={unit.stars === s}
                className={`rounded px-2 py-0.5 text-xs ${
                  unit.stars === s ? "bg-amber-300 text-slate-900" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {s}★
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} aria-label="Bỏ chọn" className="text-white/50 hover:text-white">
          ✕
        </button>
      </div>

      <div className="mt-3">
        <p className="text-xs text-white/50">Trang bị ({unit.items.length}/3) – bấm để gỡ</p>
        <div className="mt-1 flex min-h-10 flex-wrap gap-1.5">
          {unit.items.map((id, i) => {
            const item = itemById.get(id);
            if (!item) return null;
            return (
              <button
                key={i}
                onClick={() => onRemoveItem(i)}
                title={`Gỡ ${item.name}`}
                className="flex items-center gap-1 rounded bg-white/5 py-0.5 pr-2 pl-0.5 text-xs hover:bg-rose-500/20"
              >
                <Image src={item.icon} alt="" width={28} height={28} className="rounded" />
                <span className="max-w-28 truncate">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onRemove}
        className="mt-3 w-full rounded-lg border border-rose-400/40 py-1.5 text-sm text-rose-300 hover:bg-rose-500/10"
      >
        Xóa khỏi bàn cờ
      </button>
    </div>
  );
}
