import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authApi from '../api/authApi';

export const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const started = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const finishGoogleLogin = async () => {
      try {
        const response = await authApi.exchangeGoogleLogin();
        const loginData = response?.data;
        if (!loginData?.accessToken || !loginData?.user) {
          throw new Error('Không nhận được thông tin tài khoản từ máy chủ.');
        }

        const rememberMe = sessionStorage.getItem('googleLoginRememberMe') !== 'false';
        const requestedPath = sessionStorage.getItem('googleLoginReturnTo') || '/';
        const returnTo = requestedPath.startsWith('/') && !requestedPath.startsWith('//')
          ? requestedPath
          : '/';

        sessionStorage.removeItem('googleLoginRememberMe');
        sessionStorage.removeItem('googleLoginReturnTo');
        login(loginData, rememberMe);
        navigate(returnTo, { replace: true });
      } catch (requestError: unknown) {
        sessionStorage.removeItem('googleLoginRememberMe');
        sessionStorage.removeItem('googleLoginReturnTo');
        setError(
          (requestError instanceof Error && requestError.message) ||
            'Không thể hoàn tất đăng nhập Google.',
        );
      }
    };

    finishGoogleLogin();
  }, [login, navigate]);

  return (
    <main className="min-h-screen bg-[#0d0e10] text-[#f5f2ed] flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl border border-[#303135] bg-[#17181b] p-8 text-center">
        {error ? (
          <>
            <h1 className="text-xl font-semibold">Đăng nhập Google chưa hoàn tất</h1>
            <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>
            <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-[#e04445]">
              Quay lại đăng nhập
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Đang hoàn tất đăng nhập</h1>
            <p className="mt-3 text-sm text-[#9d9ea5]">Đang tải thông tin tài khoản của bạn...</p>
          </>
        )}
      </section>
    </main>
  );
};

export default GoogleCallbackPage;
