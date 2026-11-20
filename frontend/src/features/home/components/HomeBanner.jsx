import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import popcorn from '@/assets/home/banners/cinema-popcorn.png';
import universe from '@/assets/home/banners/cinema-universe.png';
import date from '@/assets/home/banners/cinema-date.png';
import friends from '@/assets/home/banners/cinema-friends.png';
import projector from '@/assets/home/banners/cinema-projector.png';

// Ảnh nền riêng; chữ HTML giúp nội dung rõ nét trên cả điện thoại và máy tính.
const banners = [
  { image: popcorn, title: 'PHIM HAY. BẮP THƠM.\nHẸN NHAU Ở RẠP.', subtitle: 'Trọn vẹn một buổi xem phim', action: 'Mua vé ngay', to: '#quick-booking' },
  { image: universe, title: 'MỞ LỐI ĐẾN\nTHẾ GIỚI KHÁC.', subtitle: 'Khám phá qua từng khung hình', action: 'Khám phá phim', to: '/phim' },
  { image: date, title: 'MỘT BUỔI HẸN.\nNGÀN CẢM XÚC.', subtitle: 'Cùng người thương đến rạp', action: 'Chọn phim ngay', to: '#quick-booking' },
  { image: friends, title: 'CUỐI TUẦN NÀY,\nĐI XEM PHIM NHÉ?', subtitle: 'Có bạn, niềm vui thêm trọn vẹn', action: 'Tin tức & ưu đãi', to: '#home-news' },
  { image: projector, title: 'ÁNH ĐÈN TẮT.\nCÂU CHUYỆN BẮT ĐẦU.', subtitle: 'Galaxy · Chạm vào điện ảnh', action: 'Xem tất cả phim', to: '/phim' },
];

export default function HomeBanner() {
  const [slide, setSlide] = useState(1);
  const [animated, setAnimated] = useState(true);


  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const moving = useRef(false);
  const active = (slide - 1 + banners.length) % banners.length;
  const slides = [banners[banners.length - 1], ...banners, banners[0]];
  const move = (step) => {
    if (moving.current) return;
    moving.current = true;
    setAnimated(true);
    setSlide((index) => index + step);
  };
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    update();
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slide === 0 || slide === banners.length + 1) {
        setAnimated(false);
        setSlide(slide === 0 ? banners.length : 1);
      }
      moving.current = false;
    }, reduced ? 0 : 650);
    return () => clearTimeout(timer);
  }, [slide, reduced]);
  useEffect(() => {
    if (paused || reduced || hidden) return;
    const timer = setInterval(() => move(1), 3000);
    return () => clearInterval(timer);
  }, [paused, reduced, hidden, slide]);
  return (
    <section aria-label="Banner giới thiệu" aria-roledescription="carousel" className="overflow-hidden py-4 sm:py-6">
      <div className="relative mx-auto aspect-[4/3] w-[90%] max-w-304 sm:aspect-[16/6] sm:w-[82%]">
        {slides.map((banner, index) => {
          const position = index - slide;
          return <div key={index} aria-hidden={position !== 0} className={`group absolute inset-0 overflow-hidden rounded-xl ${animated && !reduced ? 'transition-transform duration-[600ms] ease-in-out' : ''}`} style={{ transform: `translateX(${position * 104}%)` }}>
            <img src={banner.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.025] group-hover:brightness-110 motion-reduce:transition-none motion-reduce:transform-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent sm:from-black/20 sm:via-transparent" />
            <div className="relative flex h-full flex-col justify-center px-6 py-8 sm:px-12 lg:px-16">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/80 sm:text-sm">{banner.subtitle}</p>
              <h2 className="whitespace-pre-line text-2xl font-black leading-tight sm:text-3xl lg:text-4xl xl:text-5xl">{banner.title}</h2>
              <div className="mt-5">{banner.to.startsWith('#') ? <a tabIndex={position ? -1 : 0} href={banner.to} className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 text-sm font-bold text-zinc-900 cursor-pointer transition hover:bg-brand hover:text-white">{banner.action}</a> : <Link tabIndex={position ? -1 : 0} to={banner.to} className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 text-sm font-bold text-zinc-900 cursor-pointer transition hover:bg-brand hover:text-white">{banner.action}</Link>}</div>
            </div>
          </div>;
        })}
        <button type="button" aria-label="Banner trước" onClick={() => move(-1)} className="absolute -left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 cursor-pointer transition hover:bg-brand sm:-left-5"><ChevronLeft /></button>
        <button type="button" aria-label="Banner tiếp theo" onClick={() => move(1)} className="absolute -right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/65 cursor-pointer transition hover:bg-brand sm:-right-5"><ChevronRight /></button>
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 max-sm:-ml-4">{banners.map((_, index) => <button key={index} type="button" aria-label={`Xem banner ${index + 1}`} aria-pressed={index === active} onClick={() => { if (!moving.current) { setAnimated(true); setSlide(index + 1); } }} className="flex h-11 w-9 cursor-pointer items-center justify-center sm:w-11"><span className={`size-2.5 rounded-full border border-white transition-transform hover:scale-125 ${index === active ? 'bg-white' : 'bg-black/20'}`} /></button>)}</div>
        <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? 'Bật tự chuyển banner' : 'Tạm dừng tự chuyển banner'} className="absolute bottom-2 right-2 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 hover:bg-brand">{paused ? <Play size={16} /> : <Pause size={16} />}</button>
      </div>
    </section>
  );
}
