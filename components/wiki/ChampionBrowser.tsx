"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import HtmlText from "./HtmlText";
import type { ChampionView, TraitView } from "./view";
import { costColor } from "@/lib/ui";

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

export default function ChampionBrowser({
  champions,
  traits,
}: {
  champions: ChampionView[];
  traits: TraitView[];
}) {
  const [cost, setCost] = useState<number | null>(null);
  const [trait, setTrait] = useState<string>("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ChampionView | null>(null);

  const traitById = useMemo(() => new Map(traits.map((t) => [t.id, t])), [traits]);
  const costs = useMemo(() => [...new Set(champions.map((c) => c.cost))].sort((a, b) => a - b), [champions]);
  const sortedTraits = useMemo(() => [...traits].sort((a, b) => a.name.localeCompare(b.name, "vi")), [traits]);

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return champions
      .filter((c) => cost === null || c.cost === cost)
      .filter((c) => !trait || c.traits.includes(trait))
      .filter((c) => !q || normalize(c.name).includes(q))
      .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, "vi"));
  }, [champions, cost, trait, query]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Lọc theo giá">
          <FilterButton active={cost === null} onClick={() => setCost(null)}>
            Tất cả
          </FilterButton>
          {costs.map((c) => (
            <FilterButton key={c} active={cost === c} onClick={() => setCost(cost === c ? null : c)}>
              <span className={costColor(c).text}>{c}</span> vàng
            </FilterButton>
          ))}
        </div>
        <select
          value={trait}
          onChange={(e) => setTrait(e.target.value)}
          aria-label="Lọc theo Tộc/Hệ"
          className="rounded-lg border border-white/15 bg-slate-900 px-3 py-1.5 text-sm"
        >
          <option value="">Mọi Tộc/Hệ</option>
          {sortedTraits.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tướng…"
          aria-label="Tìm tướng theo tên"
          className="rounded-lg border border-white/15 bg-slate-900 px-3 py-1.5 text-sm sm:ml-auto sm:w-56"
        />
      </div>

      <p className="mt-3 text-xs text-white/50">{visible.length} tướng</p>

      <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {visible.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => setSelected(c)}
              className={`group w-full overflow-hidden rounded-lg border-2 bg-slate-900 text-left transition hover:-translate-y-0.5 ${costColor(c.cost).border}`}
            >
              <div className="relative aspect-square">
                <Image src={c.icon} alt={c.name} fill sizes="128px" className="object-cover" />
                <span
                  className={`absolute top-1 right-1 rounded px-1 text-[10px] font-bold text-white ${costColor(c.cost).bg}`}
                >
                  {c.cost}
                </span>
              </div>
              <div className="px-1.5 py-1">
                <p className="truncate text-sm font-semibold">{c.name}</p>
                <p className="truncate text-[10px] text-white/50">
                  {c.traits.map((t) => traitById.get(t)?.name ?? t).join(" · ")}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selected && (
        <ChampionModal champ={selected} traitById={traitById} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
        active ? "border-amber-300 bg-amber-300/15 text-amber-100" : "border-white/15 hover:border-white/40"
      }`}
    >
      {children}
    </button>
  );
}

function ChampionModal({
  champ,
  traitById,
  onClose,
}: {
  champ: ChampionView;
  traitById: Map<string, TraitView>;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const s = champ.stats;
  const stats: [string, string | number | null][] = [
    ["Máu", s.hp],
    ["Năng lượng", s.mana.max == null ? null : `${s.mana.initial ?? 0}/${s.mana.max}`],
    ["Giáp", s.armor],
    ["Kháng phép", s.mr],
    ["Sát thương", s.ad],
    ["Tốc độ đánh", s.as],
    ["Tầm đánh", s.range],
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={champ.name}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-white/10 bg-slate-900 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-48 sm:h-56">
          <Image src={champ.icon} alt={champ.name} fill sizes="672px" className="object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-3 right-3 rounded-full bg-black/60 px-3 py-1 text-sm hover:bg-black/80"
          >
            ✕
          </button>
          <div className="absolute bottom-3 left-4">
            <span className={`rounded px-1.5 py-0.5 text-xs font-bold text-white ${costColor(champ.cost).bg}`}>
              {champ.cost} vàng
            </span>
            <h3 className="mt-1 text-2xl font-bold">{champ.name}</h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {champ.traits.map((id) => {
                const t = traitById.get(id);
                return (
                  <span key={id} className="flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-xs">
                    {t?.icon && <Image src={t.icon} alt="" width={14} height={14} />}
                    {t?.name ?? id}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5 p-4">
          <dl className="grid grid-cols-4 gap-2 text-center sm:grid-cols-7">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/5 px-1 py-2">
                <dt className="text-[10px] text-white/50">{label}</dt>
                <dd className="font-mono text-sm">{value ?? "–"}</dd>
              </div>
            ))}
          </dl>

          <div>
            <h4 className="font-semibold text-amber-200">{champ.ability.name || "Kỹ năng"}</h4>
            <p className="mt-1 text-sm leading-relaxed text-white/80">
              <HtmlText html={champ.ability.html} />
            </p>
            <p className="mt-1 text-[11px] text-white/40">
              Giá trị dạng a / b / c tương ứng 1★ / 2★ / 3★. Dấu “?” là giá trị được tính trong trận.
            </p>
          </div>

          {champ.ability.variables.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-white/50">
                    <th className="py-1 font-normal">Chỉ số kỹ năng</th>
                    <th className="py-1 text-right font-normal">1★</th>
                    <th className="py-1 text-right font-normal">2★</th>
                    <th className="py-1 text-right font-normal">3★</th>
                  </tr>
                </thead>
                <tbody>
                  {champ.ability.variables.map((v) => (
                    <tr key={v.name} className="border-t border-white/5">
                      <td className="py-1 font-mono text-xs text-white/70">{v.name}</td>
                      {v.values.map((x, i) => (
                        <td key={i} className="py-1 text-right font-mono">
                          {x}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
