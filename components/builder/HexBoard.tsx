"use client";

import Image from "next/image";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { BuilderChampion, BuilderItem, Unit } from "@/lib/builder";

/** Màu nền viền lục giác theo giá tướng (dùng background vì clip-path cắt mất border). */
const COST_BG: Record<number, string> = {
  1: "bg-slate-400",
  2: "bg-emerald-500",
  3: "bg-sky-500",
  4: "bg-fuchsia-500",
  5: "bg-amber-400",
};

export default function HexBoard({
  rows,
  cols,
  units,
  champById,
  itemById,
  selectedPos,
  onSelect,
  onRemove,
}: {
  rows: number;
  cols: number;
  units: Unit[];
  champById: Map<string, BuilderChampion>;
  itemById: Map<string, BuilderItem>;
  selectedPos: number | null;
  onSelect: (pos: number | null) => void;
  onRemove: (pos: number) => void;
}) {
  const unitAt = new Map(units.map((u) => [u.pos, u]));
  return (
    <div className="hex-board mx-auto w-fit select-none" style={{ ["--cols" as string]: cols }}>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className={`hex-row flex ${r % 2 === 1 ? "hex-row-odd" : ""}`}>
          {Array.from({ length: cols }, (_, c) => {
            const pos = r * cols + c;
            const unit = unitAt.get(pos);
            return (
              <HexCell key={pos} pos={pos}>
                {unit && champById.get(unit.champion) && (
                  <BoardUnit
                    unit={unit}
                    champ={champById.get(unit.champion)!}
                    itemById={itemById}
                    selected={selectedPos === pos}
                    onSelect={() => onSelect(selectedPos === pos ? null : pos)}
                    onRemove={() => onRemove(pos)}
                  />
                )}
              </HexCell>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function HexCell({ pos, children }: { pos: number; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `cell:${pos}`, data: { pos } });
  return (
    <div ref={setNodeRef} className="hex-cell relative">
      <div className={`hex absolute inset-0 transition ${isOver ? "bg-amber-300/40" : "bg-white/[0.07]"}`} />
      {children}
    </div>
  );
}

function BoardUnit({
  unit,
  champ,
  itemById,
  selected,
  onSelect,
  onRemove,
}: {
  unit: Unit;
  champ: BuilderChampion;
  itemById: Map<string, BuilderItem>;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `unit:${unit.pos}`,
    data: { type: "unit", pos: unit.pos, champion: champ.id },
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      onContextMenu={(e) => {
        e.preventDefault();
        onRemove();
      }}
      title={`${champ.name} – bấm để chỉnh, chuột phải để xóa`}
      aria-label={champ.name}
      className={`absolute inset-0 cursor-grab touch-none ${isDragging ? "opacity-30" : ""}`}
    >
      <div className={`hex absolute inset-0 ${selected ? "bg-white" : COST_BG[champ.cost] ?? "bg-rose-400"}`} />
      <div className="hex absolute inset-[3px] overflow-hidden bg-slate-900">
        <Image src={champ.icon} alt="" fill sizes="80px" className="object-cover" draggable={false} />
      </div>
      {/* sao */}
      <div className="absolute -top-1 left-1/2 flex -translate-x-1/2 text-[11px] leading-none drop-shadow">
        {Array.from({ length: unit.stars }, (_, i) => (
          <span key={i} className={unit.stars === 3 ? "text-amber-300" : unit.stars === 2 ? "text-slate-200" : "text-amber-700"}>
            ★
          </span>
        ))}
      </div>
      {/* trang bị */}
      {unit.items.length > 0 && (
        <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-px">
          {unit.items.map((id, i) =>
            itemById.get(id) ? (
              <Image
                key={i}
                src={itemById.get(id)!.icon}
                alt={itemById.get(id)!.name}
                width={18}
                height={18}
                className="h-[var(--item)] w-[var(--item)] rounded-sm border border-black/60"
                draggable={false}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
