import { useEffect, useCallback } from 'react';
import { useAuthState } from '../state/auth.context';
import { authApi, type LoginDto } from '../api/auth.api';
import { useToast } from '../../../shared/ui/Toast/ToastContext';

export const useAuth = () => {
  const { user, token, isLoading, setUser, setToken, setIsLoading } = useAuthState();
  const toast = useToast();

  // Validate session against backend on initial mount if token exists
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (isMounted) {
          setUser(response.user);
        }
      } catch (error) {
        console.warn('Session verification failed:', error);
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token, setUser, setToken, setIsLoading]);

  const login = useCallback(
    async (credentials: LoginDto) => {
      setIsLoading(true);
      try {
        const response = await authApi.login(credentials);
        setToken(response.token);
        setUser(response.user);
        toast.success(`Welcome back, ${response.user.profile.name || response.user.email}!`);
        return response.user;
      } catch (err: any) {
        const message = err.message || 'Login failed. Please check your credentials.';
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setUser, setToken, setIsLoading, toast]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    toast.info('Logged out successfully');
  }, [setUser, setToken, toast]);

  const changePassword = useCallback(
    async (dto: import('../api/auth.api').ChangePasswordDto) => {
      try {
        const res = await authApi.changePassword(dto);
        if (user) {
          const updatedUser = { ...user, mustChangePassword: false };
          setUser(updatedUser);
        }
        toast.success(res.message || 'Password changed successfully');
        return res;
      } catch (err: any) {
        toast.error(err.message || 'Failed to update password');
        throw err;
      }
    },
    [user, setUser, toast]
  );

  return {
    user,
    role: user?.role,
    mustChangePassword: !!user?.mustChangePassword,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    changePassword,
  };
};
