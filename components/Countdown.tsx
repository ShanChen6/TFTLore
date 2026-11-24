"use client";

import { useEffect, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function diff(target: number, now: number): Parts {
  const ms = Math.max(0, target - now);
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({
  target,
  compact = false,
}: {
  target: string;
  compact?: boolean;
}) {
  const targetMs = new Date(target).getTime();
  // null trong lần render đầu để tránh lệch hydration giữa server và client.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const p = now === null ? null : diff(targetMs, now);
  const released = now !== null && now >= targetMs;

  if (released) {
    return <span className="font-semibold text-amber-300">Mùa 19 đã ra mắt!</span>;
  }

  const units: [keyof Parts, string][] = [
    ["days", "Ngày"],
    ["hours", "Giờ"],
    ["minutes", "Phút"],
    ["seconds", "Giây"],
  ];

  if (compact) {
    return (
      <span className="font-mono tabular-nums" aria-label="Đếm ngược Mùa 19">
        {p ? `${p.days}d ${pad(p.hours)}:${pad(p.minutes)}:${pad(p.seconds)}` : "--d --:--:--"}
      </span>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4" role="timer" aria-label="Đếm ngược Mùa 19">
      {units.map(([key, label]) => (
        <div
          key={key}
          className="flex w-16 flex-col items-center rounded-lg border border-white/15 bg-white/5 py-3 sm:w-20"
        >
          <span className="font-mono text-2xl font-bold tabular-nums sm:text-4xl">
            {p ? pad(p[key]) : "--"}
          </span>
          <span className="mt-1 text-xs uppercase tracking-wide text-white/60">{label}</span>
        </div>
      ))}
    </div>
  );
}
