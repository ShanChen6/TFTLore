"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import HtmlText from "./HtmlText";
import type { ItemView } from "./view";

type Selection = { kind: "component"; id: string } | { kind: "item"; id: string } | null;

const pairKey = (a: string, b: string) => [a, b].sort().join("+");

function groupOf(item: ItemView): string {
  const id = item.id.toLowerCase();
  if (id.includes("emblem") || item.name.startsWith("Ấn ")) return "Ấn Tộc/Hệ";
  if (id.includes("radiant")) return "Ánh Sáng";
  if (id.includes("shadow")) return "Bóng Tối";
  if (id.includes("artifact") || id.includes("ornn")) return "Tạo Tác";
  return "Khác";
}

export default function ItemCombiner({ items }: { items: ItemView[] }) {
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  // Mảnh cơ bản = trang bị không có công thức nhưng được dùng để ghép trang bị khác.
  const components = useMemo(() => {
    const used = new Set(items.flatMap((i) => i.components));
    return items.filter((i) => i.components.length === 0 && used.has(i.id));
  }, [items]);

  const recipe = useMemo(() => {
    const m = new Map<string, ItemView>();
    for (const i of items) if (i.components.length === 2) m.set(pairKey(i.components[0], i.components[1]), i);
    return m;
  }, [items]);

  // Mùa 5 có hai họ mảnh không ghép chéo: thường và Bóng Tối -> mỗi họ một bảng.
  const families = useMemo(() => {
    const m = new Map<string, ItemView[]>();
    for (const c of components) {
      const f = /shadow/i.test(c.id) ? "Trang bị Bóng Tối" : "Trang bị thường";
      m.set(f, [...(m.get(f) ?? []), c]);
    }
    return [...m.entries()].sort(([a]) => (a === "Trang bị thường" ? -1 : 1));
  }, [components]);

  const componentIds = useMemo(() => new Set(components.map((c) => c.id)), [components]);
  const special = useMemo(() => {
    const groups = new Map<string, ItemView[]>();
    for (const i of items) {
      const inMatrix = componentIds.has(i.id) || (i.components.length === 2 && i.components.every((c) => componentIds.has(c)));
      if (inMatrix) continue;
      const g = groupOf(i);
      groups.set(g, [...(groups.get(g) ?? []), i]);
    }
    return [...groups.entries()];
  }, [items, componentIds]);

  const [sel, setSel] = useState<Selection>(components[0] ? { kind: "component", id: components[0].id } : null);
  const selectedComponent = sel?.kind === "component" ? sel.id : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="min-w-0 space-y-4">
        {families.map(([family, list]) => (
          <div key={family} className="overflow-x-auto">
            {families.length > 1 && <h3 className="mb-1 text-sm font-semibold text-white/70">{family}</h3>}
            <Matrix
              components={list}
              recipe={recipe}
              selectedComponent={selectedComponent}
              selectedItem={sel?.kind === "item" ? sel.id : null}
              onSelect={setSel}
            />
          </div>
        ))}
        <p className="mt-2 text-xs text-white/50">
          Bấm vào mảnh trang bị để xem các công thức, hoặc bấm vào ô để xem chi tiết trang bị.
        </p>
      </div>

      <div className="min-w-0 rounded-xl border border-white/10 bg-slate-900/60 p-4">
        {sel?.kind === "component" && (
          <ComponentDetail component={byId.get(sel.id)!} components={components} recipe={recipe} onPick={(id) => setSel({ kind: "item", id })} />
        )}
        {sel?.kind === "item" && <ItemDetail item={byId.get(sel.id)!} byId={byId} />}
        {!sel && <p className="text-sm text-white/50">Mùa này không có dữ liệu ghép đồ.</p>}
      </div>

      {special.length > 0 && (
        <div className="lg:col-span-2">
          {special.map(([group, list]) => (
            <div key={group} className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-white/70">
                {group} <span className="text-white/40">({list.length})</span>
              </h3>
              <ul className="flex flex-wrap gap-1.5">
                {list.map((i) => (
                  <li key={i.id}>
                    <ItemIcon item={i} size={40} active={sel?.kind === "item" && sel.id === i.id} onClick={() => setSel({ kind: "item", id: i.id })} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Matrix({
  components,
  recipe,
  selectedComponent,
  selectedItem,
  onSelect,
}: {
  components: ItemView[];
  recipe: Map<string, ItemView>;
  selectedComponent: string | null;
  selectedItem: string | null;
  onSelect: (s: Selection) => void;
}) {
  return (
    <table className="border-separate border-spacing-1">
      <thead>
        <tr>
          <th />
          {components.map((c) => (
            <th key={c.id}>
              <ItemIcon item={c} size={36} active={selectedComponent === c.id} onClick={() => onSelect({ kind: "component", id: c.id })} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {components.map((row) => (
          <tr key={row.id}>
            <th>
              <ItemIcon item={row} size={36} active={selectedComponent === row.id} onClick={() => onSelect({ kind: "component", id: row.id })} />
            </th>
            {components.map((col) => {
              const item = recipe.get(pairKey(row.id, col.id));
              const highlight = selectedComponent && (row.id === selectedComponent || col.id === selectedComponent);
              return (
                <td key={col.id} className={highlight ? "rounded bg-amber-300/10" : ""}>
                  {item ? (
                    <ItemIcon item={item} size={36} active={selectedItem === item.id} onClick={() => onSelect({ kind: "item", id: item.id })} />
                  ) : (
                    <span className="block h-9 w-9" />
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ItemIcon({ item, size, active, onClick }: { item: ItemView; size: number; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      title={item.name}
      aria-label={item.name}
      className={`block overflow-hidden rounded border-2 transition ${active ? "border-amber-300" : "border-transparent hover:border-white/40"}`}
    >
      <Image src={item.icon} alt={item.name} width={size} height={size} />
    </button>
  );
}

function ComponentDetail({
  component,
  components,
  recipe,
  onPick,
}: {
  component: ItemView;
  components: ItemView[];
  recipe: Map<string, ItemView>;
  onPick: (id: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Image src={component.icon} alt="" width={40} height={40} className="rounded" />
        <div>
          <h3 className="font-semibold">{component.name}</h3>
          <p className="text-xs text-white/50">Mảnh trang bị cơ bản</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-white/70">
        <HtmlText html={component.html} />
      </p>
      <ul className="mt-4 space-y-1.5">
        {components.map((other) => {
          const result = recipe.get(pairKey(component.id, other.id));
          if (!result) return null;
          return (
            <li key={other.id}>
              <button onClick={() => onPick(result.id)} className="flex w-full items-center gap-2 rounded-lg p-1 text-left text-sm hover:bg-white/5">
                <Image src={component.icon} alt="" width={24} height={24} className="rounded" />
                <span className="text-white/40">+</span>
                <Image src={other.icon} alt={other.name} width={24} height={24} className="rounded" />
                <span className="text-white/40">=</span>
                <Image src={result.icon} alt="" width={28} height={28} className="rounded" />
                <span className="truncate font-medium">{result.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ItemDetail({ item, byId }: { item: ItemView; byId: Map<string, ItemView> }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <Image src={item.icon} alt="" width={48} height={48} className="rounded" />
        <div>
          <h3 className="text-lg font-semibold">{item.name}</h3>
          {item.isUnique && <p className="text-xs text-amber-300">Duy nhất – mỗi tướng chỉ giữ 1 món</p>}
        </div>
      </div>
      {item.components.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {item.components.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-white/40">+</span>}
              {byId.get(c) && <Image src={byId.get(c)!.icon} alt="" width={24} height={24} className="rounded" />}
              <span className="text-white/70">{byId.get(c)?.name ?? c}</span>
            </span>
          ))}
        </div>
      )}
      <p className="mt-3 text-sm leading-relaxed text-white/80">
        {item.html ? <HtmlText html={item.html} /> : <span className="text-white/40">Chưa có mô tả.</span>}
      </p>
    </div>
  );
}
