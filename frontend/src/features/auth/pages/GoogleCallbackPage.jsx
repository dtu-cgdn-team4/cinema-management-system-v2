import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Globe, ChevronDown, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import RegisterCinematicHero from '../components/RegisterCinematicHero';
import authApi from '../api/authApi';

/**
 * Trang xử lý callback xác thực từ Google OAuth2
 * Nhận phiên đăng nhập từ refresh cookie HttpOnly sau khi Backend chuyển hướng về.
 * - Nếu tài khoản Google thiếu SĐT, ngày sinh hoặc giới tính:
 *   Chuyển hướng về trang đăng nhập (/dang-nhap?step=complete-profile) để form bên phải đổi sang nhập thông tin còn thiếu.
 * - Nếu tài khoản đã đủ thông tin: Chuyển về trang trước đó hoặc trang chủ.
 */
export const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const finishGoogleLogin = async () => {
      try {
        // 1. Kiểm tra nếu có lỗi từ Backend hoặc Google chuyển về
        const errorParam = searchParams.get('error') || searchParams.get('message');
        if (errorParam) {
          throw new Error(decodeURIComponent(errorParam));
        }

        // Exchange the HttpOnly refresh cookie for a short-lived access token.
        const loginData = await authApi.exchangeGoogleLogin();
        const { accessToken, user } = loginData || {};
        if (!accessToken || !user) {
          throw new Error('Không nhận được thông tin xác thực từ Google. Vui lòng thử lại.');
        }

        const rememberMe = sessionStorage.getItem('googleLoginRememberMe') !== 'false';
        const requestedPath = sessionStorage.getItem('googleLoginReturnTo') || '/';
        const returnTo = requestedPath.startsWith('/') && !requestedPath.startsWith('//')
          ? requestedPath
          : '/';

        sessionStorage.removeItem('googleLoginRememberMe');

        // Lưu thông tin đăng nhập vào context và storage
        login({ accessToken, user }, rememberMe);

        // 3. Kiểm tra thông tin bắt buộc: SĐT, Ngày sinh, Giới tính
        const isProfileIncomplete = !user.phoneNumber || !user.dateOfBirth || !user.gender;
        if (isProfileIncomplete) {
          // Chuyển hướng trực tiếp về trang đăng nhập với form nhập nội dung còn thiếu ở cột bên phải
          navigate('/dang-nhap?step=complete-profile', { replace: true });
        } else {
          sessionStorage.removeItem('googleLoginReturnTo');
          navigate(returnTo, { replace: true });
        }
      } catch (requestError) {
        sessionStorage.removeItem('googleLoginRememberMe');
        sessionStorage.removeItem('googleLoginReturnTo');
        setError(requestError.message || 'Không thể hoàn tất đăng nhập Google.');
      }
    };

    finishGoogleLogin();
  }, [login, navigate, searchParams]);

  return (
    <div className="bg-[#0d0e10] min-h-screen w-full overflow-x-hidden text-[#f5f2ed] select-none">
      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[55%_45%] bg-[#0d0e10]">
        {/* Cột trái: Không gian điện ảnh giữ nguyên */}
        <div className="relative hidden lg:block lg:sticky lg:top-0 h-screen w-full overflow-hidden bg-[#090a0f]">
          <RegisterCinematicHero />
        </div>

        {/* Cột phải: Trạng thái xử lý callback */}
        <div className="flex min-h-screen w-full flex-col justify-between pt-6 pb-6 px-4 sm:px-8 lg:px-6 xl:px-12 lg:pt-[48px] lg:pb-[36px]">
          {/* Điều hướng trên cùng */}
          <div className="mx-auto w-full max-w-[408px] lg:max-w-[440px] flex items-center justify-between text-xs text-[#8f929a] mb-5 lg:mb-0">
            <Link to="/" className="inline-flex items-center gap-1.5 transition hover:text-white">
              <ArrowLeft size={14} />
              <span>Về trang chủ</span>
            </Link>
            <div className="inline-flex items-center gap-1.5 text-[#8f929a]">
              <Globe size={14} />
              <span>Tiếng Việt</span>
              <ChevronDown size={13} />
            </div>
          </div>

          {/* Khối nội dung trung tâm */}
          <div className="mx-auto my-auto w-full max-w-[408px] lg:max-w-[440px] py-4 text-center">
            {error ? (
              <div className="rounded-xl border border-[#303135] bg-[#17181b] p-8 shadow-2xl">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-950/60 border border-red-800 text-[#e04445] text-xl font-bold">
                  <AlertCircle size={22} />
                </div>
                <h1 className="text-xl font-semibold text-white">Đăng nhập Google chưa hoàn tất</h1>
                <p role="alert" className="mt-3 text-sm text-red-300 leading-relaxed">{error}</p>
                <Link
                  to="/dang-nhap"
                  className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#ca3538] hover:bg-[#b02e31] px-6 text-sm font-semibold text-white transition-colors"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-[#303135] bg-[#17181b] p-8 shadow-2xl">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#ca3538] border-t-transparent" />
                <h1 className="text-xl font-semibold text-white">Đang xử lý đăng nhập Google...</h1>
                <p className="mt-2 text-sm text-[#9d9ea5]">Vui lòng đợi trong giây lát</p>
              </div>
            )}
          </div>

          {/* Chân trang */}
          <div className="mx-auto w-full max-w-[408px] lg:max-w-[440px] pt-4 text-center text-xs text-[#6b7280]">
            <p className="text-[11px] text-[#525560]">© 2026 Galaxy Cinema. Mọi quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
