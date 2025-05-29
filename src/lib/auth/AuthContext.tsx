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

  // The data from getCurrentUser should now also conform to User or null
  const { data: currentUser, error: currentUserError } = trpc.auth.getCurrentUser.useQuery(undefined, {
    retry: false,
    onSettled: () => {
      setIsLoading(false);
    },
    // No explicit onError needed here if onSettled handles isLoading
    // and useEffect below handles setting user to null if currentUser is null/undefined
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser as User); // Cast is safe if backend UserOutputSchema matches User interface
    } else {
      setUser(null); // If currentUser is null or undefined (e.g., due to error or no session)
    }
  }, [currentUser]);

  const login = (token: string, userData: User) => { // Parameter name changed for clarity
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Redirect only if not already on a public page to avoid loops
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