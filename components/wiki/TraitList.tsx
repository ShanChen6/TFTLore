import Image from "next/image";
import HtmlText from "./HtmlText";
import type { ChampionView, TraitView } from "./view";
import { costColor, thumb, TRAIT_STYLE } from "@/lib/ui";

export default function TraitList({ traits, champions }: { traits: TraitView[]; champions: ChampionView[] }) {
  const champById = new Map(champions.map((c) => [c.id, c]));
  // Tộc/Hệ nhiều mốc lên trước, tộc/hệ độc nhất xuống cuối.
  const sorted = [...traits].sort(
    (a, b) =>
      Number(a.breakpoints.length === 1 && a.breakpoints[0].count === 1) -
        Number(b.breakpoints.length === 1 && b.breakpoints[0].count === 1) ||
      a.name.localeCompare(b.name, "vi"),
  );

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {sorted.map((t) => (
        <li key={t.id} id={`trait-${t.id}`} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
          <div className="flex items-center gap-3">
            <span className="hex flex h-10 w-10 shrink-0 items-center justify-center bg-slate-700">
              {t.icon && <Image src={t.icon} alt="" width={24} height={24} />}
            </span>
            <h3 className="text-lg font-semibold">{t.name}</h3>
          </div>

          {t.introHtml && (
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              <HtmlText html={t.introHtml} />
            </p>
          )}

          {t.breakpoints.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {t.breakpoints.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span
                    title={TRAIT_STYLE[b.style].label}
                    className={`mt-0.5 inline-flex h-5 min-w-7 shrink-0 items-center justify-center rounded px-1 text-xs font-bold ${TRAIT_STYLE[b.style].className}`}
                  >
                    {b.count}
                  </span>
                  <span className="text-white/80">
                    {b.effectHtml ? <HtmlText html={b.effectHtml} /> : <span className="text-white/55">Kích hoạt</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <ul className="mt-3 flex flex-wrap gap-1">
            {t.champions
              .map((id) => champById.get(id))
              .filter((c): c is ChampionView => !!c)
              .sort((a, b) => a.cost - b.cost)
              .map((c) => (
                <li key={c.id} title={`${c.name} (${c.cost} vàng)`}>
                  <Image
                    src={thumb(c.icon)}
                    alt={c.name}
                    width={32}
                    height={32}
                    className={`h-8 w-8 rounded border object-cover ${costColor(c.cost).border}`}
                  />
                </li>
              ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
