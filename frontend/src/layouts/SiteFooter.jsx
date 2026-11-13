import facebookIcon from '../assets/facebook.svg';
import instagramIcon from '../assets/instagram.svg';
import youtubeIcon from '../assets/youtube.svg';
import BrandLogo from '../components/common/BrandLogo';

const COLUMNS = [
  ['Khám phá', ['Phim đang chiếu', 'Phim sắp chiếu', 'Hệ thống rạp']],
  ['Hỗ trợ', ['Hướng dẫn đặt vé', 'Câu hỏi thường gặp', 'Liên hệ']],
  ['Thông tin', ['Về Galaxy Lumière', 'Điều khoản sử dụng', 'Chính sách bảo mật']],
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-304 flex-col gap-9 px-4 pt-11.75 pb-7 xl:px-0">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[360px_repeat(3,1fr)] lg:gap-x-18">
          <div className="flex flex-col gap-4">
            <BrandLogo />
            <p className="text-xs leading-4 text-muted">
              Mỗi bộ phim, một thế giới mới.
              <br />
              Khám phá điện ảnh và đặt vé theo cách của bạn.
            </p>
            <div className="flex gap-4.5">
              {[facebookIcon, instagramIcon, youtubeIcon].map((icon) => (
                <img key={icon} src={icon} alt="" />
              ))}
            </div>
          </div>
          {COLUMNS.map(([title, items]) => (
            <div key={title} className="flex flex-col gap-4">
              <h2 className="text-sm leading-5 font-bold">{title}</h2>
              <ul className="flex flex-col gap-4 text-xs leading-4 text-muted">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-5.25 text-xs leading-4">
          <span className="text-zinc-500">© 2026 Galaxy Cinema / Lumière. Mọi quyền được bảo lưu.</span>
          <span className="text-muted">Tiếng Việt · VN</span>
        </div>
      </div>
    </footer>
  );
}
