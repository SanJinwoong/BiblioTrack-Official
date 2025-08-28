import { Library } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { SignUpForm } from '@/components/signup-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center space-y-2 text-center">
        <div className="flex items-center space-x-3 text-primary">
          <Library className="h-12 w-12" />
          <h1 className="text-5xl font-bold font-headline">BiblioTrack</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Tu asistente de biblioteca personal.
        </p>
        <p className="max-w-md">
          Inicia sesión para gestionar tus préstamos o regístrate para descubrir tu próxima lectura.
        </p>
        <div className="w-full max-w-sm pt-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">📖 Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">👤 Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
