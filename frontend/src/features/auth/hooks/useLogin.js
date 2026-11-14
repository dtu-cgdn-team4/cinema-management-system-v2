import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authApi from '../api/authApi';
import { errorMessage } from '@/services/apiClient';

export const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
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

  const handleChange = (event) => {
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
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Tài khoản hoặc email không được để trống';
    }
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
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

      const loginData = response?.data || response;
      if (loginData?.accessToken && loginData?.user) {
        // Lưu token và thông tin người dùng vào AuthContext & Storage
        login(loginData, formData.rememberMe);

        // Chuyển hướng theo role hoặc trang đích ban đầu
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (error) {
      const fieldErrors = error?.response?.data?.data;
      if (fieldErrors && typeof fieldErrors === 'object') {
        setErrors(fieldErrors);
      } else {
        setErrors({
          general: errorMessage(error),
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
      const redirectUrl = res?.authorizationUrl || res?.authUrl || res?.data?.authorizationUrl;

      if (redirectUrl) {
        sessionStorage.setItem(
          'googleLoginReturnTo',
          location.state?.from?.pathname || '/'
        );
        sessionStorage.setItem('googleLoginRememberMe', String(formData.rememberMe));
        window.location.href = redirectUrl;
      } else {
        throw new Error('Không nhận được đường dẫn xác thực Google từ máy chủ.');
      }
    } catch (error) {
      setErrors({
        general: errorMessage(error) || 'Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.',
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
