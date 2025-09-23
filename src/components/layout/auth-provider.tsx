
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/types';

const PROTECTED_ROUTES = ['/dashboard', '/patients', '/settings', '/appointments', '/companies', '/administrativo'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

type AuthContextType = {
    currentUser: User | null;
    isAuthenticated: boolean;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthScreen() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
             <div className="w-full max-w-md space-y-8">
                <div className="space-y-2 text-center">
                    <Skeleton className="mx-auto h-16 w-16 rounded-full" />
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-full mt-6" />
                </div>
             </div>
        </div>
    )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    try {
        const userJson = localStorage.getItem('user');
        const user = userJson ? JSON.parse(userJson) : null;
        setCurrentUser(user);

        const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
        const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

        if (!user && isProtectedRoute) {
            router.push('/login');
        } else if (user && isAuthRoute) {
            router.push('/dashboard');
        } else {
            setIsAuthenticating(false);
        }
    } catch (error) {
        // Corrupted user data in localStorage
        localStorage.removeItem('user');
        setCurrentUser(null);
        setIsAuthenticating(false);
         if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
            router.push('/login');
        }
    }
  }, [pathname, router]);

  const authContextValue = useMemo(() => ({
    currentUser,
    isAuthenticated: !!currentUser,
    loading: isAuthenticating,
  }), [currentUser, isAuthenticating]);

  if (isAuthenticating) {
    return <AuthScreen />;
  }

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
