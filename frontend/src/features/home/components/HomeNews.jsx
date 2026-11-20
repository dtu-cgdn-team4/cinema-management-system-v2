import { ArrowUpRight, Gift, Newspaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import auditorium from '@/assets/cinema-auditorium.jpg';

const articles = [
  { title: 'Hẹn nhau một buổi tối ở rạp', category: 'Cảm hứng điện ảnh', icon: Newspaper, image: auditorium, text: 'Chọn một bộ phim bạn yêu thích, đến rạp sớm và dành thời gian tận hưởng màn ảnh lớn cùng những người thân yêu.' },
  { title: 'Ưu đãi dành cho thành viên', category: 'Ưu đãi', icon: Gift, image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900', text: 'Khu vực cập nhật chương trình dành cho thành viên. Nội dung và điều kiện ưu đãi chính thức sẽ được công bố tại đây khi có chương trình.' },
  { title: 'Lên kế hoạch cho cuối tuần', category: 'Góc điện ảnh', icon: Newspaper, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900', text: 'Khám phá phim đang chiếu, xem trailer và lựa chọn rạp cùng ngày xem phù hợp trước khi đặt vé.' },
];

// Sau khi có API ưu đãi, truyền dữ liệu { id, title, image, category } qua prop promotions.
// id được dùng chung với route trang chi tiết /uu-dai/:id.
export default function HomeNews({ promotions }) {
  const items = promotions ?? articles.map((article, index) => ({ ...article, id: `demo-${index + 1}` }));
  return (
    <section aria-labelledby="home-news" className="mx-auto max-w-304 px-4 py-12 sm:py-16 xl:px-0">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">Có gì mới tại Galaxy?</p>
      <h2 id="home-news" className="text-2xl font-extrabold uppercase sm:text-3xl">Tin tức & Ưu đãi</h2>
      {!promotions && <p className="mt-3 text-sm text-muted">Nội dung giới thiệu mẫu. Chưa có chương trình ưu đãi được xác nhận.</p>}
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ id, title, category = 'Ưu đãi', icon: Icon = Gift, image }) => (
          <Link key={id} to={`/uu-dai/${id}`} className="group block cursor-pointer overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-brand/60 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-brand motion-reduce:transform-none">
            <div className="overflow-hidden"><img src={image} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none" /></div>
            <div className="space-y-3 p-5">
              <p className="flex items-center gap-2 text-xs font-semibold text-brand"><Icon size={15} />{category}</p>
              <h3 className="text-lg font-bold transition group-hover:text-brand">{title}</h3>
              <span className="flex min-h-11 items-center gap-2 text-sm text-brand">Xem chi tiết <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
        ))}
      </div>
      {items.length === 0 && <p className="py-8 text-muted">Chưa có tin tức hoặc ưu đãi.</p>}
    </section>
  );
}
