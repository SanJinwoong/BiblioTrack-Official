
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { Button } from '@/components/ui/button';
import { Library } from '@/components/icons/uat-logo';
import { initialBooks } from '@/lib/data';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'signup'>('login');

  const featuredBooks = initialBooks.slice(0, 3);

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 min-h-screen bg-background text-foreground">
      {/* Left side: Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
          <div className="flex flex-col space-y-2 text-center mb-6">
            <div className="flex items-center justify-center space-x-3">
                <Library className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">
                    BiblioTrack
                </h1>
            </div>
            <p className="text-muted-foreground pt-1">
              {view === 'login'
                ? 'Ingresa tus credenciales para acceder a tu cuenta.'
                : 'Crea una cuenta para empezar a explorar.'}
            </p>
          </div>

          {view === 'login' ? <LoginForm /> : <SignUpForm />}

          <p className="px-8 text-center text-sm text-muted-foreground">
            {view === 'login' ? (
              <>
                ¿No tienes una cuenta?{' '}
                <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setView('signup')}>
                  Regístrate
                </Button>
              </>
            ) : (
              <>
                ¿Ya tienes una cuenta?{' '}
                <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setView('login')}>
                  Inicia Sesión
                </Button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right side: Image Composition */}
      <div className="hidden md:flex flex-col items-center justify-center bg-muted/50 p-8 relative overflow-hidden">
        <div className="grid grid-cols-12 grid-rows-6 gap-4 w-full max-w-2xl h-full max-h-[80vh]">
            <div className="col-span-7 row-span-4 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Image src="https://picsum.photos/seed/auth-1/800/600" alt="Libro destacado 1" className="object-cover w-full h-full" width={800} height={600} data-ai-hint="library shelf" />
            </div>
            <div className="col-span-5 row-span-3 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Image src="https://picsum.photos/seed/auth-2/600/400" alt="Libro destacado 2" className="object-cover w-full h-full" width={600} height={400} data-ai-hint="reading book" />
            </div>
            <div className="col-span-5 row-span-3 col-start-8 row-start-4 rounded-xl overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300">
                <Image src="https://picsum.photos/seed/auth-3/600/400" alt="Libro destacado 3" className="object-cover w-full h-full" width={600} height={400} data-ai-hint="open book" />
            </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-muted/30 to-transparent"></div>
      </div>
    </main>
  );
}
