'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import { Navbar } from '../navbar';
import { User } from '@/types/schema/user';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { findUserById } from '@/app/(auth)/auth/components/server';

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function UserGuard({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        setLoading(status === 'loading');
        return;
      }
      
      try {
        const userData = await findUserById(session.user.id as number);
        setUser(userData as User);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [status, session?.user?.id]);
  
  if (loading) return <LoadingOverlay />;
  
  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    redirect('/login');
  }
  
  // Allowed roles
  const allowedRoles = ['Member', 'Platinum'];
  
  // Redirect if user role is not allowed
  if (user && !allowedRoles.includes(user.role as string)) {
    redirect('/');
  }
  
  return (
    <>
      <Navbar user={user as User} />
      {children}
    </>
  );
}