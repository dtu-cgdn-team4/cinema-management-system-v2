import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthHero from '../components/AuthHero';
import LoginForm from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';
import imgArrowLeft from '@/assets/auth/arrow-left.svg';
import imgGlobe from '@/assets/auth/globe.svg';
import imgChevronDown from '@/assets/auth/chevron-down.svg';

/**
 * Trang Đăng nhập hệ thống Quản lý rạp chiếu phim Galaxy
 * - Trên desktop (lg trở lên): hiển thị 2 cột (Không gian điện ảnh bên trái + Form đăng nhập bên phải)
 * - Khi responsive (dưới lg): ẩn hoàn toàn banner trái, chỉ hiển thị khối Đăng nhập thành viên (box màu xanh)
 */
export const LoginPage = () => {
  const loginState = useLogin();
  const [currentLang, setCurrentLang] = useState('vi');
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'vi', label: 'Tiếng Việt' },
    { code: 'en', label: 'English' },
  ];

  return (
    <div
      className="bg-[#0d0e10] flex flex-col lg:flex-row min-h-screen lg:h-screen lg:max-h-screen w-full overflow-y-auto lg:overflow-hidden no-scrollbar relative select-none"
      data-node-id="1003:147"
      data-name="Đăng nhập"
    >
      {/* Cột trái: Không gian điện ảnh (Ẩn hoàn toàn khi responsive, chỉ hiển thị từ màn hình lg trở lên) */}
      <div
        className="hidden lg:flex lg:w-[55%] h-full relative shrink-0"
        data-node-id="1003:148"
      >
        <AuthHero />
      </div>

      {/* Cột phải: Khối Đăng nhập thành viên (Box màu xanh) - Chiếm trọn màn hình khi responsive */}
      <div
        className="bg-[#0d0e10] flex-1 w-full lg:w-[45%] min-h-screen lg:h-full flex flex-col justify-between items-center py-6 sm:py-8 lg:py-6 xl:py-8 px-6 sm:px-10 lg:px-10 xl:px-14 overflow-y-auto lg:overflow-hidden no-scrollbar"
        data-node-id="1003:169"
        data-name="Đăng nhập thành viên"
      >
        {/* Thanh Điều hướng trên cùng */}
        <div
          className="flex items-center justify-between w-full max-w-[408px] shrink-0"
          data-node-id="1003:170"
          data-name="Điều hướng"
        >
          {/* Lối về trang chủ */}
          <Link
            to="/"
            className="flex items-center gap-2 text-[#9d9ea5] hover:text-[#f5f2ed] transition-colors cursor-pointer group"
            data-node-id="1003:171"
            data-name="Về trang chủ"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <img
                src={imgArrowLeft}
                alt="Arrow left"
                className="w-4 h-4 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>
            <span className="font-normal text-[12px]">Về trang chủ</span>
          </Link>

          {/* Chọn ngôn ngữ */}
          <div className="relative" data-node-id="1003:174" data-name="Ngôn ngữ">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-[7px] text-[#9d9ea5] hover:text-[#f5f2ed] transition-colors cursor-pointer"
            >
              <div className="w-[15px] h-[15px] flex items-center justify-center">
                <img
                  src={imgGlobe}
                  alt="Globe icon"
                  className="w-[15px] h-[15px] object-contain opacity-80"
                />
              </div>
              <span className="font-normal text-[12px]">
                {currentLang === 'vi' ? 'Tiếng Việt' : 'English'}
              </span>
              <div
                className={`w-3 h-3 flex items-center justify-center transition-transform ${
                  showLangMenu ? 'rotate-180' : ''
                }`}
              >
                <img
                  src={imgChevronDown}
                  alt="Chevron down"
                  className="w-3 h-3 object-contain opacity-70"
                />
              </div>
            </button>

            {/* Menu chọn ngôn ngữ */}
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-[#17181b] border border-[#303135] rounded-md shadow-xl py-1 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-[12px] transition-colors ${
                      currentLang === lang.code
                        ? 'text-[#ca3538] font-semibold bg-[#212226]'
                        : 'text-[#9d9ea5] hover:text-[#f5f2ed] hover:bg-[#212226]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Khối Biểu mẫu Đăng nhập chính */}
        <div className="w-full my-auto py-2 flex justify-center shrink-0">
          <LoginForm {...loginState} />
        </div>

        {/* Chân trang phân hệ Auth */}
        <div
          className="flex flex-col gap-2.5 items-center w-full max-w-[408px] shrink-0 pt-1"
          data-node-id="1003:215"
          data-name="Chân trang"
        >
          {/* Liên kết hỗ trợ và điều khoản */}
          <div
            className="flex items-center gap-[18px]"
            data-node-id="1003:216"
            data-name="Hỗ trợ và chính sách"
          >
            <Link
              to="/help"
              className="font-normal text-[11px] text-[#9d9ea5] hover:text-[#f5f2ed] transition-colors"
            >
              Trợ giúp
            </Link>
            <div className="w-[2px] h-[2px] bg-[#74767e] rounded-full" />
            <Link
              to="/terms"
              className="font-normal text-[11px] text-[#9d9ea5] hover:text-[#f5f2ed] transition-colors"
            >
              Điều khoản sử dụng
            </Link>
            <div className="w-[2px] h-[2px] bg-[#74767e] rounded-full" />
            <Link
              to="/privacy"
              className="font-normal text-[11px] text-[#9d9ea5] hover:text-[#f5f2ed] transition-colors"
            >
              Chính sách bảo mật
            </Link>
          </div>

          {/* Bản quyền */}
          <p
            className="font-normal text-[10px] text-[#74767e]"
            data-node-id="1003:222"
          >
            © 2026 Galaxy Cinema. Mọi quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
