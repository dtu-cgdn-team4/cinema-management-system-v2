import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../services/apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Khởi tạo state từ storage
    const savedToken =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    const savedUser =
      localStorage.getItem('currentUser') ||
      sessionStorage.getItem('currentUser');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Lỗi phân tích dữ liệu user đã lưu:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const handleLogin = (loginData, rememberMe = true) => {
    const { accessToken, user: userInfo } = loginData;
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    otherStorage.removeItem('accessToken');
    otherStorage.removeItem('currentUser');

    storage.setItem('accessToken', accessToken);
    storage.setItem('currentUser', JSON.stringify(userInfo));

    setToken(accessToken);
    setUser(userInfo);
  };

  const handleLogout = () => {
    apiClient.post('/auth/logout').catch(() => {});
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('currentUser');

    setToken(null);
    setUser(null);
  };

  const handleUpdateUser = (newUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...newUserData };
      // Ghi vào đúng nơi đã lưu phiên để vẫn giữ lựa chọn "Ghi nhớ đăng nhập".
      const storage = localStorage.getItem('currentUser') ? localStorage : sessionStorage;
      storage.setItem('currentUser', JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    updateUser: handleUpdateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
