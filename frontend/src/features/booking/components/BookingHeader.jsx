import { ArrowLeft, Check, Headphones } from 'lucide-react';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../../../components/common/BrandLogo';

const STEPS = ['Chọn Suất Chiếu', 'Chọn Ghế', 'Thanh Toán'];

/** Thanh trên cùng của các bước đặt vé (Figma "Điều hướng đặt vé"); `step` bắt đầu từ 1. */
export default function BookingHeader({ step }) {
  return (
    <header className="border-b border-line bg-page">
      <div className="mx-auto flex h-16 max-w-304 items-center justify-between gap-6 px-4 xl:px-0">
        <div className="flex items-center gap-6">
          <BrandLogo />
          <Link
            to="/"
            className="hidden items-center gap-1.5 border-l border-line pl-4 text-xs text-muted transition hover:text-white md:flex"
          >
            <ArrowLeft size={14} />
            Quay lại trang chủ
          </Link>
        </div>

        <ol className="hidden items-center gap-4 lg:flex">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <Fragment key={label}>
                {i > 0 && <li aria-hidden className={`h-0.5 w-10 ${n <= step ? 'bg-brand/30' : 'bg-line'}`} />}
                <li className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
                  <span
                    className={`grid size-6 place-items-center rounded-full text-xs ${
                      done
                        ? 'border border-brand/30 bg-brand/15 text-brand'
                        : active
                          ? 'bg-brand font-bold'
                          : 'border border-line bg-card font-semibold text-muted'
                    }`}
                  >
                    {done ? <Check size={14} strokeWidth={1.5} absoluteStrokeWidth /> : n}
                  </span>
                  <span className={`text-xs ${done ? 'font-bold text-muted' : active ? 'font-bold' : 'font-medium text-muted'}`}>
                    {label}
                  </span>
                </li>
              </Fragment>
            );
          })}
        </ol>

        <span className="flex items-center gap-2 font-inter text-xs whitespace-nowrap text-muted">
          <Headphones size={14} className="text-brand" />
          CSKH: 1900 2224
        </span>
      </div>
    </header>
  );
}
