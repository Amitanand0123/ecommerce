// src/lib/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../trpc/client';

// This interface should exactly match the UserOutputSchema from the backend
interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean; // Reflects the auth check process of this provider
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // This isLoading state is for the AuthProvider's own initialization/auth check phase
  const [authProviderIsLoading, setAuthProviderIsLoading] = useState(true);
  const router = useRouter();

  const { 
    data: currentUserData, // Renamed to avoid conflict with a potential 'currentUser' variable
    isLoading: isCurrentUserQueryLoading, // Query is loading for the first time
    isFetching: isCurrentUserQueryFetching, // Query is fetching (initial or subsequent)
  } = trpc.auth.getCurrentUser.useQuery(undefined, {
    retry: false, // Don't retry on auth errors during initial load
    // `staleTime` and `cacheTime` can be configured here if needed
  });

  useEffect(() => {
    // Determine if the auth state is settled (query has finished its initial fetch attempt)
    if (!isCurrentUserQueryLoading && !isCurrentUserQueryFetching) {
      setAuthProviderIsLoading(false);
      
      if (currentUserData) {
        setUser(currentUserData as User); // Cast is okay if UserOutputSchema matches client User
      } else {
        // If data is null/undefined and query is no longer loading/fetching, means no user or error
        setUser(null);
      }
    }
  }, [currentUserData, isCurrentUserQueryLoading, isCurrentUserQueryFetching]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setAuthProviderIsLoading(false); // After login, auth state is known
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setAuthProviderIsLoading(false); // After logout, auth state is known (not logged in)
    // Redirect if not on public auth pages
    if (typeof window !== 'undefined' && !['/login', '/register', '/verify-email'].includes(window.location.pathname)) {
        router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: authProviderIsLoading, login, logout }}>
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