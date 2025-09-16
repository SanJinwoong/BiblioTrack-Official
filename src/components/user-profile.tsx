
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { User, Book } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { UserPlus, Mail, Edit, Check } from 'lucide-react';
import { BookCard } from './book-card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { EditProfileDialog } from './edit-profile-dialog';

interface UserProfileProps {
  username: string;
}

export function UserProfile({ username }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedUsername = localStorage.getItem('userUsername');
    
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setAllUsers(usersData);

      const profileUser = usersData.find(u => u.username === username);
      setUser(profileUser || null);

      if (storedUsername) {
        const currentUserData = usersData.find(u => u.username === storedUsername);
        setCurrentUser(currentUserData || null);
      }
      
      setLoading(false);
    });

    const booksUnsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
    });

    return () => {
      usersUnsubscribe();
      booksUnsubscribe();
    };
  }, [username]);

  const handleProfileUpdate = async (data: Partial<User> & { newAvatarUrl?: string, newBannerUrl?: string }) => {
    if (!user) return;

    const { newAvatarUrl, newBannerUrl, ...userData } = data;
    const updateData: Partial<User> = { ...userData };

    if (newAvatarUrl) {
      updateData.avatarUrl = newAvatarUrl;
    }
    if (newBannerUrl) {
      updateData.bannerUrl = newBannerUrl;
    }

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, updateData);
      toast({
        title: '✅ Perfil Actualizado',
        description: 'Tus cambios se han guardado correctamente.',
      });
    } catch (error) {
      console.error('Error updating profile: ', error);
      toast({
        variant: 'destructive',
        title: 'Error al actualizar',
        description: 'No se pudieron guardar los cambios. Inténtalo de nuevo.',
      });
    }
  };
  
  if (loading) {
    return (
      <>
        {/* Banner Skeleton */}
        <Skeleton className="h-48 md:h-64 w-full rounded-b-lg" />
        <div className="container mx-auto px-4 md:px-8">
            {/* Profile Header Skeleton */}
            <div className="flex items-end -mt-20 md:-mt-24 space-x-6">
                <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background" />
                <div className="pb-4">
                    <Skeleton className="h-10 w-48 mb-2" />
                    <Skeleton className="h-6 w-32" />
                </div>
            </div>
            {/* Bio Skeleton */}
            <div className="mt-8 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-full max-w-lg" />
            </div>
             {/* Content Skeleton */}
            <div className="mt-12">
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-56 w-full" />
                </div>
            </div>
        </div>
      </>
    );
  }

  if (!user) {
    return <div className="text-center py-16">Usuario no encontrado.</div>;
  }
  
  const favoriteBooks = user.favoriteBooks
    ?.map(title => books.find(b => b.title === title))
    .filter((b): b is Book => !!b);
    
  const friends = user.friends
    ?.map(friendUsername => allUsers.find(u => u.username === friendUsername))
    .filter((u): u is User => !!u);
    
  const isOwnProfile = currentUser?.username === user.username;
  const isFriend = currentUser?.friends?.includes(user.username);

  return (
    <>
      {isOwnProfile && (
        <EditProfileDialog
          user={user}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
      {/* Banner */}
      <div className="relative h-48 md:h-64 w-full bg-muted">
        {user.bannerUrl ? (
          <Image
            src={user.bannerUrl}
            alt={`${user.name}'s banner`}
            fill
            className="object-cover"
            data-ai-hint="abstract background"
          />
        ) : (
            <div className="h-full w-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      
      <main className="container mx-auto p-4 md:p-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-end -mt-20 md:-mt-24 space-y-4 md:space-y-0 md:space-x-6 relative">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background bg-background shrink-0">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-end w-full pb-4">
                <div className="text-white md:text-foreground text-shadow-lg md:text-shadow-none">
                    <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
                    <p className="text-sm text-white/90 md:text-muted-foreground">@{user.username}</p>
                </div>
                <div className="mt-4 md:mt-0">
                    {isOwnProfile ? (
                        <Button variant="outline" className="bg-white/90" onClick={() => setIsEditDialogOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar Perfil
                        </Button>
                    ) : isFriend ? (
                        <Button variant="secondary" disabled>
                            <Check className="mr-2 h-4 w-4" />
                            Amigo
                        </Button>
                    ) : (
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Añadir Amigo
                        </Button>
                    )}
                </div>
            </div>
        </div>
        
        {/* Bio */}
        <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">Biografía</h2>
                <p className="text-muted-foreground max-w-2xl">{user.bio || 'Este usuario aún no ha añadido una biografía.'}</p>
            </div>


        {/* Favorite Books */}
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Libros Favoritos</h2>
            {favoriteBooks && favoriteBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {favoriteBooks.map(book => (
                <BookCard key={book.id} book={book} />
                ))}
            </div>
            ) : (
            <p className="text-muted-foreground">Aún no se han añadido libros favoritos.</p>
            )}
        </div>
        
        {/* Friends */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-4">Amigos ({friends?.length || 0})</h2>
                {friends && friends.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                    {friends.map(friend => (
                    <Link key={friend.id} href={`/profile/${friend.username}`} className="flex flex-col items-center space-y-2 group">
                        <Avatar className="h-16 w-16 transition-transform duration-200 group-hover:scale-105">
                            <AvatarImage src={friend.avatarUrl} alt={friend.name} />
                            <AvatarFallback>{friend.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-primary">{friend.name}</span>
                    </Link>
                    ))}
                </div>
                ) : (
                <p className="text-muted-foreground">Este usuario aún no tiene amigos.</p>
                )}
            </div>
        </main>
    </>
  );
}

