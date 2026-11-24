"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import HexBoard from "./HexBoard";
import { SynergyPanel, UnitPanel } from "./Panels";
import { ChampionPool, ItemPool } from "./Pools";
import {
  canEquip,
  computeTraits,
  decodeBoard,
  encodeBoard,
  type BuilderData,
  type Unit,
} from "@/lib/builder";
import type { SetIndexEntry } from "@/lib/types";

type DragInfo = { type: "champion" | "unit" | "item"; icon: string } | null;

export default function TeamBuilder({ sets }: { sets: SetIndexEntry[] }) {
  const params = useSearchParams();
  const initialSet = sets.some((s) => s.id === params.get("set")) ? params.get("set")! : sets[sets.length - 1].id;
  const initialCode = useRef(params.get("code"));

  const [setId, setSetId] = useState(initialSet);
  const [data, setData] = useState<BuilderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragInfo>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  // ---- tải dữ liệu mùa --------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError(null);
    fetch(`/api/builder/${setId}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<BuilderData>;
      })
      .then((d) => {
        if (cancelled) return;
        setData(d);
        // Chỉ khôi phục đội hình từ URL ở lần tải đầu tiên.
        setUnits(initialCode.current ? decodeBoard(initialCode.current, d) : []);
        initialCode.current = null;
        setSelectedPos(null);
      })
      .catch(() => !cancelled && setError("Không tải được dữ liệu mùa này."));
    return () => {
      cancelled = true;
    };
  }, [setId]);

  // ---- đồng bộ URL (không cần database) ----------------------------------
  const code = useMemo(() => encodeBoard(units), [units]);
  useEffect(() => {
    if (!data) return;
    const url = `/builder?set=${encodeURIComponent(setId)}${code ? `&code=${code}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [setId, code, data]);

  // ---- tra cứu nhanh ----------------------------------------------------
  const champById = useMemo(() => new Map(data?.champions.map((c) => [c.id, c])), [data]);
  const itemById = useMemo(() => new Map(data?.items.map((i) => [i.id, i])), [data]);
  const traitById = useMemo(() => new Map(data?.traits.map((t) => [t.id, t])), [data]);
  const traits = useMemo(() => (data ? computeTraits(units, data) : []), [units, data]);
  const cells = data ? data.rows * data.cols : 0;

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2500);
  }, []);

  // ---- thao tác ----------------------------------------------------------
  const placeChampion = useCallback(
    (champion: string, pos?: number) => {
      setUnits((prev) => {
        let target = pos;
        if (target === undefined) {
          const used = new Set(prev.map((u) => u.pos));
          target = Array.from({ length: cells }, (_, i) => i).find((i) => !used.has(i));
          if (target === undefined) {
            notify("Bàn cờ đã đầy.");
            return prev;
          }
        }
        const next = prev.filter((u) => u.pos !== target);
        return [...next, { champion, pos: target, stars: 1, items: [] }];
      });
    },
    [cells, notify],
  );

  const moveUnit = useCallback((from: number, to: number) => {
    if (from === to) return;
    setUnits((prev) =>
      prev.map((u) => (u.pos === from ? { ...u, pos: to } : u.pos === to ? { ...u, pos: from } : u)),
    );
    setSelectedPos((s) => (s === from ? to : s === to ? from : s));
  }, []);

  const removeUnit = useCallback((pos: number) => {
    setUnits((prev) => prev.filter((u) => u.pos !== pos));
    setSelectedPos((s) => (s === pos ? null : s));
  }, []);

  const equip = useCallback(
    (pos: number, itemId: string) => {
      if (!data) return;
      const item = itemById.get(itemId);
      const unit = units.find((u) => u.pos === pos);
      if (!item || !unit) return;
      const reason = canEquip(unit, item, data);
      if (reason) return notify(reason);
      setUnits((prev) => prev.map((u) => (u.pos === pos ? { ...u, items: [...u.items, itemId] } : u)));
    },
    [data, itemById, units, notify],
  );

  // ---- kéo thả -------------------------------------------------------------
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  const onDragStart = (e: DragStartEvent) => {
    const d = e.active.data.current as { type: string; champion?: string; item?: string };
    if (d.type === "item") setDrag({ type: "item", icon: itemById.get(d.item!)?.icon ?? "" });
    else setDrag({ type: d.type as "champion" | "unit", icon: champById.get(d.champion!)?.icon ?? "" });
  };

  const onDragEnd = (e: DragEndEvent) => {
    setDrag(null);
    const d = e.active.data.current as { type: string; champion?: string; item?: string; pos?: number };
    const overId = e.over?.id ? String(e.over.id) : null;
    if (!overId) return;
    if (overId === "pool") {
      if (d.type === "unit") removeUnit(d.pos!);
      return;
    }
    const pos = Number(overId.replace("cell:", ""));
    if (d.type === "champion") placeChampion(d.champion!, pos);
    else if (d.type === "unit") moveUnit(d.pos!, pos);
    else if (d.type === "item") {
      if (!units.some((u) => u.pos === pos)) return notify("Hãy thả trang bị lên một tướng.");
      equip(pos, d.item!);
    }
  };

  // ---- chia sẻ ------------------------------------------------------------
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Đã sao chép liên kết đội hình.");
    } catch {
      notify("Không sao chép được – hãy copy trực tiếp từ thanh địa chỉ.");
    }
  };

  const exportPng = async () => {
    if (!exportRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(exportRef.current, { pixelRatio: 2, backgroundColor: "#020617", cacheBust: true });
      const a = document.createElement("a");
      a.href = url;
      a.download = `tftlore-mua-${setId}.png`;
      a.click();
    } catch {
      notify("Xuất ảnh thất bại.");
    }
  };

  const changeSet = (id: string) => {
    if (units.length && !window.confirm("Đổi mùa sẽ xóa đội hình hiện tại. Tiếp tục?")) return;
    setUnits([]);
    setSetId(id);
  };

  const selectedUnit = units.find((u) => u.pos === selectedPos) ?? null;
  const currentSet = sets.find((s) => s.id === setId);

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setDrag(null)}>
      {/* thanh công cụ */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={setId}
          onChange={(e) => changeSet(e.target.value)}
          aria-label="Chọn mùa"
          className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm font-medium"
        >
          {sets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.nameEn ? ` – ${s.nameEn}` : ""}
            </option>
          ))}
        </select>
        <span className="text-sm text-white/50">
          {units.length} tướng · bàn cờ {data ? `${data.rows}×${data.cols}` : "…"}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <ToolbarButton onClick={copyLink} disabled={!units.length}>
            Sao chép liên kết
          </ToolbarButton>
          <ToolbarButton onClick={exportPng} disabled={!units.length}>
            Xuất ảnh PNG
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              setUnits([]);
              setSelectedPos(null);
            }}
            disabled={!units.length}
          >
            Xóa hết
          </ToolbarButton>
        </div>
      </div>

      {error && <p className="mt-6 text-rose-300">{error}</p>}
      {!data && !error && <p className="mt-6 text-white/50">Đang tải dữ liệu {currentSet?.name}…</p>}

      {data && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 space-y-4">
            {/* vùng xuất ảnh: bàn cờ + tộc/hệ đang kích hoạt */}
            <div ref={exportRef} className="rounded-xl border border-white/10 bg-slate-950 p-3 sm:p-4">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <p className="font-semibold">
                  {data.name}
                  {data.nameEn && <span className="ml-2 text-sm font-normal text-white/50">{data.nameEn}</span>}
                </p>
                <span className="text-xs text-amber-300/80">TFTLore</span>
              </div>
              <HexBoard
                rows={data.rows}
                cols={data.cols}
                units={units}
                champById={champById}
                itemById={itemById}
                selectedPos={selectedPos}
                onSelect={setSelectedPos}
                onRemove={removeUnit}
              />
              {traits.some((t) => t.style) && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {traits
                    .filter((t) => t.style)
                    .map((t) => (
                      <span key={t.trait.id} className="flex items-center gap-1 rounded bg-white/5 px-1.5 py-0.5 text-xs">
                        <span className="font-mono font-bold">{t.count}</span> {t.trait.name}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {selectedUnit && champById.get(selectedUnit.champion) && (
              <UnitPanel
                unit={selectedUnit}
                champ={champById.get(selectedUnit.champion)!}
                traitById={traitById}
                itemById={itemById}
                onStars={(stars) =>
                  setUnits((prev) => prev.map((u) => (u.pos === selectedUnit.pos ? { ...u, stars } : u)))
                }
                onRemoveItem={(index) =>
                  setUnits((prev) =>
                    prev.map((u) =>
                      u.pos === selectedUnit.pos ? { ...u, items: u.items.filter((_, i) => i !== index) } : u,
                    ),
                  )
                }
                onRemove={() => removeUnit(selectedUnit.pos)}
                onClose={() => setSelectedPos(null)}
              />
            )}

            <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
              <ChampionPool champions={data.champions} traits={data.traits} onPick={(id) => placeChampion(id)} />
              <ItemPool
                items={data.items}
                onPick={(id) =>
                  selectedPos === null ? notify("Chọn một tướng trên bàn cờ trước.") : equip(selectedPos, id)
                }
              />
            </div>
          </div>

          <aside className="rounded-xl border border-white/10 bg-slate-900/60 p-3 lg:sticky lg:top-20 lg:self-start">
            <h3 className="mb-2 font-semibold">Tộc/Hệ</h3>
            <SynergyPanel traits={traits} />
          </aside>
        </div>
      )}

      <DragOverlay dropAnimation={null}>
        {drag?.icon && (
          <Image
            src={drag.icon}
            alt=""
            width={56}
            height={56}
            className={`pointer-events-none shadow-xl ${drag.type === "item" ? "h-10 w-10 rounded" : "h-14 w-14 rounded-lg"}`}
          />
        )}
      </DragOverlay>

      {toast && (
        <div
          role="status"
          data-toast
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-800 px-4 py-2 text-sm shadow-lg"
        >
          {toast}
        </div>
      )}
    </DndContext>
  );
}

function ToolbarButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm transition hover:border-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
