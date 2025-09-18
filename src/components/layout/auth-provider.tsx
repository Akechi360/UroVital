'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const PROTECTED_ROUTES = ['/dashboard', '/patients', '/settings'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

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

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

    if (!isAuthenticated && isProtectedRoute) {
      router.push('/login');
    } else if (isAuthenticated && isAuthRoute) {
      router.push('/dashboard');
    } else {
        setIsAuthenticating(false);
    }
  }, [pathname, router]);

  if (isAuthenticating) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
