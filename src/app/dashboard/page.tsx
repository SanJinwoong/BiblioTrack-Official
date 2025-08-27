'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientDashboard } from '@/components/client-dashboard';
import { LibrarianDashboard } from '@/components/librarian-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/4" />
        <div className="flex space-x-4">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (role === 'librarian') {
    return <LibrarianDashboard />;
  }

  if (role === 'client') {
    return <ClientDashboard />;
  }

  return null;
}
