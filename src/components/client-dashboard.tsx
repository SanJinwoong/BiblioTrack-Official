'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { books, checkouts } from '@/lib/data';
import type { Book as BookType } from '@/lib/types';
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

export function ClientDashboard() {
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>(books);

  useEffect(() => {
    const storedUsername = localStorage.getItem('userUsername') || '';
    setUsername(storedUsername);
  }, []);

  useEffect(() => {
    const results = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchTerm]);

  const userCheckouts = checkouts
    .filter((c) => c.userId === username)
    .map((c) => {
      const book = books.find((b) => b.id === c.bookId);
      return { ...book, dueDate: c.dueDate };
    });

  const featuredBooks = [...books].sort(() => 0.5 - Math.random()).slice(0, 5);

  return (
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
                  <Card className="overflow-hidden">
                    <div className="relative h-64 md:h-80 w-full">
                      <Image
                        src={`https://picsum.photos/1200/400?random=${book.id}`}
                        alt={`Promotional image for ${book.title}`}
                        fill
                        className="object-cover"
                        data-ai-hint={`${book.genre} landscape`}
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
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
                {filteredBooks.length === 0 && (
                    <p className="text-muted-foreground">No books found for &quot;{searchTerm}&quot;.</p>
                )}
             </section>
        ) : (
            <>
                {userCheckouts.length > 0 && (
                    <section id="my-books" className="space-y-4">
                    <h2 className="text-2xl font-bold font-headline">My Books</h2>
                    <ScrollArea>
                        <div className="flex space-x-4 pb-4">
                        {userCheckouts.map((book) =>
                            book.id ? (
                            <div key={book.id} className="w-40 min-w-40">
                                <BookCard book={book as BookType}>
                                <div className="p-4 pt-0">
                                    <Badge variant="secondary">Due: {book.dueDate}</Badge>
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

                <section id="browse" className="space-y-4">
                    <h2 className="text-2xl font-bold font-headline">Browse Catalog</h2>
                    <ScrollArea>
                        <div className="flex space-x-4 pb-4">
                        {books.map((book) => (
                             <div key={book.id} className="w-40 min-w-40">
                                <BookCard book={book} />
                            </div>
                        ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </section>

                <section id="recommendations">
                    <Recommendations />
                </section>
            </>
        )}
      </div>
    </div>
  );
}
