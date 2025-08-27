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
import { users } from '@/lib/data'; // Assuming users are exported from data
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  username: z.string().min(1, {
    message: 'Por favor ingrese un nombre de usuario.',
  }),
  password: z.string().min(1, {
    message: 'Password cannot be empty.',
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
    // In a real app, you'd authenticate here against a backend.
    // For this mock, we'll check against our mock user data.
    const user = users.find(u => u.username === values.username && u.password === values.password);

    if (user) {
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userUsername', user.username);
      router.push('/dashboard');
    } else {
        toast({
            variant: "destructive",
            title: "Error de inicio de sesión",
            description: "Usuario o contraseña incorrectos.",
        });
    }
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Iniciar sesión</CardTitle>
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
                    <Input placeholder="usuario" {...field} />
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
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar sesión
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
