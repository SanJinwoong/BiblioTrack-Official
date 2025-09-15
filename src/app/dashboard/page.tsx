
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientDashboard } from '@/components/client-dashboard';
import { LibrarianDashboard } from '@/components/librarian-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardHeader } from '@/components/dashboard-header';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      router.push('/');
    } else {
      setRole(userRole);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Skeleton className="h-8 w-24" />
                <div className="flex-1 flex justify-end">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        </header>
        <main className="flex-1 container mx-auto p-4 md:p-8">
            <div className="space-y-8">
                <Skeleton className="h-64 w-full" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="flex space-x-4">
                        <Skeleton className="h-56 w-40" />
                        <Skeleton className="h-56 w-40" />
                        <Skeleton className="h-56 w-40" />
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
