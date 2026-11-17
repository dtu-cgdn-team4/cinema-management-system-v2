// Mỗi khách chỉ giữ ghế ở một suất (business-rules mục 8) nên chỉ lưu một lượt giữ.
const KEY = 'seatHold';

/**
 * Lượt giữ ghế còn hạn của suất `showtimeId` (SeatHoldResponse), lưu trong tab để quay lại bước chọn ghế
 * vẫn thấy ghế mình giữ và thời gian còn lại. expiresAt là giờ Việt Nam, đọc theo giờ máy.
 */
export function loadHold(showtimeId) {
  try {
    const hold = JSON.parse(sessionStorage.getItem(KEY));
    return hold?.showtimeId === Number(showtimeId) && new Date(hold.expiresAt) > new Date() ? hold : null;
  } catch {
    return null;
  }
}

export function saveHold(hold) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(hold));
  } catch {
    // Không lưu được thì chỉ mất phần hiển thị lại khi quay về; ghế vẫn được giữ ở server.
  }
}

export function clearHold() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // như trên
  }
}
