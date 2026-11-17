/**
 * Badge trạng thái vé chuẩn màu theo ảnh thiết kế Figma.
 */
const STATUS_MAP = {
  PAID: { label: 'ĐÃ THANH TOÁN', bg: 'bg-[#064e3b]/25', text: 'text-[#34d399]', border: 'border-[#059669]/50' },
  DA_THANH_TOAN: { label: 'ĐÃ THANH TOÁN', bg: 'bg-[#064e3b]/25', text: 'text-[#34d399]', border: 'border-[#059669]/50' },
  COLLECTED: { label: 'ĐÃ NHẬN VÉ', bg: 'bg-[#1e3a8a]/25', text: 'text-[#60a5fa]', border: 'border-[#2563eb]/50' },
  DA_NHAN_VE: { label: 'ĐÃ NHẬN VÉ', bg: 'bg-[#1e3a8a]/25', text: 'text-[#60a5fa]', border: 'border-[#2563eb]/50' },
  CANCELLED: { label: 'ĐÃ HỦY', bg: 'bg-[#7f1d1d]/25', text: 'text-[#f87171]', border: 'border-[#dc2626]/50' },
  DA_HUY: { label: 'ĐÃ HỦY', bg: 'bg-[#7f1d1d]/25', text: 'text-[#f87171]', border: 'border-[#dc2626]/50' },
  PENDING: { label: 'CHỜ THANH TOÁN', bg: 'bg-[#78350f]/25', text: 'text-[#fbbf24]', border: 'border-[#d97706]/50' },
  CHO_THANH_TOAN: { label: 'CHỜ THANH TOÁN', bg: 'bg-[#78350f]/25', text: 'text-[#fbbf24]', border: 'border-[#d97706]/50' },
};

const DEFAULT_STATUS = { label: 'ĐÃ THANH TOÁN', bg: 'bg-[#064e3b]/25', text: 'text-[#34d399]', border: 'border-[#059669]/50' };

export default function TicketStatusBadge({ status }) {
  const key = (status || '').toUpperCase();
  const s = STATUS_MAP[key] || DEFAULT_STATUS;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${s.bg} ${s.text} ${s.border}`}
    >
      {s.label}
    </span>
  );
}
