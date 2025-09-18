

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  getUserByUsername, 
  updateUser, 
  getBooks, 
  getCheckoutsByUserId, 
  getReviewsByBookId,
  getUsers 
} from '@/lib/supabase-functions';
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
    const loadData = async () => {
      setLoading(true);
      try {
        // Load all users
        const usersData = await getUsers();
        setAllUsers(usersData);

        // Find profile user
        const profileUser = usersData.find(u => u.username === username);
        setUser(profileUser || null);

        // Find current user from localStorage
        const storedUsername = localStorage.getItem('userUsername');
        if (storedUsername) {
          const currentUserData = usersData.find(u => u.username === storedUsername);
          setCurrentUser(currentUserData || null);
        }

        // Load books
        const booksData = await getBooks();
        setBooks(booksData);

        // Load reviews for all books
        const allReviews: Review[] = [];
        for (const book of booksData) {
          const bookReviews = await getReviewsByBookId(book.id);
          allReviews.push(...bookReviews);
        }
        setReviews(allReviews);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: '❌ Error',
          description: 'Error al cargar los datos del perfil.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [username, toast]);

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
      await updateUser(user.id, updateData);
      
      // Reload data to show changes
      const updatedUser = await getUserByUsername(username);
      if (updatedUser) {
        setUser(updatedUser);
      }
      
      toast({
        title: '✅ Perfil Actualizado',
        description: 'Tus cambios se han guardado correctamente.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo actualizar el perfil.',
      });
    }
  };
  
  const handleFollowToggle = async () => {
    if (!currentUser || !user || currentUser.id === user.id) return;

    const isFollowing = currentUser.following?.includes(user.username);

    try {
      // Update current user's following list
      let newFollowing = currentUser.following || [];
      if (isFollowing) {
        newFollowing = newFollowing.filter(f => f !== user.username);
      } else {
        newFollowing = [...newFollowing, user.username];
      }

      // Update target user's followers list  
      let newFollowers = user.followers || [];
      if (isFollowing) {
        newFollowers = newFollowers.filter(f => f !== currentUser.username);
      } else {
        newFollowers = [...newFollowers, currentUser.username];
      }

      await updateUser(currentUser.id, { following: newFollowing });
      await updateUser(user.id, { followers: newFollowers });

      // Update local state
      setCurrentUser({ ...currentUser, following: newFollowing });
      setUser({ ...user, followers: newFollowers });

      toast({ 
        description: isFollowing 
          ? `Dejaste de seguir a @${user.username}` 
          : `Ahora sigues a @${user.username}` 
      });
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
    // This dialog is for viewing, so we don't need checkout data here.
    setSelectedBookCheckout(null);
  };

  const handleCloseBookDialog = () => {
    setSelectedBook(null);
    setSelectedBookCheckout(null);
  };
  
  if (loading) {
    return (
      <div className="w-full">
        {/* Placeholder for banner */}
        <Skeleton className="h-48 md:h-64 w-full" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <div className="relative -mt-16 md:-mt-20 ml-6">
                        <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background" />
                    </div>
                     <div className="p-4 pt-2 space-y-4">
                        <div className="flex justify-end">
                            <Skeleton className="h-10 w-32" />
                        </div>
                        <Skeleton className="h-10 w-48" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-full max-w-lg mt-4" />
                        <div className="flex gap-4 pt-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-40" />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-8 pt-8">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-64 w-full" />
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
       
      <div className="w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                <div className="lg:col-span-1">
                    <div className="px-4">
                        <div className="h-48 md:h-56 w-full bg-muted rounded-lg overflow-hidden">
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
                    </div>
                
                    {/* Profile Header */}
                    <div className="relative p-4 flex flex-col">
                        <div className="flex justify-between items-start">
                            <div className="relative -mt-20">
                                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background bg-background shrink-0">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback className="text-5xl">{user.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className='pt-4'>
                                {isOwnProfile ? (
                                    <Button variant="outline" onClick={() => setIsEditDialogOpen(true)} className="rounded-full">
                                        <Edit className="mr-2 h-4 w-4" /> Editar Perfil
                                    </Button>
                                ) : isFollowing ? (
                                    <Button variant="secondary" onClick={handleFollowToggle} className="rounded-full">
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Siguiendo
                                    </Button>
                                ) : (
                                    <Button onClick={handleFollowToggle} className="rounded-full">
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
                                <p className='font-light'>Puedes hacer clic en los números para explorar las conexiones.</p>
                                <Link href="#" className="hover:underline">
                                    <span className="font-bold text-foreground">{user.following?.length || 0}</span> Siguiendo
                                </Link>
                                <Link href="#" className="hover:underline">
                                    <span className="font-bold text-foreground">{user.followers?.length || 0}</span> Seguidores
                                </Link>
                                {user.createdAt && (
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Se unió en {format(new Date(user.createdAt), "MMMM 'de' yyyy", { locale: es })}</span>
                                    </div>
                                )}
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
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        </div>
      </div>
    </>
  );
}

    
