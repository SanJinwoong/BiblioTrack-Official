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

const studentEmailRegex = /^a\d{10}@alumnos\.uat\.edu\.mx$/;
const matriculaRegex = /^a\d{10}$/;

const formSchema = z.object({
  emailOrMatricula: z.string().min(1, {
    message: 'Por favor ingrese su correo o matrícula.',
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
      emailOrMatricula: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    let username = values.emailOrMatricula;

    // If user enters just matricula, convert to full email
    if (matriculaRegex.test(username)) {
      username = `${username}@alumnos.uat.edu.mx`;
    }

    const user = users.find(u => u.username === username && u.password === values.password);

    if (user) {
      localStorage.setItem('userRole', user.role);
      // For students, store the matricula as the display username
      if (user.role === 'client' && studentEmailRegex.test(user.username)) {
        const matricula = user.username.split('@')[0];
        localStorage.setItem('userUsername', matricula);
      } else {
        localStorage.setItem('userUsername', user.username);
      }
      
      router.push('/dashboard');
      toast({
        title: `✅ ¡Bienvenido de nuevo!`,
        description: 'Has iniciado sesión correctamente.',
      });
    } else {
        toast({
            variant: "destructive",
            title: "❌ Credenciales incorrectas",
            description: "El usuario o la contraseña no son correctos. Por favor, inténtalo de nuevo.",
        });
    }
  }

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Inicia Sesión</CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="emailOrMatricula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Institucional o Usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="a1234567890 o admin" {...field} />
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
            <Button type="submit" size="lg" className="w-full mt-4 bg-primary hover:bg-primary/90">
              <LogIn className="mr-2 h-4 w-4" />
              Entrar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
