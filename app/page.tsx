import Countdown from "@/components/Countdown";
import { SEASON_19 } from "@/lib/season19";

export default function Home() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.18),transparent_60%)]" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-300/80">Mùa 1 – 18 · 2019 – 2026</p>
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
      </div>
    </section>
  );
}
