
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBooks, getUsers, getCategories } from '@/lib/supabase-functions';
import type { Book, User, Category } from '@/lib/types';
import { ClientHeader } from '@/components/client-header';
import { BookCard } from '@/components/book-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
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

    const loadData = async () => {
      setLoading(true);
      try {
        const [booksData, usersData, categoriesData] = await Promise.all([
          getBooks(),
          getUsers(),
          getCategories()
        ]);
        
        setAllBooks(booksData);
        setAllUsers(usersData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading search data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setLoading(true);
    let bookResults: Book[] = [];
    let userResults: User[] = [];

    if (query) {
      const lowercasedQuery = query.toLowerCase();
      // Filter books
      bookResults = allBooks.filter(book =>
        book.title.toLowerCase().includes(lowercasedQuery) ||
        book.author.toLowerCase().includes(lowercasedQuery)
      );

      // Filter users by name or username (matricula)
      userResults = allUsers.filter(user =>
        (user.name?.toLowerCase().includes(lowercasedQuery) ||
        user.username.toLowerCase().includes(lowercasedQuery)) &&
        user.role === 'client'
      );
    } else if (categoryQuery) {
        bookResults = allBooks.filter(book => book.category === categoryQuery);
    }
    
    setFilteredBooks(bookResults);
    setFilteredUsers(userResults);
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

  const noResults = !loading && filteredBooks.length === 0 && filteredUsers.length === 0;

  return (
    <div className="bg-background min-h-screen">
      <ClientHeader
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
            {query ? `Mostrando resultados para "${query}"` : categoryQuery ? `Explorando la categoría "${categoryQuery}"` : 'Realiza una búsqueda para empezar.'}
          </p>
        </header>

        {loading ? (
            <SearchSkeleton />
        ) : noResults ? (
            <div className="text-center py-16 text-muted-foreground bg-muted/50 rounded-lg">
                <p>No se encontraron resultados que coincidan con tu búsqueda.</p>
            </div>
        ) : (
          <div className="space-y-12">
            {/* Books Section */}
            {(query || categoryQuery) && filteredBooks.length > 0 && (
                <section id="book-results">
                    <h2 className="text-2xl font-semibold mb-4">Libros ({filteredBooks.length})</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filteredBooks.map((book) => (
                        <BookCard key={book.id} book={book} onClick={() => handleOpenBookDialog(book)} />
                    ))}
                    </div>
                </section>
            )}

            {/* Users Section */}
            {query && filteredUsers.length > 0 && (
                <section id="user-results">
                <h2 className="text-2xl font-semibold mb-4">Usuarios ({filteredUsers.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                        <Link key={user.id} href={`/profile/${user.username}`} passHref>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                                <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className="h-14 w-14">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback><UserIcon className="h-6 w-6" /></AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-base">{user.name}</h3>
                                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                                </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    </div>
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
