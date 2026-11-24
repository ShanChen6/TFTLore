import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/Countdown";
import { coverChampionIcon, getSet, getSetIndex } from "@/lib/data";
import { SEASON_19 } from "@/lib/season19";
import { formatDate } from "@/lib/ui";

export default function Timeline() {
  const entries = getSetIndex().map((entry) => {
    const set = getSet(entry.id)!;
    return {
      ...entry,
      mechanic: set.mechanic,
      cover: coverChampionIcon(set),
      champions: set.champions.length,
      traits: set.traits.length,
      year: entry.releaseDate?.slice(0, 4) ?? null,
    };
  });

  let lastYear: string | null = null;

  return (
    <ol className="relative mx-auto max-w-5xl">
      {/* trục dọc */}
      <div
        aria-hidden
        className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-amber-300/60 via-white/15 to-fuchsia-400/60 md:left-1/2"
      />
      {entries.map((s, i) => {
        const showYear = s.year && s.year !== lastYear;
        if (s.year) lastYear = s.year;
        const right = i % 2 === 1;
        return (
          <li key={s.id} className="relative">
            {showYear && (
              <div className="relative z-10 mb-4 flex pl-10 md:justify-center md:pl-0">
                <span className="rounded-full border border-amber-300/40 bg-slate-950 px-3 py-0.5 text-sm font-bold text-amber-300">
                  {s.year}
                </span>
              </div>
            )}
            <div className={`mb-6 flex pl-10 md:pl-0 ${right ? "md:justify-end" : "md:justify-start"}`}>
              {/* chấm trên trục */}
              <span
                aria-hidden
                className={`absolute top-6 left-4 z-10 -translate-x-1/2 rounded-full border-2 border-slate-950 md:left-1/2 ${
                  s.isMidSet ? "h-3 w-3 bg-fuchsia-400" : "h-4 w-4 bg-amber-300"
                }`}
              />
              <Link
                href={`/sets/${s.id}`}
                className="group relative block w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900 transition hover:border-amber-300/60 hover:shadow-lg hover:shadow-amber-500/10 md:w-[calc(50%-2rem)]"
              >
                {s.cover && (
                  <Image
                    src={s.cover}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 480px, 100vw"
                    className="object-cover object-top opacity-30 transition group-hover:scale-105 group-hover:opacity-40"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                <div className="relative p-4">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="font-mono">{formatDate(s.releaseDate)}</span>
                    {s.isMidSet && (
                      <span className="rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-fuchsia-300">Giữa mùa</span>
                    )}
                  </div>
                  <h3 className="mt-1 text-xl font-bold">
                    {s.name}
                    {s.nameEn && <span className="ml-2 text-sm font-normal text-white/60">{s.nameEn}</span>}
                  </h3>
                  {s.mechanic && <p className="mt-2 line-clamp-2 text-sm text-white/70">{s.mechanic}</p>}
                  <p className="mt-3 text-xs text-white/50">
                    {s.champions} tướng · {s.traits} tộc/hệ
                  </p>
                </div>
              </Link>
            </div>
          </li>
        );
      })}

      {/* Mùa 19 sắp ra mắt */}
      <li className="relative">
        <div className="flex pl-10 md:justify-center md:pl-0">
          <span
            aria-hidden
            className="absolute top-6 left-4 z-10 h-5 w-5 -translate-x-1/2 animate-pulse rounded-full border-2 border-slate-950 bg-gradient-to-br from-cyan-300 via-fuchsia-400 to-amber-300 md:left-1/2"
          />
          <div className="relative z-10 w-full rounded-xl border border-dashed border-fuchsia-400/50 bg-slate-950 p-4 text-center md:w-96">
            <p className="text-xs uppercase tracking-widest text-fuchsia-300">Sắp ra mắt</p>
            <h3 className="mt-1 text-xl font-bold">Mùa 19 – {SEASON_19.name}</h3>
            <p className="mt-2 text-sm text-white/70">
              Còn <Countdown target={SEASON_19.releaseAt} compact />
            </p>
          </div>
        </div>
      </li>
    </ol>
  );
}
