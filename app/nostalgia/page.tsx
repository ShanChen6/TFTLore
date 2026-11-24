import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import worlds from "@/data/worlds.json";
import { getSet } from "@/lib/data";
import { championHistory, quickRecords, traitEvolution } from "@/lib/nostalgia";
import { costColor, thumb, TRAIT_STYLE } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Kỷ Lục & Hoài Niệm – TFTLore",
  description:
    "Những vị tướng xuất hiện nhiều mùa nhất, sự tiến hóa của các Tộc/Hệ kinh điển và Đại sảnh Danh vọng CKTG Đấu Trường Chân Lý.",
};

type WorldsEntry = {
  setId: string;
  event: string | null;
  year: number;
  champion: string | null;
  region: string | null;
  comp: string | null;
  verified: boolean;
};

export default function NostalgiaPage() {
  const records = quickRecords();
  const champions = championHistory(16);
  const traits = traitEvolution();
  const hall = (worlds.entries as WorldsEntry[]).map((e) => ({ ...e, set: getSet(e.setId) }));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Kỷ Lục & Hoài Niệm</h1>
      <p className="mt-2 max-w-2xl text-white/60">
        Nhìn lại hành trình Đấu Trường Chân Lý từ 2019: những gương mặt quen thuộc, các Tộc/Hệ kinh điển và
        những nhà vô địch thế giới.
      </p>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        {[
          ["#bang-vang", "Bảng vàng tướng"],
          ["#toc-he", "Tiến hóa Tộc/Hệ"],
          ["#cktg", "Đại sảnh CKTG"],
        ].map(([href, label]) => (
          <a key={href} href={href} className="rounded-full border border-white/15 px-3 py-1 hover:border-amber-300">
            {label}
          </a>
        ))}
      </nav>

      {/* Kỷ lục nhanh */}
      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {records.map((r) => (
          <div key={r.label} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <dt className="text-xs text-white/50">{r.label}</dt>
            <dd className="mt-1 text-3xl font-extrabold text-amber-300">{r.value}</dd>
            <dd className="mt-1 text-xs text-white/60">{r.detail}</dd>
          </div>
        ))}
      </dl>

      {/* Bảng vàng */}
      <section id="bang-vang" className="mt-16 scroll-mt-20">
        <h2 className="text-2xl font-bold">Bảng vàng lịch sử</h2>
        <p className="mt-1 text-sm text-white/60">
          Những vị tướng góp mặt ở nhiều mùa chính nhất. Mỗi ô là một mùa, màu thể hiện giá tiền; bấm để xem
          chi tiết kỹ năng và Tộc/Hệ qua từng mùa.
        </p>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {champions.map((c, rank) => (
            <li key={c.key} className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-mono text-lg font-bold text-white/55">{rank + 1}</span>
                <Image src={thumb(c.icon)} alt="" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
                <div>
                  <h3 className="text-lg font-semibold">{c.name}</h3>
                  <p className="text-xs text-white/50">
                    {c.mainSets} mùa chính · {c.appearances.length} lần xuất hiện
                  </p>
                </div>
              </div>
              <ol className="mt-3 flex flex-wrap gap-1" aria-label="Giá qua các mùa">
                {c.appearances.map((a) => (
                  <li key={a.setId}>
                    <Link
                      href={`/sets/${a.setId}`}
                      title={`${a.setName}: ${a.cost} vàng – ${a.abilityName}`}
                      className={`flex h-7 min-w-9 flex-col items-center justify-center rounded border px-1 text-[10px] leading-none ${costColor(a.cost).border}`}
                    >
                      <span className="text-white/50">M{a.setId}</span>
                      <span className={`font-bold ${costColor(a.cost).text}`}>{a.cost}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <details className="group mt-3">
                <summary className="cursor-pointer text-xs text-amber-200/80 hover:text-amber-200">
                  Lịch sử kỹ năng & Tộc/Hệ
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-white/55">
                      <tr>
                        <th className="py-1 pr-2 font-normal">Mùa</th>
                        <th className="py-1 pr-2 font-normal">Giá</th>
                        <th className="py-1 pr-2 font-normal">Kỹ năng</th>
                        <th className="py-1 font-normal">Tộc/Hệ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.appearances.map((a) => (
                        <tr key={a.setId} className="border-t border-white/5 align-top">
                          <td className="py-1 pr-2 whitespace-nowrap">{a.setName}</td>
                          <td className={`py-1 pr-2 font-bold ${costColor(a.cost).text}`}>{a.cost}</td>
                          <td className="py-1 pr-2">{a.abilityName || "–"}</td>
                          <td className="py-1 text-white/60">{a.traits.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>

      {/* Tiến hóa Tộc/Hệ */}
      <section id="toc-he" className="mt-16 scroll-mt-20">
        <h2 className="text-2xl font-bold">Tiến hóa Tộc/Hệ biểu tượng</h2>
        <p className="mt-1 text-sm text-white/60">
          Cùng một Tộc/Hệ nhưng mỗi mùa lại mang mốc kích hoạt và dàn tướng khác nhau. Kéo ngang để xem toàn bộ.
        </p>
        <div className="mt-6 space-y-8">
          {traits.map((t) => (
            <div key={t.title}>
              <h3 className="text-lg font-semibold">
                {t.title} <span className="text-sm font-normal text-white/55">· {t.appearances.length} mùa</span>
              </h3>
              <ol className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
                {t.appearances.map((a) => (
                  <li
                    key={`${a.setId}-${a.name}`}
                    className="w-60 shrink-0 snap-start rounded-xl border border-white/10 bg-slate-900/60 p-3"
                  >
                    <Link href={`/sets/${a.setId}#traits`} className="text-xs text-white/50 hover:text-white">
                      {a.setName}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="hex flex h-8 w-8 shrink-0 items-center justify-center bg-slate-700">
                        {a.icon && <Image src={a.icon} alt="" width={18} height={18} />}
                      </span>
                      <span className="font-semibold">{a.name}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.breakpoints.map((b, i) => (
                        <span
                          key={i}
                          title={TRAIT_STYLE[b.style].label}
                          className={`inline-flex h-5 min-w-6 items-center justify-center rounded px-1 text-xs font-bold ${TRAIT_STYLE[b.style].className}`}
                        >
                          {b.count}
                        </span>
                      ))}
                    </div>
                    <ul className="mt-2 flex flex-wrap gap-1">
                      {a.champions.map((c) => (
                        <li key={c.name} title={`${c.name} (${c.cost} vàng)`}>
                          <Image
                            src={thumb(c.icon)}
                            alt={c.name}
                            width={28}
                            height={28}
                            className={`h-7 w-7 rounded border object-cover ${costColor(c.cost).border}`}
                          />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* CKTG */}
      <section id="cktg" className="mt-16 scroll-mt-20">
        <h2 className="text-2xl font-bold">Đại sảnh Danh vọng CKTG</h2>
        <p className="mt-1 text-sm text-white/60">
          Các nhà vô địch Chung Kết Thế Giới Đấu Trường Chân Lý. Thông tin đang được đối chiếu với nguồn chính
          thức – mục “Cần xác minh” có thể chưa chính xác.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hall.map((e) => (
            <li key={e.setId} className="flex flex-col rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/sets/${e.setId}`} className="text-xs text-white/50 hover:text-white">
                  {e.set?.name}
                  {e.set?.nameEn ? ` · ${e.set.nameEn}` : ""}
                </Link>
                {!e.verified && (
                  <span className="shrink-0 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">
                    Cần xác minh
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-white/70">
                {e.event ?? `CKTG ${e.set?.name ?? ""}`} · {e.year}
              </p>
              <p className="mt-3 text-2xl font-extrabold">
                {e.champion ?? <span className="text-base font-normal text-white/55">Đang cập nhật</span>}
              </p>
              {e.region && <p className="text-xs text-white/50">{e.region}</p>}
              <div className="mt-auto pt-4">
                {e.comp ? (
                  <Link
                    href={`/builder?set=${e.setId}&code=${e.comp}`}
                    className="inline-block rounded-lg border border-amber-300/50 px-3 py-1.5 text-sm text-amber-200 hover:bg-amber-300/10"
                  >
                    Xem đội hình vô địch →
                  </Link>
                ) : (
                  <span className="text-xs text-white/55">Chưa có đội hình vô địch</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
