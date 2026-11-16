import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, ChevronDown } from 'lucide-react';
import RegisterCinematicHero from '../components/RegisterCinematicHero';
import LoginForm from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

/**
 * Trang Đăng nhập hệ thống Quản lý rạp chiếu phim Galaxy
 * - Tái sử dụng RegisterCinematicHero của Long cho banner bên trái
 * - Bố cục responsive đồng bộ với trang Đăng ký (RegisterPage)
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
      className="bg-[#0d0e10] min-h-screen w-full overflow-x-hidden text-[#f5f2ed] select-none"
      data-node-id="1003:147"
      data-name="Đăng nhập"
    >
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[55%_45%] bg-[#0d0e10]">
        {/* Cột trái: Không gian điện ảnh (Ẩn trên mobile, cố định trên desktop) */}
        <div
          className="relative hidden lg:block lg:sticky lg:top-0 h-screen w-full overflow-hidden bg-[#090a0f]"
          data-node-id="1003:148"
        >
          <RegisterCinematicHero />
        </div>

        {/* Cột phải: Khối Đăng nhập thành viên */}
        <div
          className="flex min-h-screen w-full flex-col justify-between pt-6 pb-6 px-4 sm:px-8 lg:px-6 xl:px-12 lg:pt-[48px] lg:pb-[36px]"
          data-node-id="1003:169"
          data-name="Đăng nhập thành viên"
        >
          {/* Thanh Điều hướng trên cùng (Về trang chủ + Đổi ngôn ngữ) */}
          <div
            className="mx-auto w-full max-w-[408px] lg:max-w-[440px] flex items-center justify-between text-xs text-[#8f929a] mb-5 lg:mb-0"
            data-node-id="1003:170"
            data-name="Điều hướng"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 transition hover:text-white"
              data-node-id="1003:171"
              data-name="Về trang chủ"
            >
              <ArrowLeft size={14} />
              <span>Về trang chủ</span>
            </Link>

            {/* Chọn ngôn ngữ */}
            <div className="relative" data-node-id="1003:174" data-name="Ngôn ngữ">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="inline-flex items-center gap-1.5 text-[#8f929a] transition hover:text-white cursor-pointer select-none"
              >
                <Globe size={14} />
                <span>{currentLang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${showLangMenu ? 'rotate-180' : ''}`}
                />
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
          <div className="mx-auto my-auto w-full max-w-[408px] lg:max-w-[440px] py-4">
            <LoginForm {...loginState} />
          </div>

          {/* Chân trang phân hệ Auth */}
          <div
            className="mx-auto w-full max-w-[408px] lg:max-w-[440px] pt-4 text-center text-xs text-[#6b7280]"
            data-node-id="1003:215"
            data-name="Chân trang"
          >
            <div
              className="flex items-center justify-center gap-3 text-[11.5px] text-[#8f929a]"
              data-node-id="1003:216"
              data-name="Hỗ trợ và chính sách"
            >
              <a
                href="#tro-giup"
                onClick={(e) => e.preventDefault()}
                className="transition hover:text-white"
              >
                Trợ giúp
              </a>
              <span>·</span>
              <a
                href="#dieu-khoan"
                onClick={(e) => e.preventDefault()}
                className="transition hover:text-white"
              >
                Điều khoản sử dụng
              </a>
              <span>·</span>
              <a
                href="#chinh-sach"
                onClick={(e) => e.preventDefault()}
                className="transition hover:text-white"
              >
                Chính sách bảo mật
              </a>
            </div>
            <p className="mt-1.5 text-[11px] text-[#525560]" data-node-id="1003:222">
              © 2026 Galaxy Cinema. Mọi quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
