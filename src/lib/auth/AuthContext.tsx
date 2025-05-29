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
  isLoading: boolean;
  login: (token: string, user: User) => void; // User type here
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Remove or underscore currentUserError
  // const { data: currentUser, error: currentUserError } = trpc.auth.getCurrentUser.useQuery(undefined, {
  const { data: currentUser } = trpc.auth.getCurrentUser.useQuery(undefined, { // Corrected line
    retry: false,
    onSettled: () => {
      setIsLoading(false);
    },
    // If an error occurs in getCurrentUser, `currentUser` will be undefined.
    // The useEffect below will handle setting `user` to `null`.
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser as User); 
    } else {
      setUser(null); 
    }
  }, [currentUser]);

  const login = (token: string, userData: User) => { 
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    if (typeof window !== 'undefined' && !['/login', '/register'].includes(window.location.pathname)) {
        router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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