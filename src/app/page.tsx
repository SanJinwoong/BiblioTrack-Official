
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Library } from '@/components/icons/uat-logo';
import { books } from '@/lib/data';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'signup'>('login');

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-background">
      {/* Left side: Form */}
      <div className="flex flex-col items-center justify-center p-8 bg-card shadow-lg z-10">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex items-center justify-center space-x-2">
                <Library className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">
                    BiblioTrack
                </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {view === 'login'
                ? 'Enter your credentials to access your account.'
                : 'Create an account to get started.'}
            </p>
          </div>

          {view === 'login' ? <LoginForm /> : <SignUpForm />}

          <p className="px-8 text-center text-sm text-muted-foreground">
            {view === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setView('signup')}>
                  Sign up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setView('login')}>
                  Sign in
                </Button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right side: Image Carousel */}
      <div className="hidden md:flex flex-col items-center justify-center bg-muted p-8">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full max-w-lg"
        >
          <CarouselContent className="-ml-4">
            {books.map((book) => (
              <CarouselItem key={book.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center p-0">
                    <div className="w-full h-64 relative">
                        <Image
                            src={book.coverUrl}
                            alt={`Cover of ${book.title}`}
                            fill
                            className="rounded-t-lg object-cover"
                        />
                    </div>
                    <div className="p-4 w-full text-center">
                        <h3 className="font-semibold text-lg truncate">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </main>
  );
}
