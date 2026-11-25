export default function SectionHeading({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3.5 sm:mb-5">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="w-1 sm:w-1.5 h-5 sm:h-6 rounded-full bg-brand shrink-0" />
        <h2 className="text-base sm:text-xl font-bold text-white tracking-wide">{children}</h2>
      </div>
      {right && <span className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">{right}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════ */
