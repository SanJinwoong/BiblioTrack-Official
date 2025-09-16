
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientDashboard } from '@/components/client-dashboard';
import { LibrarianDashboard } from '@/components/librarian-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      router.push('/');
    } else {
      setRole(userRole);
    }
  }, [router]);

  if (!role) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Skeleton className="h-8 w-24" />
                <div className="flex-1 flex justify-end space-x-4">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-9 rounded-full" />
                </div>
            </div>
        </header>
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-2/3" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <div>
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-56 w-full" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-56 w-full" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-56 w-full" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                     <div className="space-y-2">
                      <Skeleton className="h-56 w-full" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-56 w-full" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                     <div className="space-y-2">
                      <Skeleton className="h-56 w-full" />
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
            </div>
        </main>
    </div>
    );
  }

  if (role === 'librarian') {
    return <LibrarianDashboard />
  }

  if (role === 'client') {
    return <ClientDashboard />;
  }

  return null;
}
