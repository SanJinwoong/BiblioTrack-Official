
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
    <main className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-secondary/50">
      {/* Left side: Form */}
      <div className="flex flex-col items-center justify-center p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <Library className="mx-auto h-8 w-8" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {view === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === 'login'
                ? 'Enter your credentials to access your account'
                : 'Enter your details to get started'}
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
                  Login
                </Button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right side: Image Carousel */}
      <div className="hidden md:flex flex-col items-center justify-center bg-primary p-8">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full max-w-sm"
        >
          <CarouselContent>
            {books.map((book) => (
              <CarouselItem key={book.id}>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="w-48 h-64 relative">
                        <Image
                            src={book.coverUrl}
                            alt={`Cover of ${book.title}`}
                            fill
                            className="rounded-md object-cover"
                        />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-lg">{book.title}</h3>
                        <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className='-left-12' />
          <CarouselNext className='-right-12' />
        </Carousel>
      </div>
    </main>
  );
}
