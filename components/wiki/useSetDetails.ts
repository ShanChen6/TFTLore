"use client";

import { useEffect, useState } from "react";
import type { SetDetails } from "./view";

// Cache theo mùa, dùng chung giữa popup tướng và bảng ghép đồ: chỉ tải một lần.
const cache = new Map<string, Promise<SetDetails>>();

function load(setId: string): Promise<SetDetails> {
  if (!cache.has(setId)) {
    const p = fetch(`/api/sets/${setId}/details`).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<SetDetails>;
    });
    p.catch(() => cache.delete(setId)); // cho phép thử lại nếu lỗi mạng
    cache.set(setId, p);
  }
  return cache.get(setId)!;
}

/** Trả về chi tiết của mùa khi `enabled`; null trong lúc đang tải. */
export function useSetDetails(setId: string, enabled = true): { details: SetDetails | null; error: boolean } {
  const [state, setState] = useState<{ details: SetDetails | null; error: boolean }>({ details: null, error: false });
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    load(setId)
      .then((details) => alive && setState({ details, error: false }))
      .catch(() => alive && setState({ details: null, error: true }));
    return () => {
      alive = false;
    };
  }, [setId, enabled]);
  return state;
}
