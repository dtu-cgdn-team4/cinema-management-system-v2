export function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
}
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function formatTime(dtStr) {
  if (!dtStr) return '—';
  return new Date(dtStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
export function formatVND(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}
export function getStatusInfo(status) {
  switch (status) {
    case 'NOW_SHOWING': return { label: 'Đang chiếu', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    case 'COMING_SOON': return { label: 'Sắp chiếu',  cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30' };
    case 'ENDED':       return { label: 'Đã kết thúc', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
    default:            return { label: status || '—', cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  }
}
export function getDayLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(d); target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return 'HÔM NAY';
  const days = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
  return days[d.getDay()];
}

/* ═══════════════════════════════════════
   TRAILER MODAL
═══════════════════════════════════════ */
