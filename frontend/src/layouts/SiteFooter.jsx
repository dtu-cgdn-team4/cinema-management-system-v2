import facebookIcon from '../assets/facebook.svg';
import instagramIcon from '../assets/instagram.svg';
import youtubeIcon from '../assets/youtube.svg';
import BrandLogo from '../components/common/BrandLogo';

const COLUMNS = [
  ['Khám phá', ['Phim đang chiếu', 'Phim sắp chiếu', 'Hệ thống rạp']],
  ['Hỗ trợ', ['Hướng dẫn đặt vé', 'Câu hỏi thường gặp', 'Liên hệ']],
  ['Thông tin', ['Về Galaxy', 'Điều khoản sử dụng', 'Chính sách bảo mật']],
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto flex max-w-304 flex-col gap-7 px-4 pt-8 pb-6 sm:gap-9 sm:pt-11.75 sm:pb-7 xl:px-0">
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:gap-10 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] lg:gap-x-8 xl:gap-x-18">
          <div className="col-span-2 flex min-w-0 flex-col gap-4 sm:col-span-1">
            <BrandLogo className="h-10 md:w-36.25" />
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
            <div key={title} className="flex min-w-0 flex-col gap-3 sm:gap-4">
              <h2 className="text-sm leading-5 font-bold">{title}</h2>
              <ul className="flex flex-col gap-3 text-xs leading-5 text-muted sm:gap-4">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-5 text-xs leading-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-zinc-500">© 2026 Galaxy Cinema. Mọi quyền được bảo lưu.</span>
          <span className="text-muted">Tiếng Việt · VN</span>
        </div>
      </div>
    </footer>
  );
}
