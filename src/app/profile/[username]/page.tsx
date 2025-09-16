

'use client';

import { UserProfile } from '@/components/user-profile';
import { ClientHeader } from '@/components/client-header';
import { useState, useEffect, use } from 'react';
import type { Category } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const { username } = params;
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });
    return () => unsubscribe();
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
        username={username} 
        onSelectCategory={handleSelectCategory}
        categories={categories}
      />
      <main>
        <UserProfile username={username} />
      </main>
    </div>
  );
}
