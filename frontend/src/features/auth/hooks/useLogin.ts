import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authApi from '../api/authApi';
import type { LoginFormData, LoginFormErrors } from '@/types/auth';
import type { ApiClientError } from '@/services/apiClient';

interface LoginNavigationState {
  from?: {
    pathname?: string;
  };
}

export const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const resetPendingState = () => {
      setIsSubmitting(false);
      setIsGoogleLoading(false);
    };

    window.addEventListener('pageshow', resetPendingState);
    return () => window.removeEventListener('pageshow', resetPendingState);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.currentTarget;
    if (name === 'rememberMe' && type === 'checkbox') {
      setFormData((prev) => ({ ...prev, rememberMe: checked }));
    } else if (name === 'username' || name === 'password') {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Xóa lỗi của trường tương ứng khi người dùng nhập lại
    if ((name === 'username' || name === 'password') && errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: '' }));
    }
  };

  const validate = () => {
    const newErrors: LoginFormErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Tài khoản hoặc email không được để trống';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await authApi.login({
        username: formData.username.trim(),
        password: formData.password,
      });

      if (response && response.data) {
        // Lưu token và thông tin người dùng vào AuthContext & Storage
        login(response.data, formData.rememberMe);

        // Chuyển hướng theo role hoặc trang đích ban đầu
        const navigationState = location.state as LoginNavigationState | null;
        const from = navigationState?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (error: unknown) {
      const apiError = error as ApiClientError;
      if (apiError.fieldErrors) {
        setErrors(apiError.fieldErrors as LoginFormErrors);
      } else {
        setErrors({
          general:
            (error instanceof Error && error.message) ||
            'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setErrors({});

      const res = await authApi.getGoogleAuthUrl();
      // Khớp chính xác trường authorizationUrl từ Backend Spring Boot GoogleAuthUrlResponse
      const redirectUrl = res.data?.authorizationUrl || res.data?.authUrl;

      if (redirectUrl) {
        sessionStorage.setItem(
          'googleLoginReturnTo',
          (location.state as LoginNavigationState | null)?.from?.pathname || '/'
        );
        sessionStorage.setItem('googleLoginRememberMe', String(formData.rememberMe));
        window.location.href = redirectUrl;
      } else {
        throw new Error('Không nhận được đường dẫn xác thực Google từ máy chủ.');
      }
    } catch (error: unknown) {
      setErrors({
        general:
          (error instanceof Error && error.message) ||
          'Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.',
      });
      setIsGoogleLoading(false);
    }
  };

  return {
    formData,
    showPassword,
    setShowPassword,
    errors,
    isSubmitting,
    isGoogleLoading,
    handleChange,
    handleSubmit,
    handleGoogleLogin,
    setFormData,
  };
};

export default useLogin;
