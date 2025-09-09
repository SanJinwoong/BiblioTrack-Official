
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Library } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { BookCard } from '@/components/book-card';
import { books } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function AuthPage() {
  const [featuredBooks, setFeaturedBooks] = useState([...books]);
  const [view, setView] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    // Shuffle books on mount
    setFeaturedBooks((prevBooks) =>
      [...prevBooks].sort(() => 0.5 - Math.random())
    );
  }, []);

  const autoplayPlugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: false }));

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 items-start bg-card text-card-foreground rounded-2xl shadow-2xl overflow-hidden">
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

        {/* Right Column: Visual */}
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
              {featuredBooks.map((book) => (
                <CarouselItem key={book.id} className="pl-2 basis-full md:basis-1/2">
                   <div className="p-1">
                    <BookCard book={book} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </main>
  );
}
