
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { User, Book, Checkout as CheckoutType } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { UserPlus, Mail, Edit, Check } from 'lucide-react';
import { BookCard } from './book-card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { EditProfileDialog } from './edit-profile-dialog';
import { BookDetailsDialog } from './book-details-dialog';
import { Recommendations } from './recommendations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


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

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedBookCheckout, setSelectedBookCheckout] = useState<CheckoutType | null>(null);

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

  const handleOpenBookDialog = (book: Book) => {
    // This profile is public, so we don't have checkout context here.
    // We could fetch it if needed, but for now, it's just a view.
    setSelectedBook(book);
    setSelectedBookCheckout(null);
  };

  const handleCloseBookDialog = () => {
    setSelectedBook(null);
    setSelectedBookCheckout(null);
  };
  
  if (loading) {
    return (
        <div className="w-full">
            {/* Banner Skeleton */}
            <Skeleton className="h-48 md:h-64 w-full" />
            <div className="container mx-auto px-4 md:px-8">
                {/* Profile Header Skeleton */}
                <div className="relative">
                    <div className="absolute -top-16 md:-top-20">
                        <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background" />
                    </div>
                </div>
                 <div className="h-16 flex justify-end items-center">
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="mt-2 space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-full max-w-lg mt-4" />
                    <Skeleton className="h-5 w-40 mt-4" />
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
        </div>
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
       <BookDetailsDialog
        book={selectedBook}
        checkout={selectedBookCheckout}
        open={!!selectedBook}
        onOpenChange={(isOpen) => !isOpen && handleCloseBookDialog()}
        onSuccessfulCheckout={() => {}}
        onReturnBook={() => {}}
        onDeactivateUser={() => {}}
        username={currentUser?.username || ''}
        role={currentUser?.role || 'client'}
       />

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
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 {/* Profile Header */}
                <div className="relative">
                    <div className="absolute -top-16 md:-top-20">
                        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background bg-background shrink-0">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-4xl">{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                     {isOwnProfile ? (
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
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
                
                {/* Profile Info */}
                <div className="mt-4 space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                    <p className="text-foreground max-w-2xl">{user.bio || 'Este usuario aún no ha añadido una biografía.'}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <Link href="#" className="hover:underline">
                            <span className="font-bold text-foreground">{friends?.length || 0}</span> Amigos
                        </Link>
                    </div>
                </div>

                <div className="mt-8">
                    <Tabs defaultValue="favorites">
                        <TabsList>
                            <TabsTrigger value="favorites">Libros Favoritos</TabsTrigger>
                        </TabsList>
                        <TabsContent value="favorites" className="mt-4">
                             {favoriteBooks && favoriteBooks.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {favoriteBooks.map(book => (
                                    <BookCard key={book.id} book={book} onClick={() => handleOpenBookDialog(book)} />
                                    ))}
                                </div>
                                ) : (
                                <p className="text-muted-foreground py-8 text-center">Aún no se han añadido libros favoritos.</p>
                                )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6 pt-8">
                <Recommendations onBookSelect={handleOpenBookDialog} displayStyle="compact" />
            </div>
        </div>
        
      </div>
    </>
  );
}

