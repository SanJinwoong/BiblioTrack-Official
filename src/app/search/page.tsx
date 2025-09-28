
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getBooks, getUsers, getCategories, getFollowers, getFollowing } from '@/lib/supabase-functions';
import type { Book, User, Category } from '@/lib/types';
import { ClientHeader } from '@/components/client-header';
import { BookCard } from '@/components/book-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookDetailsDialog } from '@/components/book-details-dialog';
import Link from 'next/link';
import { User as UserIcon, BookOpen, Search, Users, Filter, X } from 'lucide-react';

// Eliminado filtro específico de libros (título/autor) – simplificamos
type ActiveTab = 'all' | 'books' | 'users';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const categoryQuery = searchParams.get('category') || '';

  const [username, setUsername] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  // Filtro granular eliminado; mantenemos solo searchQuery + activeTab
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  
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

        // Enriquecer usuarios con contadores de followers/following
        const enrichedUsers = await Promise.all(usersData.map(async (u) => {
          try {
            const [followersList, followingList] = await Promise.all([
              getFollowers(u.id),
              getFollowing(u.id)
            ]);
            return {
              ...u,
              followers: followersList.map(f => f.id),
              following: followingList.map(f => f.id)
            }
          } catch {
            return u; // fallback silencioso
          }
        }));
        
        setAllBooks(booksData);
        setAllUsers(enrichedUsers);
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
    performSearch();
  }, [searchQuery, categoryQuery, allBooks, allUsers]);

  // Sincroniza cambios cuando el usuario usa la barra global del navbar (query param cambia)
  // Sincroniza solo cuando realmente cambia el parámetro ?q= en la URL (evita sobrescribir la escritura local)
  useEffect(() => {
    const qp = searchParams.get('q');
    if (qp !== null && qp !== searchQuery) {
      setSearchQuery(qp);
    }
    // Intencionalmente NO dependemos de searchQuery para no disparar al teclear
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const performSearch = () => {
    setLoading(true);
    let bookResults: Book[] = [];
    let userResults: User[] = [];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      
      // Coincidencia por título o autor (filtro unificado)
      bookResults = allBooks.filter(book => (
        book.title.toLowerCase().includes(lowercasedQuery) ||
        book.author.toLowerCase().includes(lowercasedQuery)
      ));

      // Filter users by name, username (matricula)
      userResults = allUsers.filter(user => {
        const name = (user.name || '').toLowerCase();
        const username = user.username.toLowerCase();
        
        return (name.includes(lowercasedQuery) ||
                username.includes(lowercasedQuery)) &&
               user.role === 'client';
      });
    } else if (categoryQuery) {
      bookResults = allBooks.filter(book => book.category === categoryQuery);
    }
    
    setFilteredBooks(bookResults);
    setFilteredUsers(userResults);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    router.push('/search');
  };

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
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64" />)}
      </div>
    </div>
  );

  const hasResults = filteredBooks.length > 0 || filteredUsers.length > 0;
  const showResults = searchQuery || categoryQuery;

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
        {/* Search Header */}
        <header className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Centro de Búsqueda</h1>
            <p className="text-muted-foreground">
              Encuentra libros por título o autor, y conecta con otros usuarios
            </p>
          </div>

          {/* Enhanced Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar libros, autores, o usuarios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={!searchQuery.trim()}>
                Buscar
              </Button>
              {searchQuery && (
                <Button type="button" variant="outline" onClick={clearSearch}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ver:</span>
              <div className="flex gap-2">
                {(['all','books','users'] as ActiveTab[]).map(tab => (
                  <Button
                    key={tab}
                    type="button"
                    variant={activeTab === tab ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'all' ? 'Todo' : tab === 'books' ? 'Libros' : 'Usuarios'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Active search indicators */}
            {(searchQuery || categoryQuery) && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Búsqueda: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {categoryQuery && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Categoría: {categoryQuery}
                    <button onClick={() => router.push('/search')} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </form>
        </header>

        {/* Results Section */}
        {loading ? (
          <SearchSkeleton />
        ) : !showResults ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Search className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">¡Comienza tu búsqueda!</h3>
                <p className="text-muted-foreground">
                  Busca libros, autores, o encuentra otros usuarios de la biblioteca
                </p>
              </div>
            </div>
          </Card>
        ) : !hasResults ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">Sin resultados</h3>
                <p className="text-muted-foreground">
                  No se encontraron resultados. Intenta con otros términos de búsqueda.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <Tabs value={activeTab} className="space-y-6">

            <TabsContent value="all" className="space-y-8">
              {/* Books Section */}
              {filteredBooks.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-6 w-6" />
                    Libros
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filteredBooks.slice(0, 12).map((book) => (
                      <BookCard key={book.id} book={book} onClick={() => handleOpenBookDialog(book)} />
                    ))}
                  </div>
                  {filteredBooks.length > 12 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setActiveTab('books')}>
                        Ver todos los libros ({filteredBooks.length})
                      </Button>
                    </div>
                  )}
                </section>
              )}

              {/* Users Section */}
              {filteredUsers.length > 0 && (
                <section>
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Usuarios
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.slice(0, 6).map((user) => (
                      <Link key={user.id} href={`/profile/${user.username}`} passHref>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                          <CardContent className="p-4 flex items-center gap-4">
                            <Avatar className="h-14 w-14">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback>
                                <UserIcon className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-base">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>{user.followers?.length || 0} seguidores</span>
                                <span>{user.following?.length || 0} siguiendo</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  {filteredUsers.length > 6 && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" onClick={() => setActiveTab('users')}>
                        Ver todos los usuarios ({filteredUsers.length})
                      </Button>
                    </div>
                  )}
                </section>
              )}
            </TabsContent>

            <TabsContent value="books" className="space-y-6">
              {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard key={book.id} book={book} onClick={() => handleOpenBookDialog(book)} />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No se encontraron libros</h3>
                  <p className="text-muted-foreground">
                    Intenta ajustar tus filtros o buscar otros términos
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              {filteredUsers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user) => (
                    <Link key={user.id} href={`/profile/${user.username}`} passHref>
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback>
                                <UserIcon className="h-8 w-8" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{user.name}</h3>
                              <p className="text-muted-foreground">@{user.username}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {user.followers?.length || 0} seguidores
                                </span>
                                <span>{user.following?.length || 0} siguiendo</span>
                              </div>
                              {user.bio && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No se encontraron usuarios</h3>
                  <p className="text-muted-foreground">
                    Intenta buscar por nombre o matrícula
                  </p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
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
