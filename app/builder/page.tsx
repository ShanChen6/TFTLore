import type { Metadata } from "next";
import { Suspense } from "react";
import TeamBuilder from "@/components/builder/TeamBuilder";
import { getSetIndex } from "@/lib/data";

export const metadata: Metadata = {
  title: "Xếp đội hình đa mùa – TFTLore",
  description:
    "Công cụ xếp đội hình Đấu Trường Chân Lý cho mọi mùa giải: kéo thả tướng, gắn trang bị, tự tính Tộc/Hệ và chia sẻ bằng liên kết.",
};

export default function BuilderPage() {
  const sets = getSetIndex();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 pb-24">
      <h1 className="text-2xl font-extrabold sm:text-3xl">Xếp đội hình</h1>
      <p className="mt-1 mb-6 text-sm text-white/60">
        Chọn mùa, kéo tướng lên bàn cờ, gắn trang bị và chia sẻ đội hình bằng liên kết – không cần đăng nhập.
      </p>
      <Suspense fallback={<p className="text-white/50">Đang tải…</p>}>
        <TeamBuilder sets={sets} />
      </Suspense>
    </div>
  );
}
