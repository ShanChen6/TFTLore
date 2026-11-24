import Countdown from "@/components/Countdown";
import Timeline from "@/components/wiki/Timeline";
import { getSetIndex } from "@/lib/data";
import { SEASON_19 } from "@/lib/season19";

export default function Home() {
  const index = getSetIndex();
  const mainSets = index.filter((s) => !s.isMidSet).length;
  const midSets = index.length - mainSets;

  return (
    <>
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.18),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">
            {mainSets} mùa chính · {midSets} mùa giữa kỳ · 2019 – 2026
          </p>
          <h1 className="mt-4 text-4xl font-extrabold sm:text-6xl">TFTLore</h1>
          <p className="mt-4 max-w-xl text-white/70">
            Bách khoa toàn thư Đấu Trường Chân Lý: tra cứu tướng, tộc/hệ, trang bị qua từng mùa và
            xếp đội hình ở bất kỳ mùa giải nào.
          </p>
          <h2 className="mt-12 text-lg font-semibold">
            Đếm ngược Mùa 19 – <span className="text-amber-300">{SEASON_19.name}</span>
          </h2>
          <div className="mt-4">
            <Countdown target={SEASON_19.releaseAt} />
          </div>
          <a
            href="#timeline"
            className="mt-10 rounded-full border border-amber-300/50 px-5 py-2 text-sm text-amber-200 transition hover:bg-amber-300/10"
          >
            Xem dòng thời gian ↓
          </a>
        </div>
      </section>

      <section id="timeline" className="scroll-mt-20 px-4 pb-24">
        <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">Dòng thời gian các mùa giải</h2>
        <Timeline />
      </section>
    </>
  );
}
