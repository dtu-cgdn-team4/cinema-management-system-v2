/**
 * Badge trạng thái vé:
 * - ĐÃ SỬ DỤNG: khi nhan_ve_luc (collectedAt) != null (hoặc status là DA_SU_DUNG/COLLECTED) -> Màu Xanh dương.
 * - ĐÃ THANH TOÁN: khi nhan_ve_luc == null (trạng thái mặc định sau khi mua) -> Màu Xanh lá.
 */
const STATUS_MAP = {
  // 1. ĐÃ THANH TOÁN (Xanh lá)
  PAID: { label: 'ĐÃ THANH TOÁN', bg: 'bg-[#064e3b]/25', text: 'text-[#34d399]', border: 'border-[#059669]/50' },
  DA_THANH_TOAN: { label: 'ĐÃ THANH TOÁN', bg: 'bg-[#064e3b]/25', text: 'text-[#34d399]', border: 'border-[#059669]/50' },

  // 2. ĐÃ SỬ DỤNG (Xanh dương)
  USED: { label: 'ĐÃ SỬ DỤNG', bg: 'bg-[#1e3a8a]/25', text: 'text-[#60a5fa]', border: 'border-[#2563eb]/50' },
  DA_SU_DUNG: { label: 'ĐÃ SỬ DỤNG', bg: 'bg-[#1e3a8a]/25', text: 'text-[#60a5fa]', border: 'border-[#2563eb]/50' },
  COLLECTED: { label: 'ĐÃ SỬ DỤNG', bg: 'bg-[#1e3a8a]/25', text: 'text-[#60a5fa]', border: 'border-[#2563eb]/50' },
  DA_NHAN_VE: { label: 'ĐÃ SỬ DỤNG', bg: 'bg-[#1e3a8a]/25', text: 'text-[#60a5fa]', border: 'border-[#2563eb]/50' },
};

const DEFAULT_STATUS = STATUS_MAP.DA_THANH_TOAN;

export default function TicketStatusBadge({ status, collectedAt }) {
  // Kiểm tra trường nhan_ve_luc (collectedAt): nếu có dữ liệu => ĐÃ SỬ DỤNG
  const s = collectedAt
    ? STATUS_MAP.DA_SU_DUNG
    : STATUS_MAP[(status || '').toUpperCase()] || DEFAULT_STATUS;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border w-[128px] py-1 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap text-center ${s.bg} ${s.text} ${s.border}`}
    >
      {s.label}
    </span>
  );
}
