import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChampionBrowser from "@/components/wiki/ChampionBrowser";
import ItemCombiner from "@/components/wiki/ItemCombiner";
import TraitList from "@/components/wiki/TraitList";
import type { ChampionView, ItemView, TraitView } from "@/components/wiki/view";
import { getSet, getSetIndex } from "@/lib/data";
import { abilityHtml, abilityVariableRows, formatTrait, itemHtml } from "@/lib/format";
import { formatDate } from "@/lib/ui";

type Props = { params: Promise<{ setId: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getSetIndex().map((s) => ({ setId: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { setId } = await params;
  const set = getSet(setId);
  if (!set) return {};
  const title = `${set.name}${set.nameEn ? ` (${set.nameEn})` : ""} – TFTLore`;
  return {
    title,
    description: `Tra cứu ${set.champions.length} tướng, ${set.traits.length} tộc/hệ và bảng ghép trang bị của ${set.name} Đấu Trường Chân Lý.`,
  };
}

export default async function SetPage({ params }: Props) {
  const { setId } = await params;
  const set = getSet(setId);
  if (!set) notFound();

  const index = getSetIndex();
  const pos = index.findIndex((s) => s.id === setId);
  const prev = index[pos - 1];
  const next = index[pos + 1];

  const champions: ChampionView[] = set.champions.map((c) => ({
    id: c.id,
    name: c.name,
    cost: c.cost,
    icon: c.icon,
    traits: c.traits,
    stats: c.stats,
    ability: { name: c.ability.name, html: abilityHtml(c), variables: abilityVariableRows(c) },
  }));

  const traits: TraitView[] = set.traits.map((t) => {
    const f = formatTrait(t);
    return {
      id: t.id,
      name: t.name,
      icon: t.icon,
      introHtml: f.introHtml,
      breakpoints: t.breakpoints.map((b, i) => ({ count: b.count, style: b.style, effectHtml: f.effectsHtml[i] ?? "" })),
      champions: set.champions.filter((c) => c.traits.includes(t.id)).map((c) => c.id),
    };
  });

  const items: ItemView[] = set.items.map((i) => ({
    id: i.id,
    name: i.name.trim(),
    icon: i.icon,
    components: i.components,
    html: itemHtml(i),
    isUnique: i.isUnique,
  }));

  const sections = [
    { id: "champions", label: "Tướng", count: champions.length },
    { id: "traits", label: "Tộc/Hệ", count: traits.length },
    { id: "items", label: "Trang bị", count: items.length },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <header className="pt-10 pb-6">
        <Link href="/#timeline" className="text-sm text-white/50 hover:text-white">
          ← Dòng thời gian
        </Link>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{set.name}</h1>
          {set.nameEn && <span className="text-lg text-white/60">{set.nameEn}</span>}
          {set.isMidSet && (
            <span className="rounded bg-fuchsia-500/20 px-2 py-0.5 text-sm text-fuchsia-300">Giữa mùa</span>
          )}
        </div>
        <p className="mt-2 text-sm text-white/60">
          Ra mắt: {formatDate(set.releaseDate)} · Bàn cờ {set.boardSize.rows}×{set.boardSize.cols} · Dữ liệu bản vá{" "}
          {set.source.patch === "latest" ? "mới nhất" : set.source.patch}
          {set.source.lang === "en_us" && " (một phần tiếng Anh)"}
        </p>
        {set.mechanic && <p className="mt-3 max-w-3xl text-white/80">{set.mechanic}</p>}
        <Link
          href={`/builder?set=${set.setId}`}
          className="mt-4 inline-block rounded-lg border border-amber-300/50 px-4 py-2 text-sm text-amber-200 hover:bg-amber-300/10"
        >
          Xếp đội hình {set.name} →
        </Link>
      </header>

      <nav className="sticky top-[57px] z-10 -mx-4 mb-6 flex gap-1 overflow-x-auto border-b border-white/10 bg-slate-950/90 px-4 py-2 backdrop-blur">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-lg px-3 py-1.5 text-sm hover:bg-white/10">
            {s.label} <span className="text-white/40">{s.count}</span>
          </a>
        ))}
      </nav>

      <section id="champions" className="scroll-mt-32">
        <h2 className="mb-4 text-2xl font-bold">Tướng</h2>
        <ChampionBrowser champions={champions} traits={traits} />
      </section>

      <section id="traits" className="mt-16 scroll-mt-32">
        <h2 className="mb-4 text-2xl font-bold">Tộc/Hệ</h2>
        <TraitList traits={traits} champions={champions} />
      </section>

      <section id="items" className="mt-16 scroll-mt-32">
        <h2 className="mb-4 text-2xl font-bold">Bảng ghép trang bị</h2>
        <ItemCombiner items={items} />
      </section>

      <nav className="mt-16 flex justify-between gap-4 border-t border-white/10 pt-6 text-sm">
        {prev ? (
          <Link href={`/sets/${prev.id}`} className="hover:text-amber-200">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/sets/${next.id}`} className="text-right hover:text-amber-200">
            {next.name} →
          </Link>
        )}
      </nav>
    </div>
  );
}
