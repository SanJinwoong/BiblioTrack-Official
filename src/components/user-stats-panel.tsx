"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { getBookCoverUrl } from '@/lib/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { 
  BookOpen, 
  Users, 
  Star, 
  Clock, 
  Award, 
  TrendingUp,
  Calendar,
  Heart,
  Eye,
  Target
} from 'lucide-react';
import { User, Checkout, Review, Book } from '@/lib/types';
import { BookCard } from './book-card';
import { getReviewsByUserId, getUserByUsername, getBooks } from '@/lib/supabase-functions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface UserStatsPanelProps {
  user: User;
  checkouts: Checkout[];
  checkoutRequests: Checkout[];
}

interface UserStats {
  booksRead: number;
  currentLoans: number;
  pendingRequests: number;
  totalReviews: number;
  averageRating: number;
  followersCount: number;
  followingCount: number;
  joinDate: string;
}

interface BookWithDetails extends Book {
  dueDate?: string;
  status?: 'pending' | 'approved' | 'returned';
}

export function UserStatsPanel({ user, checkouts, checkoutRequests }: UserStatsPanelProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<UserStats>({
    booksRead: 0,
    currentLoans: 0,
    pendingRequests: 0,
    totalReviews: 0,
    averageRating: 0,
    followersCount: 0,
    followingCount: 0,
    joinDate: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [userReviews, booksData] = await Promise.all([
          getReviewsByUserId(user.id),
          getBooks()
        ]);

        setReviews(userReviews);
        setAllBooks(booksData);

        // Calculate stats
        const userCheckouts = checkouts.filter(c => c.userId === user.id);
        const userRequests = checkoutRequests.filter(r => r.userId === user.id);
        
        const currentLoans = userCheckouts.filter(c => c.status === 'approved').length;
        const booksRead = userCheckouts.filter(c => c.status === 'returned').length;
        const pendingRequests = userRequests.filter(r => r.status === 'pending').length;
        
        const averageRating = userReviews.length > 0 
          ? userReviews.reduce((sum, review) => sum + review.rating, 0) / userReviews.length 
          : 0;

        setStats({
          booksRead,
          currentLoans,
          pendingRequests,
          totalReviews: userReviews.length,
          averageRating,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0,
          joinDate: user.createdAt || ''
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user.id, checkouts, checkoutRequests]);

  const getBookDetails = (bookId: string): Book | undefined => {
    return allBooks.find(book => book.id === bookId);
  };

  const getCurrentLoans = (): BookWithDetails[] => {
    return checkouts
      .filter(c => c.userId === user.id && c.status === 'approved')
      .map(checkout => ({
        ...getBookDetails(checkout.bookId)!,
        dueDate: checkout.dueDate,
        status: checkout.status
      }))
      .filter(book => book.id); // Filter out undefined books
  };

  const getPendingRequests = (): BookWithDetails[] => {
    return checkoutRequests
      .filter(r => r.userId === user.id && r.status === 'pending')
      .map(request => ({
        ...getBookDetails(request.bookId)!,
        dueDate: request.dueDate,
        status: request.status
      }))
      .filter(book => book.id); // Filter out undefined books
  };

  const getReadingGoalProgress = () => {
    const yearlyGoal = 12; // Books per year
    const progress = (stats.booksRead / yearlyGoal) * 100;
    return Math.min(progress, 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Mi Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                {user.name?.charAt(0) || user.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{user.name || user.username}</h3>
              <p className="text-muted-foreground">@{user.username}</p>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{user.bio}</p>
              )}
            </div>
            <div className="text-right">
              <Link href={`/profile/${user.username}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil
                </Button>
              </Link>
            </div>
          </div>

          <Separator />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-700">{stats.booksRead}</div>
              <div className="text-xs text-green-600">Libros Leídos</div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-700">{stats.currentLoans}</div>
              <div className="text-xs text-blue-600">Préstamos Activos</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Star className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-700">{stats.totalReviews}</div>
              <div className="text-xs text-purple-600">Reseñas</div>
            </div>
            
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <Users className="h-6 w-6 text-pink-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-pink-700">{stats.followersCount}</div>
              <div className="text-xs text-pink-600">Seguidores</div>
            </div>
          </div>

          {/* Reading Goal Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium">Meta de Lectura 2024</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {stats.booksRead}/12 libros
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getReadingGoalProgress()}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {getReadingGoalProgress() >= 100 
                ? "¡Felicidades! Has alcanzado tu meta de lectura 🎉" 
                : `Te faltan ${12 - stats.booksRead} libros para alcanzar tu meta`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Activity Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Mi Actividad de Lectura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">
                Actuales ({stats.currentLoans})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pendientes ({stats.pendingRequests})
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Reseñas ({stats.totalReviews})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {getCurrentLoans().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes préstamos activos</p>
                  <p className="text-sm">¡Explora nuestro catálogo y pide un libro!</p>
                </div>
              ) : (
                <div className="flex flex-wrap -ml-4">
                  {getCurrentLoans().map((book) => {
                    const isOverdue: boolean = !!(book.dueDate && new Date(book.dueDate) < new Date());
                    return (
                      <div
                        key={book.id}
                        className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 mb-6"
                      >
                        <BookCard
                          book={book}
                          isLoan={true}
                          isOverdue={isOverdue}
                          isApproved={!isOverdue}
                          emphasizeAuthor
                          className="h-full"
                        >
                          <div className="absolute top-2 left-2">
                            {isOverdue ? (
                              <Badge className="bg-yellow-100 text-yellow-800">Vencido</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Prestado</Badge>
                            )}
                          </div>
                          {/* Fecha removida para no sobreponer el autor */}
                        </BookCard>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {getPendingRequests().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No tienes solicitudes pendientes</p>
                </div>
              ) : (
                <div className="flex flex-wrap -ml-4">
                  {getPendingRequests().map((book) => (
                    <div
                      key={book.id}
                      className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 mb-6"
                    >
                      <BookCard
                        book={book}
                        isPending={true}
                        emphasizeAuthor
                        className="h-full"
                      >
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-blue-100 text-blue-800 animate-pulse">Pendiente</Badge>
                        </div>
                        {/* Fecha removida para no sobreponer el autor */}
                      </BookCard>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No has escrito reseñas aún</p>
                  <p className="text-sm">¡Comparte tu opinión sobre los libros que has leído!</p>
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {reviews.slice(0, 10).map((review) => {
                      const book = getBookDetails(review.bookId);
                      return (
                        <div key={review.id} className="p-3 border rounded-lg space-y-2">
                          {book && (
                            <div className="flex items-center space-x-3">
                              <img
                                src={getBookCoverUrl(book)}
                                alt={book.title}
                                className="w-8 h-10 object-cover rounded"
                              />
                              <div>
                                <h5 className="font-medium text-sm">{book.title}</h5>
                                <p className="text-xs text-muted-foreground">{book.author}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              {format(new Date(review.date), "d 'de' MMM", { locale: es })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}