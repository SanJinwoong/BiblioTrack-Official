

'use client';

import { UserProfile } from '@/components/user-profile';
import { ClientHeader } from '@/components/client-header';
import { useState, useEffect, use } from 'react';
import type { Category } from '@/lib/types';
import { getCategories } from '@/lib/supabase-functions';
import { useRouter } from 'next/navigation';

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const resolvedParams = use(params);
  const { username } = resolvedParams;
  const router = useRouter();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
  }, []);

  const handleSelectCategory = (category: string | null) => {
    if (category) {
      router.push(`/search?category=${encodeURIComponent(category)}`);
    } else {
      router.push('/dashboard');
    }
  };
  
  return (
    <div className="bg-background min-h-screen">
      <ClientHeader 
        onSelectCategory={handleSelectCategory}
        categories={categories}
      />
      <main>
        <UserProfile username={username} />
      </main>
    </div>
  );
}
