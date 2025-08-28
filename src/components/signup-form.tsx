'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

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
  username: z.string().min(2, {
    message: 'El nombre de usuario debe tener al menos 2 caracteres.',
  }),
  password: z.string().min(6, {
    message: 'La contraseña debe tener al menos 6 caracteres.',
  }),
});

export function SignUpForm() {
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
    const existingUser = users.find(u => u.username === values.username);
    if (existingUser) {
        toast({
            variant: "destructive",
            title: "❌ Error de registro",
            description: "Este nombre de usuario ya está en uso. Por favor, elige otro.",
        });
        return;
    }
    
    const role = 'client';
    
    users.push({
        username: values.username,
        password: values.password,
        role: role,
    });
    
    localStorage.setItem('userRole', role);
    localStorage.setItem('userUsername', values.username);
    router.push('/dashboard');
    toast({
        title: "✅ ¡Registro exitoso!",
        description: "Tu cuenta ha sido creada y has iniciado sesión."
    });
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Crear una cuenta nueva</CardTitle>
        <CardDescription>
          ¡Es rápido y fácil! Empieza a explorar la biblioteca ahora.
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
                  <FormLabel>Elige un nombre de usuario</FormLabel>
                  <FormControl>
                    <Input placeholder="ej: lector-genial" {...field} />
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
                  <FormLabel>Crea una contraseña segura</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Registrarme
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
