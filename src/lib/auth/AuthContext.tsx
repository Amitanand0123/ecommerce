'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../trpc/client';
import type { AppRouter } from '@/server/trpc';
import { TRPCClientError } from '@trpc/client'; 

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authProviderIsLoading, setAuthProviderIsLoading] = useState(true);
  const router = useRouter();

  const {
    data: currentUserData,
    isLoading: isCurrentUserQueryLoading,
    isFetching: isCurrentUserQueryFetching,
    refetch: refetchCurrentUser
  } = trpc.auth.getCurrentUser.useQuery(undefined, {
    retry: (failureCount, error) => {
      const trpcError = error as TRPCClientError<AppRouter>;
      if (trpcError && trpcError.data?.code === 'UNAUTHORIZED') {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnMount: true,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setUser(null);
      setAuthProviderIsLoading(false);
      if (typeof window !== 'undefined' && !['/login', '/register', '/verify-email'].includes(window.location.pathname)) {
        router.push('/login');
      }
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      setUser(null);
      setAuthProviderIsLoading(false);
    }
  });

  useEffect(() => {
    if (!isCurrentUserQueryLoading && !isCurrentUserQueryFetching) {
      setAuthProviderIsLoading(false);
      if (currentUserData) {
        setUser(currentUserData as User);
      } else {
        setUser(null);
      }
    }
  }, [currentUserData, isCurrentUserQueryLoading, isCurrentUserQueryFetching]);

  const login = useCallback(async (userData: User) => {
    setUser(userData); 
    await refetchCurrentUser();
    setAuthProviderIsLoading(false);
  }, [refetchCurrentUser]);

  const logout = useCallback(async () => {
    setAuthProviderIsLoading(true);
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const refetchUser = useCallback(() => {
    refetchCurrentUser();
  }, [refetchCurrentUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading: authProviderIsLoading, login, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}