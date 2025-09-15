
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { books as initialBooks, checkouts as initialCheckouts, checkoutRequests as initialCheckoutRequests, categories as initialCategories } from '@/lib/data';
import type { Book as BookType, Checkout, Category } from '@/lib/types';
import { BookCard } from './book-card';
import { Recommendations } from './recommendations';
import { Badge } from './ui/badge';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card } from './ui/card';
import { ClientHeader } from './client-header';
import { BookDetailsDialog } from './book-details-dialog';
import { Separator } from './ui/separator';

export function ClientDashboard() {
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [books, setBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutRequests, setCheckoutRequests] = useState<Checkout[]>([]);

  const [filteredBooks, setFilteredBooks] = useState<BookType[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [selectedBookCheckout, setSelectedBookCheckout] = useState<Checkout | null>(null);


  useEffect(() => {
    // This effect runs once on component mount to safely initialize state from localStorage.
    const storedBooks = localStorage.getItem('books');
    const storedCategories = localStorage.getItem('categories');
    const storedCheckouts = localStorage.getItem('checkouts');
    const storedCheckoutRequests = localStorage.getItem('checkoutRequests');
    
    setBooks(storedBooks ? JSON.parse(storedBooks) : initialBooks);
    setCategories(storedCategories ? JSON.parse(storedCategories) : initialCategories);
    setCheckouts(storedCheckouts ? JSON.parse(storedCheckouts) : initialCheckouts);
    setCheckoutRequests(storedCheckoutRequests ? JSON.parse(storedCheckoutRequests) : initialCheckoutRequests);

    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('checkouts', JSON.stringify(checkouts));
  }, [checkouts]);

  useEffect(() => {
    localStorage.setItem('checkoutRequests', JSON.stringify(checkoutRequests));
  }, [checkoutRequests]);

  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'books' && e.newValue) {
        setBooks(JSON.parse(e.newValue));
      }
      if (e.key === 'categories' && e.newValue) {
        setCategories(JSON.parse(e.newValue));
      }
      if (e.key === 'checkouts' && e.newValue) {
        setCheckouts(JSON.parse(e.newValue));
      }
      if (e.key === 'checkoutRequests' && e.newValue) {
        setCheckoutRequests(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


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


  const featuredBooks = [...books].sort(() => 0.5 - Math.random()).slice(0, 5);
  
  const booksByCategory = categories.map(category => ({
    ...category,
    books: books.filter(book => book.category === category.name)
  })).filter(category => category.books.length > 0);


  return (
    <>
      <BookDetailsDialog 
        book={selectedBook}
        checkout={selectedBookCheckout}
        open={!!selectedBook} 
        onOpenChange={(isOpen) => !isOpen && handleCloseDialog()}
        onSuccessfulCheckout={handleSuccessfulCheckoutRequest}
        username={username}
        role="client"
      />
      <div className="bg-background min-h-screen">
        <ClientHeader username={username} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <div className="container mx-auto p-4 md:p-8 space-y-12">
          <section id="discover">
            <Carousel
              opts={{
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {featuredBooks.map((book) => (
                  <CarouselItem key={book.id}>
                    <Card className="overflow-hidden cursor-pointer" onClick={() => handleOpenDialog(book)}>
                      <div className="relative h-64 md:h-80 w-full">
                        <Image
                          src={`https://picsum.photos/1200/400?random=${book.id}`}
                          alt={`Promotional image for ${book.title}`}
                          fill
                          className="object-cover"
                          data-ai-hint={`${book.category} landscape`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                          <h2 className="text-2xl md:text-4xl font-bold font-headline">
                            {book.title}
                          </h2>
                          <p className="text-sm md:text-lg">{book.author}</p>
                        </div>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </section>

          {searchTerm ? (
              <section id="search-results" className="space-y-6">
                  <h2 className="text-2xl font-bold font-headline">Search Results</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {filteredBooks.map((book) => (
                          <BookCard key={book.id} book={book} onClick={() => handleOpenDialog(book)} />
                      ))}
                  </div>
                  {filteredBooks.length === 0 && (
                      <p className="text-muted-foreground">No books found for &quot;{searchTerm}&quot;.</p>
                  )}
              </section>
          ) : (
              <>
                  {(userCheckouts.length > 0 || userRequests.length > 0) && (
                      <section id="my-books" className="space-y-4">
                      <h2 className="text-2xl font-bold font-headline">My Activity</h2>
                      <ScrollArea>
                          <div className="flex space-x-4 pb-4">
                          {userCheckouts.map((book) =>
                              book.id ? (
                              <div key={`checkout-${book.id}`} className="w-40 min-w-40">
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
                              <div key={`request-${book.id}`} className="w-40 min-w-40">
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

                  <section id="browse" className="space-y-8">
                    <h2 className="text-2xl font-bold font-headline">Browse Catalog</h2>
                    {booksByCategory.map((category, index) => (
                      <div key={category.id}>
                        <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
                        <ScrollArea>
                          <div className="flex space-x-4 pb-4">
                            {category.books.map((book) => (
                              <div key={book.id} className="w-40 min-w-40">
                                <BookCard book={book} onClick={() => handleOpenDialog(book)} />
                              </div>
                            ))}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                        {index < booksByCategory.length - 1 && <Separator className="mt-8"/>}
                      </div>
                    ))}
                  </section>

                  <section id="recommendations">
                      <Recommendations onBookSelect={handleOpenDialog} />
                  </section>
              </>
          )}
        </div>
      </div>
    </>
  );
}

    