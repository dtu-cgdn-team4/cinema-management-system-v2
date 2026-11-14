import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Trang xử lý callback xác thực từ Google OAuth2
 * Nhận accessToken và user từ URL query params sau khi Backend chuyển hướng về
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

    const finishGoogleLogin = () => {
      try {
        // 1. Kiểm tra nếu có lỗi từ Backend hoặc Google chuyển về
        const errorParam = searchParams.get('error') || searchParams.get('message');
        if (errorParam) {
          throw new Error(decodeURIComponent(errorParam));
        }

        // 2. Lấy accessToken và user từ URL query parameters
        const accessToken = searchParams.get('accessToken');
        const userParam = searchParams.get('user');

        if (!accessToken || !userParam) {
          throw new Error('Không nhận được thông tin xác thực từ Google. Vui lòng thử lại.');
        }

        let user;
        try {
          user = JSON.parse(userParam);
        } catch {
          user = JSON.parse(decodeURIComponent(userParam));
        }

        const rememberMe = sessionStorage.getItem('googleLoginRememberMe') !== 'false';
        const requestedPath = sessionStorage.getItem('googleLoginReturnTo') || '/';
        const returnTo = requestedPath.startsWith('/') && !requestedPath.startsWith('//')
          ? requestedPath
          : '/';

        sessionStorage.removeItem('googleLoginRememberMe');
        sessionStorage.removeItem('googleLoginReturnTo');

        // Lưu thông tin đăng nhập vào context và storage
        login({ accessToken, user }, rememberMe);

        // Chuyển hướng về trang chủ
        navigate(returnTo, { replace: true });
      } catch (requestError) {
        sessionStorage.removeItem('googleLoginRememberMe');
        sessionStorage.removeItem('googleLoginReturnTo');
        setError(requestError.message || 'Không thể hoàn tất đăng nhập Google.');
      }
    };

    finishGoogleLogin();
  }, [login, navigate, searchParams]);

  return (
    <main className="min-h-screen bg-[#0d0e10] text-[#f5f2ed] flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl border border-[#303135] bg-[#17181b] p-8 text-center shadow-2xl">
        {error ? (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-950/60 border border-red-800 text-[#e04445] text-xl font-bold">
              ✕
            </div>
            <h1 className="text-xl font-semibold text-white">Đăng nhập Google chưa hoàn tất</h1>
            <p role="alert" className="mt-3 text-sm text-red-300 leading-relaxed">{error}</p>
            <Link
              to="/login"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[#ca3538] hover:bg-[#b02e31] px-6 text-sm font-semibold text-white transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#ca3538] border-t-transparent" />
            <h1 className="text-xl font-semibold text-white">Đang hoàn tất đăng nhập</h1>
            <p className="mt-3 text-sm text-[#9d9ea5]">Đang tải thông tin tài khoản của bạn...</p>
          </>
        )}
      </section>
    </main>
  );
};

export default GoogleCallbackPage;
