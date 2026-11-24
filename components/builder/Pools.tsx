"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { BuilderChampion, BuilderItem, BuilderTrait, ItemKind } from "@/lib/builder";
import { costColor } from "@/lib/ui";

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

// ---------------------------------------------------------------------------

export function ChampionPool({
  champions,
  traits,
  onPick,
}: {
  champions: BuilderChampion[];
  traits: BuilderTrait[];
  onPick: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [trait, setTrait] = useState("");
  const [sortBy, setSortBy] = useState<"cost" | "name">("cost");
  // Vùng thả để xóa tướng khỏi bàn cờ.
  const { setNodeRef, isOver } = useDroppable({ id: "pool" });

  const sortedTraits = useMemo(() => [...traits].sort((a, b) => a.name.localeCompare(b.name, "vi")), [traits]);
  const visible = useMemo(() => {
    const q = normalize(query.trim());
    return champions
      .filter((c) => !trait || c.traits.includes(trait))
      .filter((c) => !q || normalize(c.name).includes(q))
      .sort((a, b) =>
        sortBy === "cost" ? a.cost - b.cost || a.name.localeCompare(b.name, "vi") : a.name.localeCompare(b.name, "vi"),
      );
  }, [champions, trait, query, sortBy]);

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl border p-3 transition ${isOver ? "border-rose-400 bg-rose-500/10" : "border-white/10 bg-slate-900/60"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-semibold">Tướng</h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tướng…"
          aria-label="Tìm tướng"
          className="w-32 rounded-lg border border-white/15 bg-slate-950 px-2 py-1 text-sm sm:w-40"
        />
        <select
          value={trait}
          onChange={(e) => setTrait(e.target.value)}
          aria-label="Lọc theo Tộc/Hệ"
          className="max-w-36 rounded-lg border border-white/15 bg-slate-950 px-2 py-1 text-sm"
        >
          <option value="">Mọi Tộc/Hệ</option>
          {sortedTraits.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "cost" | "name")}
          aria-label="Sắp xếp"
          className="rounded-lg border border-white/15 bg-slate-950 px-2 py-1 text-sm"
        >
          <option value="cost">Theo giá</option>
          <option value="name">Theo tên</option>
        </select>
      </div>
      <p className="mt-1 text-[11px] text-white/55">
        Kéo tướng lên bàn cờ hoặc bấm để tự xếp vào ô trống. Kéo tướng từ bàn cờ về đây để xóa.
      </p>
      <ul className="mt-2 grid max-h-64 grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-1.5 overflow-y-auto pr-1">
        {visible.map((c) => (
          <li key={c.id}>
            <PoolChampion champ={c} onPick={() => onPick(c.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PoolChampion({ champ, onPick }: { champ: BuilderChampion; onPick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `champ:${champ.id}`,
    data: { type: "champion", champion: champ.id },
  });
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onPick}
      title={`${champ.name} (${champ.cost} vàng)`}
      className={`w-full touch-manipulation ${isDragging ? "opacity-30" : ""}`}
    >
      <span className={`relative block aspect-square overflow-hidden rounded-md border-2 ${costColor(champ.cost).border}`}>
        <Image src={champ.icon} alt="" fill sizes="56px" className="object-cover" draggable={false} />
      </span>
      <span className="mt-0.5 block truncate text-center text-[10px] text-white/70">{champ.name}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------

const KIND_LABEL: Record<ItemKind, string> = {
  completed: "Hoàn chỉnh",
  emblem: "Ấn Tộc/Hệ",
  special: "Đặc biệt",
};

export function ItemPool({ items, onPick }: { items: BuilderItem[]; onPick: (id: string) => void }) {
  const kinds = useMemo(
    () => (["completed", "emblem", "special"] as ItemKind[]).filter((k) => items.some((i) => i.kind === k)),
    [items],
  );
  const [kind, setKind] = useState<ItemKind>("completed");
  const active = kinds.includes(kind) ? kind : kinds[0];
  const visible = items.filter((i) => i.kind === active).sort((a, b) => a.name.localeCompare(b.name, "vi"));

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <h2 className="mr-auto font-semibold">Trang bị</h2>
        {kinds.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            aria-pressed={active === k}
            className={`rounded-lg border px-2 py-1 text-xs ${
              active === k ? "border-amber-300 bg-amber-300/15" : "border-white/15 hover:border-white/40"
            }`}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <p className="mt-1 text-[11px] text-white/55">
        Kéo trang bị thả lên tướng, hoặc chọn tướng trên bàn cờ rồi bấm vào trang bị.
      </p>
      <ul className="mt-2 grid max-h-64 grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1.5 overflow-y-auto pr-1">
        {visible.map((i) => (
          <li key={i.id}>
            <PoolItem item={i} onPick={() => onPick(i.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PoolItem({ item, onPick }: { item: BuilderItem; onPick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `item:${item.id}`,
    data: { type: "item", item: item.id },
  });
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onPick}
      title={item.name + (item.isUnique ? " (Duy Nhất)" : "")}
      aria-label={item.name}
      className={`block touch-manipulation overflow-hidden rounded border border-white/10 hover:border-amber-300 ${isDragging ? "opacity-30" : ""}`}
    >
      <Image src={item.icon} alt="" width={40} height={40} className="aspect-square w-full" draggable={false} />
    </button>
  );
}
