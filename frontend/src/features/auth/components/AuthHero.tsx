import imgKhanPhongDienAnh from '@/assets/auth/khan-phong-dien-anh.png';
import imgAperture from '@/assets/auth/aperture.svg';
import imgTicket from '@/assets/auth/ticket.svg';

/**
 * Phần banner giới thiệu không gian điện ảnh (nửa bên trái màn hình đăng nhập)
 */
export const AuthHero = () => {
  return (
    <div
      className="relative flex flex-col justify-between w-full h-full p-6 md:p-8 lg:p-10 xl:p-12 overflow-hidden select-none bg-[#0d0e10]"
      data-name="Không gian điện ảnh"
    >
      {/* Background Image rạp chiếu phim */}
      <div className="absolute inset-0 z-0">
        <img
          src={imgKhanPhongDienAnh}
          alt="Khán phòng điện ảnh"
          className="w-full h-full object-cover object-center pointer-events-none"
        />
      </div>

      {/* Lớp phủ tương phản Gradient cinema */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(8, 9, 11, 0.4) 0%, rgba(8, 9, 11, 0.02) 40%, rgba(8, 9, 11, 0.4) 63%, rgba(8, 9, 11, 0.961) 100%)',
        }}
        data-name="Voile de contraste"
      />

      {/* Thương hiệu trên cùng bên trái */}
      <div className="relative z-20 flex items-center gap-3" data-name="Thương hiệu">
        <div
          className="w-[38px] h-[38px] bg-[#ca3538] rounded-[8px] flex items-center justify-center shrink-0 shadow-lg shadow-[#ca3538]/30"
          data-name="Biểu tượng thương hiệu"
        >
          <img
            src={imgAperture}
            alt="Galaxy Aperture Logo"
            className="w-6 h-6 object-contain"
          />
        </div>
        <div className="flex flex-col gap-[3px] text-[#f5f2ed]">
          <span className="font-normal text-[22px] lg:text-[24px] tracking-[4px] leading-none">
            GALAXY
          </span>
          <span className="font-medium text-[8px] lg:text-[9px] tracking-[2.3px] leading-none text-[#f5f2ed]/90">
            HƠN CẢ ĐIỆN ẢNH
          </span>
        </div>
      </div>

      {/* Khối thông điệp truyền cảm hứng điện ảnh */}
      <div
        className="relative z-20 flex flex-col gap-5 lg:gap-6 w-full max-w-[560px] mt-auto"
        data-name="Lời mời điện ảnh"
      >
        <div className="flex flex-col gap-3 lg:gap-4">
          {/* Lời dẫn với line đỏ */}
          <div className="flex items-center gap-3">
            <div className="w-[28px] h-[2px] bg-[#e04445]" />
            <span className="font-semibold text-[10px] lg:text-[11px] tracking-[2.3px] text-[#f5f2ed] uppercase">
              Điện ảnh, theo cách của bạn
            </span>
          </div>

          {/* Tiêu đề lớn */}
          <div className="font-semibold text-[38px] sm:text-[46px] lg:text-[50px] xl:text-[58px] tracking-[-2.4px] leading-[1.12] text-[#f5f2ed]">
            <p className="mb-0">Mọi cảm xúc.</p>
            <p>Một màn ảnh.</p>
          </div>

          {/* Đoạn mô tả */}
          <p className="font-normal text-[14px] lg:text-[15px] leading-[1.65] text-[#c3c1c2] max-w-[520px]">
            Từ những thước phim đầu tiên đến dư âm cuối cùng. Khám phá, đặt vé và
            tận hưởng thế giới điện ảnh cùng Lumière.
          </p>
        </div>

        {/* Thanh dấu ấn trải nghiệm / Footer trái */}
        <div
          className="flex items-center justify-between border-t border-white/16 pt-4 lg:pt-5 w-full"
          data-name="Dấu ấn trải nghiệm"
        >
          <div className="flex items-center gap-[10px]">
            <img
              src={imgTicket}
              alt="Ticket icon"
              className="w-[18px] h-[18px] object-contain opacity-90"
            />
            <span className="font-normal text-[12px] text-[#c6c3c3]">
              Màn ảnh lớn. Trải nghiệm khác biệt.
            </span>
          </div>
          <span className="font-normal text-[10px] tracking-[1.6px] text-[#9d9ea5]">
            TỪ NĂM 2024
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthHero;
