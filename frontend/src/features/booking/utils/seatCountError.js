/** Thông báo theo SRS 6.2.2 khi số ghế chọn khác số lượng đã chọn (khớp ErrorCode ở backend). Trả null nếu khớp. */
export function seatCountError(quantity, selectedCount) {
  if (!quantity) return 'Vui lòng chọn số lượng ghế';
  if (selectedCount < quantity) return `Bạn chọn thiếu ${quantity - selectedCount} ghế`;
  if (selectedCount > quantity) return `Bạn chỉ chọn ${quantity} ghế`;
  return null;
}
