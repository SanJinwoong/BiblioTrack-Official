

'use client';

import { UserProfile } from '@/components/user-profile';
import { ClientHeader } from '@/components/client-header';
import { useState, useEffect, use } from 'react';
import type { Category } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const { username } = use(params);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });
    return () => unsubscribe();
  }, []);

  const handleSelectCategory = (category: string | null) => {
    // On profile page, selecting a category should likely navigate to the main dashboard
    // and apply the filter there. We'll store it and redirect.
    if (category) {
      localStorage.setItem('selectedCategory', category);
    } else {
      localStorage.removeItem('selectedCategory');
    }
    router.push('/dashboard');
  };
  
  return (
    <div className="bg-background min-h-screen">
      <ClientHeader 
        username={username} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        categories={categories}
        onSelectCategory={handleSelectCategory}
      />
      <main>
        <UserProfile username={username} />
      </main>
    </div>
  );
}
