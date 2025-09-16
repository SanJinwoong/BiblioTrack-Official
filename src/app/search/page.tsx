
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import type { Book, User, Category } from '@/lib/types';
import { ClientHeader } from '@/components/client-header';
import { BookCard } from '@/components/book-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookDetailsDialog } from '@/components/book-details-dialog';
import Link from 'next/link';
import { User as UserIcon } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const categoryQuery = searchParams.get('category') || '';

  const [username, setUsername] = useState('');
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);

    const unsubscribes = [
      onSnapshot(collection(db, 'books'), snapshot => {
        setAllBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
        setLoading(false);
      }),
      onSnapshot(collection(db, 'users'), snapshot => {
        setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        setLoading(false);
      }),
       onSnapshot(collection(db, 'categories'), snapshot => {
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      }),
    ];

    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  useEffect(() => {
    setLoading(true);
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      // Filter books
      const bookResults = allBooks.filter(book =>
        book.title.toLowerCase().includes(lowercasedQuery) ||
        book.author.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredBooks(bookResults);

      // Filter users
      const userResults = allUsers.filter(user =>
        (user.name?.toLowerCase().includes(lowercasedQuery) ||
        user.username.toLowerCase().includes(lowercasedQuery)) &&
        user.role === 'client'
      );
      setFilteredUsers(userResults);
    } else if (categoryQuery) {
        const bookResults = allBooks.filter(book => book.category === categoryQuery);
        setFilteredBooks(bookResults);
        setFilteredUsers([]);
    } else {
        setFilteredBooks([]);
        setFilteredUsers([]);
    }
    setLoading(false);
  }, [query, categoryQuery, allBooks, allUsers]);

  const handleCategorySelect = (categoryName: string | null) => {
    if (categoryName) {
      router.push(`/search?category=${encodeURIComponent(categoryName)}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleOpenBookDialog = (book: Book) => {
    setSelectedBook(book);
  };
  
  const handleCloseBookDialog = () => {
    setSelectedBook(null);
  };

  const SearchSkeleton = () => (
    <div className="space-y-8">
        <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
            </div>
        </div>
         <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
        </div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      <ClientHeader
        username={username}
        onSelectCategory={handleCategorySelect}
        categories={categories}
      />
       <BookDetailsDialog
        book={selectedBook}
        open={!!selectedBook}
        onOpenChange={handleCloseBookDialog}
        onSuccessfulCheckout={() => {}}
        onReturnBook={() => {}}
        onDeactivateUser={() => {}}
        username={username}
        role="client"
      />
      <main className="container mx-auto p-4 md:p-8 lg:p-12 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">
            Resultados de Búsqueda
          </h1>
          <p className="text-muted-foreground">
            {query ? `Mostrando resultados para "${query}"` : categoryQuery ? `Explorando la categoría "${categoryQuery}"` : ''}
          </p>
        </header>

        {loading ? (
            <SearchSkeleton />
        ) : (
          <div className="space-y-12">
            {/* Books Section */}
            {query || categoryQuery ? (
                <section id="book-results">
                    <h2 className="text-2xl font-semibold mb-4">Libros ({filteredBooks.length})</h2>
                    {filteredBooks.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredBooks.map((book) => (
                            <BookCard key={book.id} book={book} onClick={() => handleOpenBookDialog(book)} />
                        ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8 bg-muted/50 rounded-lg">
                        No se encontraron libros que coincidan con tu búsqueda.
                        </p>
                    )}
                </section>
            ) : null}

            {/* Users Section - only shows when there is a general query */}
            {query && (
                <section id="user-results">
                <h2 className="text-2xl font-semibold mb-4">Usuarios ({filteredUsers.length})</h2>
                {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                        <Link key={user.id} href={`/profile/${user.username}`}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className="h-14 w-14">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback><UserIcon className="h-6 w-6" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                                </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8 bg-muted/50 rounded-lg">
                    No se encontraron usuarios que coincidan con tu búsqueda.
                    </p>
                )}
                </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <SearchResults />
        </Suspense>
    )
}
