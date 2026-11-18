import { useEffect, useId, useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export default function MovieFilterSelect({ label, value, options, onChange }) {
  const root = useRef(null);
  const trigger = useRef(null);
  const id = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!root.current?.contains(event.target)) root.current?.removeAttribute('open');
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, []);

  return (
    <details ref={root} className="relative min-w-0 open:z-30"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          root.current.removeAttribute('open');
          trigger.current.focus();
        }
      }}>
      <summary ref={trigger} aria-controls={id} aria-label={`${label}: ${selected?.label ?? value}`}
        className="flex min-h-11 w-full cursor-pointer list-none items-center gap-2 rounded-xl border border-[#222E42] bg-[#131B2A] px-3 py-2 text-sm text-slate-200 focus-visible:outline-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 truncate">{selected?.label ?? value}</span>
        <ChevronDown className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      </summary>
      <div id={id} role="group" aria-label={label}
        className="absolute inset-x-0 top-full mt-1 max-h-[min(16rem,45dvh)] overflow-y-auto overscroll-contain rounded-xl border border-[#303D53] bg-[#131B2A] p-1 shadow-xl">
        {options.map((option) => (
          <button key={option.value} type="button" aria-pressed={option.value === value}
            onClick={() => {
              onChange(option.value);
              root.current.removeAttribute('open');
              trigger.current.focus();
            }}
            className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm leading-5 focus-visible:outline-2 focus-visible:outline-brand ${option.value === value ? 'bg-brand/15 text-brand' : 'text-slate-200 hover:bg-slate-800'}`}>
            <span className="min-w-0 flex-1 break-words">{option.label}</span>
            {option.value === value && <Check className="size-4 shrink-0" aria-hidden="true" />}
          </button>
        ))}
      </div>
    </details>
  );
}
