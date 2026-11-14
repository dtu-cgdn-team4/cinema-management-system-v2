import { Link } from 'react-router-dom';
import cinemaAuditoriumImg from '../../../assets/cinema-auditorium.jpg';
import logoIcon from '../../../assets/logo-icon.svg';

/** Phần giới thiệu thương hiệu và không khí rạp chiếu cạnh biểu mẫu đăng ký. */
export default function RegisterCinematicHero() {
  return (
    <div className="relative flex h-screen w-full flex-col justify-between overflow-hidden p-8 lg:p-[48px] xl:p-[56px] select-none">
      {/* Ảnh nền được phủ gradient để nội dung chữ phía trước dễ đọc. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[64px] overflow-hidden">
        <img
          src={cinemaAuditoriumImg}
          alt="Galaxy Cinema Theater"
          className="h-full w-full object-cover object-center"
        />

        {/* Lớp phủ làm tối ảnh dần về phía nội dung và chân trang. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(9, 10, 15, 0.05) 0%, rgba(9, 10, 15, 0.1) 50%, rgba(9, 10, 15, 0.5) 85%, #090a0f 100%)',
          }}
        />
      </div>

      {/* Thương hiệu Galaxy liên kết về trang chủ. */}
      <div className="relative z-20">
        <Link to="/" className="inline-flex items-center gap-[14px] transition hover:opacity-90">
          <span className="grid size-[38px] place-items-center rounded-[8px] bg-[#ca3538] shrink-0">
            <img src={logoIcon} alt="Galaxy Logo" className="size-[24px]" />
          </span>
          <div className="flex flex-col">
            <span className="font-inter font-normal text-[24px] tracking-[4px] text-white leading-none">
              GALAXY
            </span>
            <span className="font-inter font-medium text-[9px] tracking-[2.3px] uppercase text-neutral-400 leading-none mt-1">
              HƠN CẢ ĐIỆN ẢNH
            </span>
          </div>
        </Link>
      </div>

      {/* Thông điệp giới thiệu đặt ở phần dưới của ảnh. */}
      <div className="relative z-20 mt-auto mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-[2px] w-[28px] rounded-full bg-[#ca3538] shrink-0" />
          <span className="font-inter font-semibold text-[11px] tracking-[2.3px] uppercase text-[#d1d5db]">
            ĐIỆN ẢNH, THEO CÁCH CỦA BẠN
          </span>
        </div>

        <h1 className="font-inter font-semibold text-[64px] leading-[1.12] tracking-[-2.8px] text-white">
          Mọi cảm xúc. <br />
          Một màn ảnh.
        </h1>

        <p className="mt-4 max-w-[534px] font-inter font-normal text-[16px] leading-[1.7] text-[#c3c1c2]">
          Từ những thước phim đầu tiên đến dư âm cuối cùng. Khám phá, đặt vé
          và tận hưởng thế giới điện ảnh cùng Lumière.
        </p>
      </div>

      {/* Thông tin ngắn ở chân khu vực giới thiệu. */}
      <div className="relative z-20 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#8f929a]">
        <div className="flex items-center gap-2.5">
          <svg
            className="size-4 text-[#8f929a]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <line x1="7" y1="5" x2="7" y2="19" />
            <line x1="17" y1="5" x2="17" y2="19" />
          </svg>
          <span className="text-[12px] text-[#8f929a]">Màn ảnh lớn. Trải nghiệm khác biệt.</span>
        </div>
        <span className="text-[11px] tracking-wider uppercase font-medium text-[#8f929a]">
          TỪ NĂM 2024
        </span>
      </div>
    </div>
  );
}
