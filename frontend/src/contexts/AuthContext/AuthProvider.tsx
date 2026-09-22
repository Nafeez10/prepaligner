import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { StorageKeys } from '@/enum/StorageKeys';
import { AuthAPI, UserResponse } from '@/api/routes/AuthAPI';

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem(StorageKeys.TOKEN);
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await AuthAPI.me();
      setUser(userData);
    } catch (error) {
      console.error('Failed to authenticate:', error);
      localStorage.removeItem(StorageKeys.TOKEN);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };
    
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = (token: string, userData: UserResponse) => {
    localStorage.setItem(StorageKeys.TOKEN, token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(StorageKeys.TOKEN);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
