import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import type { LoginPayload, UserInfo } from '@/types/auth';

export interface AuthContextValue {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: LoginPayload, rememberMe?: boolean) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
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
        setUser(JSON.parse(savedUser) as UserInfo);
      } catch (error: unknown) {
        console.error('Lỗi phân tích dữ liệu user đã lưu:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (loginData: LoginPayload, rememberMe = true) => {
    const { accessToken, user: userInfo } = loginData;
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem('accessToken', accessToken);
    storage.setItem('currentUser', JSON.stringify(userInfo));

    setToken(accessToken);
    setUser(userInfo);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('currentUser');

    setToken(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login: handleLogin,
    logout: handleLogout,
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

