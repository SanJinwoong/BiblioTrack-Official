
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { books as initialBooks, checkouts as initialCheckouts, checkoutRequests as initialCheckoutRequests, categories as initialCategories, users as initialUsers } from '@/lib/data';
import type { Book as BookType, Checkout, Category, User } from '@/lib/types';
import { BookCard } from './book-card';
import { Recommendations } from './recommendations';
import { Badge } from './ui/badge';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { ClientHeader } from './client-header';
import { BookDetailsDialog } from './book-details-dialog';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { ArrowRight, BookX } from 'lucide-react';
import { RestrictedView } from './restricted-view';
import { useToast } from '@/hooks/use-toast';


export function ClientDashboard() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutRequests, setCheckoutRequests] = useState<Checkout[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [filteredBooks, setFilteredBooks] = useState<BookType[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [selectedBookCheckout, setSelectedBookCheckout] = useState<Checkout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // This effect runs once on component mount to safely initialize state from localStorage.
    const loadState = (key: string, setter: Function, initialState: any) => {
        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
                const parsedValue = JSON.parse(storedValue);
                if (Array.isArray(parsedValue) && parsedValue.length > 0) {
                    setter(parsedValue);
                    return; // Data loaded from storage, exit
                }
            }
            // If no data in storage or it's an empty array, initialize and save
            setter(initialState);
            localStorage.setItem(key, JSON.stringify(initialState));
        } catch (error) {
            console.error(`Failed to load state for ${key}:`, error);
            setter(initialState);
        }
    };

    loadState('books', setBooks, initialBooks);
    loadState('categories', setCategories, initialCategories);
    loadState('checkouts', setCheckouts, initialCheckouts);
    loadState('checkoutRequests', setCheckoutRequests, initialCheckoutRequests);
    loadState('users', setUsers, initialUsers);

    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);
    
    const fullUsername = storedUsername.includes('@') ? storedUsername : `${storedUsername}@alumnos.uat.edu.mx`;
    // We need to ensure we are checking against the most recent user list
    const usersFromStorage = localStorage.getItem('users');
    const currentUsers = usersFromStorage ? JSON.parse(usersFromStorage) : initialUsers;
    const currentUser = currentUsers.find((u: User) => u.username === fullUsername);
    setUser(currentUser || null);

  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => { if (books.length > 0) localStorage.setItem('books', JSON.stringify(books)); }, [books]);
  useEffect(() => { if (categories.length > 0) localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { if (checkouts.length > 0) localStorage.setItem('checkouts', JSON.stringify(checkouts)); }, [checkouts]);
  useEffect(() => { if (checkoutRequests.length > 0) localStorage.setItem('checkoutRequests', JSON.stringify(checkoutRequests)); }, [checkoutRequests]);
  useEffect(() => { if (users.length > 0) localStorage.setItem('users', JSON.stringify(users)); }, [users]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'books' && e.newValue) setBooks(JSON.parse(e.newValue));
      if (e.key === 'categories' && e.newValue) setCategories(JSON.parse(e.newValue));
      if (e.key === 'checkouts' && e.newValue) setCheckouts(JSON.parse(e.newValue));
      if (e.key === 'checkoutRequests' && e.newValue) setCheckoutRequests(JSON.parse(e.newValue));
      if (e.key === 'users' && e.newValue) {
        const updatedUsers = JSON.parse(e.newValue);
        setUsers(updatedUsers);
        // Also update the current user state
        const fullUsername = username.includes('@') ? username : `${username}@alumnos.uat.edu.mx`;
        const currentUser = updatedUsers.find((u: User) => u.username === fullUsername);
        setUser(currentUser || null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [username]);


  useEffect(() => {
    const results = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchTerm, books]);

  const handleSuccessfulCheckoutRequest = (bookId: number, checkoutData: {userId: string; dueDate: string}) => {
    // Add a new request to the checkoutRequests state
    const newRequest: Checkout = {
      userId: checkoutData.userId,
      bookId: bookId,
      dueDate: checkoutData.dueDate,
      status: 'pending',
    };
    const updatedRequests = [...checkoutRequests, newRequest];
    setCheckoutRequests(updatedRequests);
  };

  // Dummy functions for props that are not used in client view
  const handleReturnBook = () => {};
  const handleDeactivateUser = () => {};
  
  const handleOpenDialog = (book: BookType) => {
    setSelectedBook(book);
    const checkout = checkouts.find(c => c.bookId === book.id && c.userId === username && c.status === 'approved');
    const request = checkoutRequests.find(r => r.bookId === book.id && r.userId === username && r.status === 'pending');
    setSelectedBookCheckout(checkout || request || null);
  };

  const handleCloseDialog = () => {
    setSelectedBook(null);
    setSelectedBookCheckout(null);
  };


  const userCheckouts = checkouts
    .filter((c) => c.userId === username && c.status === 'approved')
    .map((c) => {
      const book = books.find((b) => b.id === c.bookId);
      // This is a safe cast because we are filtering for existing books
      return { ...book, dueDate: c.dueDate, status: c.status } as BookType & { dueDate: string, status: Checkout['status'] };
    });

  const userRequests = checkoutRequests
    .filter((r) => r.userId === username)
    .map((r) => {
        const book = books.find((b) => b.id === r.bookId);
        return { ...book, dueDate: r.dueDate, status: r.status } as BookType & { dueDate: string, status: Checkout['status'] };
    });


  const latestBooks = [...books].sort((a, b) => b.id - a.id).slice(0, 5);
  
  const booksByCategory = categories.map(category => ({
    ...category,
    books: books.filter(book => book.category === category.name).slice(0, 10)
  })).filter(category => category.books.length > 0);


  if (user && user.status === 'deactivated') {
    return <RestrictedView user={user} checkouts={userCheckouts.filter(c => c.id !== undefined)} />;
  }

  return (
    <>
      <BookDetailsDialog 
        book={selectedBook}
        checkout={selectedBookCheckout}
        open={!!selectedBook} 
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        onSuccessfulCheckout={handleSuccessfulCheckoutRequest}
        onReturnBook={handleReturnBook} // Dummy prop
        onDeactivateUser={handleDeactivateUser} // Dummy prop
        username={username}
        role="client"
      />
      <div className="bg-background min-h-screen">
        <ClientHeader username={username} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <main className="container mx-auto p-4 md:p-8 lg:p-12 space-y-16">
          {searchTerm ? (
              <section id="search-results" className="pt-8 space-y-8">
                  <h2 className="text-3xl font-bold">Resultados de Búsqueda</h2>
                  {filteredBooks.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredBooks.map((book) => (
                            <BookCard key={book.id} book={book} onClick={() => handleOpenDialog(book)} />
                        ))}
                    </div>
                  ) : (
                      <p className="text-muted-foreground text-lg text-center py-16">No se encontraron libros para &quot;{searchTerm}&quot;.</p>
                  )}
              </section>
          ) : (
              <>
                <section id="hero" className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="lg:w-1/2 text-center lg:text-left">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4">
                      Explora un Universo de Historias
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">
                      Encuentra tu próxima aventura literaria. Desde clásicos atemporales hasta las últimas novedades, todo está a tu alcance.
                    </p>
                    <Button size="lg" className="rounded-full">
                      Explorar el Catálogo
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  <div className="lg:w-1/2 relative h-80 lg:h-[450px] w-full">
                     <Image
                        src="https://picsum.photos/seed/hero-main/1200/800"
                        alt="Explora la biblioteca"
                        fill
                        className="object-cover rounded-2xl shadow-2xl"
                        data-ai-hint="library books"
                      />
                  </div>
                </section>
                
                {(userCheckouts.length > 0 || userRequests.length > 0) && (
                    <section id="my-activity" className="space-y-6">
                      <h2 className="text-3xl font-bold">Mi Actividad</h2>
                      <ScrollArea>
                          <div className="flex space-x-6 pb-4">
                          {userCheckouts.map((book) =>
                              book.id ? (
                              <div key={`checkout-${book.id}`} className="w-44 min-w-44">
                                  <BookCard book={book as BookType} onClick={() => handleOpenDialog(book as BookType)} isApproved={true}>
                                  <div className="p-3 pt-0 text-xs">
                                      <p className="text-muted-foreground mt-1">Vence: {book.dueDate}</p>
                                  </div>
                                  </BookCard>
                              </div>
                              ) : null
                          )}
                           {userRequests.map((book) =>
                              book.id ? (
                              <div key={`request-${book.id}`} className="w-44 min-w-44">
                                  <BookCard book={book as BookType} onClick={() => handleOpenDialog(book as BookType)} isPending={true}>
                                  <div className="p-3 pt-0 text-xs">
                                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 animate-pulse">Pendiente</Badge>
                                  </div>
                                  </BookCard>
                              </div>
                              ) : null
                          )}
                          </div>
                          <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </section>
                )}

                <section id="latest-additions" className="space-y-6">
                  <h2 className="text-3xl font-bold">Últimos Libros Añadidos</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8">
                    {latestBooks.map((book) => (
                      <BookCard key={book.id} book={book} onClick={() => handleOpenDialog(book)} />
                    ))}
                  </div>
                </section>

                <Separator className="my-12"/>

                <section id="browse-categories" className="space-y-12">
                  <h2 className="text-3xl font-bold text-center">Explora por Categorías</h2>
                  {booksByCategory.map((category) => (
                    <div key={category.id}>
                      <h3 className="text-2xl font-semibold mb-4">{category.name}</h3>
                       <Carousel opts={{ align: 'start' }} className="w-full">
                        <CarouselContent className="-ml-4">
                           {category.books.map((book) => (
                            <CarouselItem key={book.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-4">
                              <BookCard book={book} onClick={() => handleOpenDialog(book)} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                      </Carousel>
                    </div>
                  ))}
                </section>

                <Separator className="my-12"/>

                <section id="recommendations">
                    <Recommendations onBookSelect={handleOpenDialog} />
                </section>
              </>
          )}
        </main>
      </div>
    </>
  );
}

    
    

    