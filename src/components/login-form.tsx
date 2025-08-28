'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { users } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  username: z.string().min(1, {
    message: 'Por favor ingrese un nombre de usuario.',
  }),
  password: z.string().min(1, {
    message: 'La contraseña no puede estar vacía.',
  }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const user = users.find(u => u.username === values.username && u.password === values.password);

    if (user) {
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userUsername', user.username);
      router.push('/dashboard');
      toast({
        title: `✅ ¡Bienvenido, ${user.username}!`,
        description: 'Has iniciado sesión correctamente.',
      });
    } else {
        toast({
            variant: "destructive",
            title: "❌ Error de inicio de sesión",
            description: "Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.",
        });
    }
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">¡Hola de nuevo!</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="tu-usuario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
