
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Library } from '@/components/icons/uat-logo';
import { getBooks } from '@/lib/supabase-functions';
import type { Book } from '@/lib/types';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { BookCard } from '@/components/book-card';

export default function AuthPage() {
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [view, setView] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    // Load real books from database
    const loadBooks = async () => {
      try {
        const books = await getBooks();
        // Filter books that have actual cover images (not placeholders)
        const booksWithCovers = books.filter(book => 
          book.coverUrl && 
          book.coverUrl.trim() !== '' && 
          !book.coverUrl.includes('placehold.co')
        );
        
        // If we have books with real covers, use them; otherwise use all books
        const booksToShow = booksWithCovers.length > 0 ? booksWithCovers : books;
        
        // Shuffle books for variety
        const shuffledBooks = [...booksToShow].sort(() => 0.5 - Math.random());
        setFeaturedBooks(shuffledBooks.slice(0, 8)); // Limit to 8 books
      } catch (error) {
        console.error('Error loading books for carousel:', error);
      }
    };

    loadBooks();
  }, []);

  const autoplayPlugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: false }));

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 items-stretch bg-card text-card-foreground rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Column: Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <div className="flex items-center space-x-3 mb-6 text-primary">
            <Library className="h-10 w-10" />
            <h1 className="text-4xl font-bold font-headline text-foreground">
              BiblioTrack
            </h1>
          </div>

          <Card className="border-none shadow-none bg-transparent p-0">
            {view === 'login' ? <LoginForm /> : <SignUpForm />}

            <div className="mt-4 text-center text-sm">
              {view === 'login' ? (
                <>
                  ¿No tienes una cuenta?{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => setView('signup')}>
                    Regístrate
                  </Button>
                </>
              ) : (
                <>
                  ¿Ya tienes una cuenta?{' '}
                  <Button variant="link" className="p-0 h-auto" onClick={() => setView('login')}>
                    Inicia sesión
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Carousel */}
        <div className="hidden md:flex items-center justify-center relative bg-primary/10 overflow-hidden">
          <Carousel
            plugins={[autoplayPlugin.current]}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {featuredBooks.length > 0 ? featuredBooks.map((book, index) => (
                <CarouselItem key={`${book.id}-${index}`} className="pl-2 basis-full md:basis-1/2">
                  <div className="p-1">
                    <BookCard book={book} />
                  </div>
                </CarouselItem>
              )) : (
                // Fallback skeleton while loading
                Array.from({ length: 4 }).map((_, index) => (
                  <CarouselItem key={`skeleton-${index}`} className="pl-2 basis-full md:basis-1/2">
                    <div className="p-1">
                      <div className="aspect-[3/4.5] bg-gray-200 animate-pulse rounded-lg" />
                    </div>
                  </CarouselItem>
                ))
              )}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </main>
  );
}
