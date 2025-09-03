import Image from 'next/image';
import { Library } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { BookCard } from '@/components/book-card';
import { books } from '@/lib/data';

export default function AuthPage() {
  const featuredBooks = [...books].sort(() => 0.5 - Math.random()).slice(0, 5);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        
        {/* Left Column: Form */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-6 text-primary">
            <Library className="h-10 w-10" />
            <h1 className="text-4xl font-bold font-headline text-foreground">BiblioTrack</h1>
          </div>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/80">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Visual */}
        <div className="hidden md:flex flex-col items-center justify-center relative">
            <Carousel
                opts={{
                    loop: true,
                    align: "center",
                }}
                className="w-full max-w-sm"
            >
                <CarouselContent>
                    {featuredBooks.map((book) => (
                        <CarouselItem key={book.id} className="basis-1/2">
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
