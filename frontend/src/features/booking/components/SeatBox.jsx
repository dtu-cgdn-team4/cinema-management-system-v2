// [khung ghế, vạch đệm ghế] theo các kiểu ghế trong Figma "Trang chọn ghế"
const VARIANTS = {
  THUONG: ['border-muted bg-card font-semibold text-white/90', 'bg-muted'],
  VIP: ['border-[#b18a39] bg-warn/6 font-semibold text-warn', 'bg-[#b18a39]'],
  TAKEN: ['border-[#22242e] bg-[#22242e] font-semibold text-[#626471]', 'bg-[#626471]'],
  SELECTED: ['border-brand bg-brand font-extrabold text-white', 'bg-white/60'],
};

/** Ô ghế 38×32 có vạch đệm ở đáy; `as="button"` trên sơ đồ ghế, mặc định là ô mẫu ở bảng giá. */
export default function SeatBox({ as: Tag = 'span', variant, className = '', children, ...props }) {
  const [box, cushion] = VARIANTS[variant];
  return (
    <Tag
      className={`relative grid h-8 w-9.5 shrink-0 place-items-center rounded border text-[10px] leading-3 transition ${box} ${className}`}
      {...props}
    >
      {children}
      <span aria-hidden className={`absolute inset-x-1.25 bottom-0.75 h-0.5 rounded-xs ${cushion}`} />
    </Tag>
  );
}
