
import { UserProfile } from '@/components/user-profile';
import { ClientHeader } from '@/components/client-header';

export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <div className="bg-background min-h-screen">
      <ClientHeader username={params.username} searchTerm="" setSearchTerm={() => {}} />
      <main className="container mx-auto p-4 md:p-8">
        <UserProfile username={params.username} />
      </main>
    </div>
  );
}
