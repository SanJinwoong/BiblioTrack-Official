

'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { User, Book, Checkout as CheckoutType, Review } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { UserPlus, UserCheck, Calendar, Edit } from 'lucide-react';
import { BookCard } from './book-card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { EditProfileDialog } from './edit-profile-dialog';
import { BookDetailsDialog } from './book-details-dialog';
import { Recommendations } from './recommendations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReviewCard } from './review-card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface UserProfileProps {
  username: string;
}

export function UserProfile({ username }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
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
    
    const reviewsUnsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review)));
    });

    return () => {
      usersUnsubscribe();
      booksUnsubscribe();
      reviewsUnsubscribe();
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
  
  const handleFollowToggle = async () => {
    if (!currentUser || !user || currentUser.id === user.id) return;
    
    const currentUserRef = doc(db, 'users', currentUser.id);
    const targetUserRef = doc(db, 'users', user.id);

    const isFollowing = currentUser.following?.includes(user.username);

    try {
        if (isFollowing) {
            // Unfollow
            await updateDoc(currentUserRef, { following: arrayRemove(user.username) });
            await updateDoc(targetUserRef, { followers: arrayRemove(currentUser.username) });
            toast({ description: `Dejaste de seguir a @${user.username}` });
        } else {
            // Follow
            await updateDoc(currentUserRef, { following: arrayUnion(user.username) });
            await updateDoc(targetUserRef, { followers: arrayUnion(currentUser.username) });
            toast({ description: `Ahora sigues a @${user.username}` });
        }
    } catch (error) {
        console.error('Error following/unfollowing user:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo completar la acción. Inténtalo de nuevo.',
        });
    }
  };

  const handleOpenBookDialog = (book: Book) => {
    setSelectedBook(book);
    // In a public profile, we might not have direct checkout context.
    // For now, let's check if the *current viewing user* has a checkout.
    const checkout = reviews.find(c => c.bookId === book.id && c.userId === currentUser?.username);
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
                <div className="relative -mt-16 md:-mt-20">
                    <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background" />
                </div>
                 <div className="h-16 flex justify-end items-center">
                    <Skeleton className="h-10 w-32" />
                </div>

                <div className="mt-2 space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-full max-w-lg mt-4" />
                    <div className="flex gap-4 pt-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-5 w-40" />
                    </div>
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
    
  const userReviews = reviews
    .filter(review => review.userId === user.username)
    .map(review => {
        const book = books.find(b => b.id === review.bookId);
        return book ? { ...review, book, user } : null;
    })
    .filter((r): r is Review & { book: Book, user: User } => !!r)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


  const isOwnProfile = currentUser?.username === user.username;
  const isFollowing = currentUser?.following?.includes(user.username);

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
       
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {/* Banner */}
                <div className="h-48 md:h-56 w-full bg-muted rounded-t-lg overflow-hidden">
                    {user.bannerUrl ? (
                    <Image
                        src={user.bannerUrl}
                        alt={`${user.name}'s banner`}
                        width={1200}
                        height={300}
                        className="object-cover w-full h-full"
                        data-ai-hint="abstract background"
                    />
                    ) : (
                    <div className="h-full w-full bg-gradient-to-r from-gray-200 to-gray-300"></div>
                    )}
                </div>

                {/* Profile Header */}
                 <div className="p-4 bg-card rounded-b-lg">
                    <div className="relative flex justify-between items-start -mt-20 md:-mt-24">
                        <div className="p-1 bg-card rounded-full">
                            <Avatar className="h-32 w-32 md:h-36 md:w-36 border-4 border-card">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback className="text-5xl">{user.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="pt-24">
                            {isOwnProfile ? (
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar Perfil
                                </Button>
                            ) : isFollowing ? (
                                <Button variant="secondary" onClick={handleFollowToggle}>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Siguiendo
                                </Button>
                            ) : (
                                <Button onClick={handleFollowToggle}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Seguir
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <p className="text-md text-muted-foreground">@{user.username}</p>
                        </div>
                        
                        <p className="text-foreground max-w-2xl">{user.bio || 'Este usuario aún no ha añadido una biografía.'}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            {user.createdAt && (
                                <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Se unió en {format(new Date(user.createdAt), "MMMM 'de' yyyy", { locale: es })}</span>
                                </div>
                            )}
                            <Link href="#" className="hover:underline">
                                <span className="font-bold text-foreground">{user.following?.length || 0}</span> Siguiendo
                            </Link>
                            <Link href="#" className="hover:underline">
                                <span className="font-bold text-foreground">{user.followers?.length || 0}</span> Seguidores
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <Tabs defaultValue="favorites" className="w-full">
                        <TabsList>
                            <TabsTrigger value="favorites">Libros Favoritos</TabsTrigger>
                            <TabsTrigger value="reviews">Reseñas ({userReviews.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="favorites" className="mt-4">
                            {favoriteBooks && favoriteBooks.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                                    {favoriteBooks.map(book => (
                                    <BookCard key={book.id} book={book} onClick={() => handleOpenBookDialog(book)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg">
                                    <p>Aún no se han añadido libros favoritos.</p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="reviews" className="mt-4 space-y-4">
                            {userReviews.length > 0 ? (
                                <>
                                {userReviews.map(review => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                                </>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg">
                                    <p>Este usuario aún no ha dejado ninguna reseña.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
            <div className="lg:col-span-1 space-y-8 pt-8">
                <Recommendations onBookSelect={handleOpenBookDialog} displayStyle="compact" />

                <Card>
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {userReviews.length > 0 ? (
                        <>
                            {userReviews.slice(0, 3).map(review => (
                                <ReviewCard key={`activity-${review.id}`} review={review} />
                            ))}
                        </>
                        ) : (
                        <div className="text-center text-sm text-muted-foreground py-8">
                                <p>Este usuario aún no ha dejado ninguna reseña.</p>
                        </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </>
  );
}
