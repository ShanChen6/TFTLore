/** Khung giữ chỗ cùng kích thước bố cục Team Builder, tránh nhảy layout (CLS) khi đang tải. */
export default function BuilderSkeleton({ label = "Đang tải…", withToolbar = false }: { label?: string; withToolbar?: boolean }) {
  return (
    <div aria-busy="true">
      {withToolbar && <div className="h-[42px] w-72 rounded-lg border border-white/10 bg-slate-900" />}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="flex h-[300px] items-center justify-center rounded-xl border border-white/10 bg-slate-950 text-sm text-white/50 sm:h-[460px]">
            {label}
          </div>
          <div className="h-[420px] rounded-xl border border-white/10 bg-slate-900/60" />
        </div>
        <div className="h-[420px] rounded-xl border border-white/10 bg-slate-900/60" />
      </div>
    </div>
  );
}
