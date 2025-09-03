import Image from 'next/image';
import { Library } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-8">
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
          <Card className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl bg-white/50">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="https://picsum.photos/800/1067?random=99"
                alt="Abstract library visual"
                fill
                className="object-cover"
                data-ai-hint="abstract blue"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent" />
            </div>
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/30 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
              <p className="text-lg font-medium text-foreground">
                "Pude reducir el tiempo dedicado a buscar libros en un 35% usando esta plataforma."
              </p>
              <p className="text-sm font-bold text-foreground/80 mt-2">- Alumno Satisfecho</p>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
