/** Date -> "14:30" */
export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

/** Date -> "04/11/2026" */
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** Khóa ngày theo giờ máy: "2026-11-04" */
export const toDateKey = (date) => {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Khóa "2026-11-04" -> Date lúc 00:00 giờ máy (new Date("2026-11-04") sẽ hiểu là giờ UTC). */
export const fromDateKey = (key) => new Date(`${key}T00:00:00`);

const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
export const weekdayName = (date) => WEEKDAYS[new Date(date).getDay()];
