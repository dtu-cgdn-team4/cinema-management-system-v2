import emptyIcon from '../../../assets/empty-showtimes.svg';

/** Rạp không có suất trong ngày (Figma "Lịch chiếu – Không có suất chiếu"); không truyền `onToday` thì ẩn nút. */
export default function NoShowtimes({ dayLabel, onToday }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-8 py-18 text-center">
      <img src={emptyIcon} alt="" />
      <h3 className="font-display text-[22px] leading-7 font-bold">Chưa có suất chiếu ngày {dayLabel}</h3>
      <p className="text-[13px] leading-4 text-muted">
        Rạp chưa xếp lịch cho ngày này. Bạn chọn ngày khác để xem suất chiếu còn trống.
      </p>
      {onToday && (
        <button
          type="button"
          onClick={onToday}
          className="rounded-xl bg-brand px-5 py-3 text-[13px] leading-4 font-semibold transition hover:brightness-110"
        >
          Xem suất hôm nay
        </button>
      )}
    </div>
  );
}
