
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UatLogo } from '@/components/icons/uat-logo';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'signup'>('login');

  return (
    <main className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      {/* Form Column */}
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center text-center mb-8">
             <UatLogo className="h-24 w-24 text-primary mb-4" />
            <h1 className="text-4xl font-bold font-headline text-foreground">
              BiblioTrack UAT
            </h1>
            <p className="text-muted-foreground mt-2">
              Tu portal de acceso a la Biblioteca Digital.
            </p>
          </div>
          
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
                {view === 'login' ? <LoginForm /> : <SignUpForm />}

                <div className="mt-6 text-center text-sm">
                    {view === 'login' ? (
                        <>
                        ¿No tienes una cuenta?{' '}
                        <Button variant="link" className="p-0 h-auto text-accent" onClick={() => setView('signup')}>
                            Regístrate aquí
                        </Button>
                        </>
                    ) : (
                        <>
                        ¿Ya tienes una cuenta?{' '}
                        <Button variant="link" className="p-0 h-auto text-accent" onClick={() => setView('login')}>
                            Inicia sesión
                        </Button>
                        </>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Column */}
      <div className="hidden lg:block relative">
        <Image
          src="https://picsum.photos/seed/library-bg/1200/1800"
          alt="University Library"
          fill
          className="object-cover"
          data-ai-hint="university library background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
         <div className="absolute bottom-8 left-8 right-8 p-6 bg-black/50 backdrop-blur-md rounded-lg text-white">
            <h2 className="text-2xl font-bold font-headline">"El conocimiento es el tesoro de un hombre sabio."</h2>
            <p className="mt-2 text-right">- William Godwin</p>
        </div>
      </div>
    </main>
  );
}
