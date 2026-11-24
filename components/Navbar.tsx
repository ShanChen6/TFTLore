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
        <div className="flex items-center gap-2 text-sm text-white/80">
          <span className="hidden sm:inline">Mùa 19 còn</span>
          <Countdown target={SEASON_19.releaseAt} compact />
        </div>
      </nav>
    </header>
  );
}
