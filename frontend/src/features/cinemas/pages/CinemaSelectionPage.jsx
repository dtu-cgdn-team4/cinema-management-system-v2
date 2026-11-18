import { ChevronDown, ChevronRight, MapPin, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../services/apiClient';
import { getCinemas } from '../api/cinemaApi';
import CinemaCard from '../components/CinemaCard';
import CinemaDetail from '../components/CinemaDetail';
import { filterCinemas } from '../utils/filterCinemas';

/**
 * 6.2.1.3 Chọn rạp, giao diện theo frame "Chọn rạp chiếu" của Figma.
 * Rạp đang chọn nằm trên URL (`?cinemaId=`), thành phố là thành phố của rạp đó,
 * nên đổi thành phố là chọn rạp đầu tiên của thành phố mới.
 */
export default function CinemaSelectionPage() {
  const [params, setParams] = useSearchParams();
  const [cinemas, setCinemas] = useState(null); // null khi đang tải
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getCinemas().then(setCinemas, (err) => setError(errorMessage(err)));
  }, []);

  const select = (id) => setParams({ cinemaId: String(id) }, { replace: true });
  const selected = cinemas?.find((c) => c.id === Number(params.get('cinemaId'))) ?? cinemas?.[0];

  let content;
  if (error) {
    content = (
      <p role="alert" className="rounded-2xl border border-brand/40 bg-brand/10 px-5 py-4 text-sm text-red-300">
        {error}
      </p>
    );
  } else if (!cinemas) {
    content = (
      <div role="status" aria-label="Đang tải danh sách rạp" className="grid animate-pulse gap-6 lg:grid-cols-[416px_1fr]">
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((card) => (
            <div key={card} className="h-29.75 rounded-xl bg-surface" />
          ))}
        </div>
        <div className="h-120 rounded-2xl bg-surface" />
      </div>
    );
  } else if (!selected) {
    content = <p className="py-16 text-center text-sm text-muted">Chưa có rạp nào đang hoạt động.</p>;
  } else {
    const cities = [...new Set(cinemas.map((c) => c.city))];
    const list = filterCinemas(cinemas, selected.city, query);
    content = (
      <>
        <section className="grid gap-5 rounded-2xl border border-line bg-surface p-4.75 md:grid-cols-[300px_1fr]">
          <label className="flex flex-col gap-2.5">
            <span className="text-sm leading-5 font-bold">Khu vực / Thành phố</span>
            <span className="relative flex h-12 items-center">
              <MapPin size={18} className="pointer-events-none absolute left-3.75 text-brand" />
              <select
                value={selected.city}
                onChange={(e) => select(cinemas.find((c) => c.city === e.target.value).id)}
                className="size-full appearance-none rounded-xl border border-white/10 bg-card pr-10 pl-11.25 text-sm font-semibold outline-none focus-visible:border-brand"
              >
                {cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3.75 text-muted" />
            </span>
          </label>
          <label className="flex flex-col gap-2.5">
            <span className="text-sm leading-5 font-bold">Bạn muốn xem phim ở đâu?</span>
            <span className="relative flex h-12 items-center">
              <Search size={18} className="pointer-events-none absolute left-3.75 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên rạp, quận hoặc địa chỉ..."
                className="size-full rounded-xl border border-white/10 bg-card pr-3.75 pl-11.25 text-sm outline-none placeholder:text-muted focus-visible:border-brand"
              />
            </span>
          </label>
        </section>

        <section className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
            <h2 className="text-sm leading-5 font-bold">
              {list.length} rạp tại {selected.city}
            </h2>
            <p className="text-xs text-muted">Chọn một rạp để xem thông tin và lịch chiếu</p>
          </div>
          <div className="grid items-start gap-6 lg:grid-cols-[416px_1fr]">
            <div className="flex flex-col gap-3">
              {list.map((cinema) => (
                <CinemaCard
                  key={cinema.id}
                  cinema={cinema}
                  selected={cinema.id === selected.id}
                  onSelect={() => select(cinema.id)}
                />
              ))}
              <p className="pt-3.25 pb-2.5 text-center text-xs text-zinc-500">
                {list.length ? 'Đã hiển thị tất cả rạp trong khu vực' : 'Không tìm thấy rạp phù hợp trong khu vực.'}
              </p>
            </div>
            <CinemaDetail cinema={selected} />
          </div>
        </section>
      </>
    );
  }

  return (
    <div className="mx-auto flex max-w-304 flex-col gap-7 px-4 pt-7 pb-18 xl:px-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-xs leading-4 text-muted">
        <Link to="/" className="transition hover:text-white">
          Trang chủ
        </Link>
        <ChevronRight size={12} strokeWidth={2} absoluteStrokeWidth />
        <span className="text-white">Rạp chiếu</span>
      </nav>

      <div className="flex flex-col gap-2.5">
        <h1 className="flex items-center gap-3 font-display text-[30px] leading-9 font-bold">
          <span className="h-6 w-1 rounded-xs bg-brand" />
          Chọn rạp chiếu
        </h1>
        <p className="text-sm text-muted">
          Tìm rạp gần bạn và khám phá không gian điện ảnh yêu thích cùng Galaxy Lumière.
        </p>
      </div>

      {content}
    </div>
  );
}
