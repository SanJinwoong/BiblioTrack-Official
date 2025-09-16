
'use client';

import { UserProfile } from '@/components/user-profile';
import { ClientHeader } from '@/components/client-header';
import { useState } from 'react';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { username } = params;
  
  return (
    <div className="bg-background min-h-screen">
      <ClientHeader username={username} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main className="container mx-auto p-4 md:p-8">
        <UserProfile username={username} />
      </main>
    </div>
  );
}
