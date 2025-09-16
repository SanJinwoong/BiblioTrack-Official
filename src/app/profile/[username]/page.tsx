
'use client';

import { UserProfile } from '@/components/user-profile';
import { ClientHeader } from '@/components/client-header';
import { useState, use } from 'react';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { username } = use(params);
  
  return (
    <div className="bg-background min-h-screen">
      <ClientHeader username={username} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <UserProfile username={username} />
    </div>
  );
}
