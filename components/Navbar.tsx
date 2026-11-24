import Link from "next/link";
import Countdown from "./Countdown";
import { SEASON_19 } from "@/lib/season19";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-amber-300">
          TFTLore
        </Link>
        <div className="flex items-center gap-3 text-sm text-white/80 sm:gap-4">
          <Link href="/#timeline" className="hidden hover:text-white sm:inline">
            Các mùa
          </Link>
          <Link href="/builder" className="hover:text-white">
            <span className="sm:hidden">Đội hình</span>
            <span className="hidden sm:inline">Xếp đội hình</span>
          </Link>
          <Link href="/nostalgia" className="hover:text-white">
            Hoài niệm
          </Link>
          <span className="hidden items-center gap-2 min-[420px]:flex">
            <span className="hidden md:inline">Mùa 19 còn</span>
            <Countdown target={SEASON_19.releaseAt} compact />
          </span>
        </div>
      </nav>
    </header>
  );
}
