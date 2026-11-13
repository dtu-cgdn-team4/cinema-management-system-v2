import { toDateKey } from '../../../utils/format.js';

const DAYS_SHOWN = 6;

/** Các ngày trên thẻ "Chọn ngày xem phim": 6 ngày liên tiếp từ hôm nay, dạng "YYYY-MM-DD". */
export function scheduleDays(today = new Date()) {
  return Array.from({ length: DAYS_SHOWN }, (_, i) =>
    toDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)),
  );
}
