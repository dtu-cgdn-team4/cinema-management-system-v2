/** Khung chờ khi tải suất chiếu (Figma "Lịch chiếu – Đang tải"). */
export default function ShowtimeListSkeleton() {
  return (
    <div role="status" aria-label="Đang tải suất chiếu" className="flex flex-col gap-4">
      {[0, 1, 2].map((card) => (
        <div key={card} className="flex animate-pulse gap-7 rounded-2xl bg-surface p-5">
          <div className="h-45 w-30 shrink-0 rounded-xl bg-card" />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="h-5.5 w-80 max-w-full rounded-[10px] bg-card" />
            <div className="h-3 w-55 max-w-full rounded-[10px] bg-card" />
            <div className="flex flex-wrap gap-2.5">
              {[0, 1, 2, 3].map((slot) => (
                <div key={slot} className="h-19 w-29 rounded-xl bg-card" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
