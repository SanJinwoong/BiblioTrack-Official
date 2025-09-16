
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { collection, query, where, getDocs } from 'firebase/firestore';

const formSchema = z.object({
  username: z.string().min(1, {
    message: 'Por favor ingrese su usuario.',
  }),
  password: z.string().min(1, {
    message: 'La contraseña no puede estar vacía.',
  }),
});

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { username, password } = values;

    try {
      // 1. Create a direct query to Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      
      // 2. Execute the query
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No user found with that username
        toast({
            variant: "destructive",
            title: "❌ Credenciales incorrectas",
            description: "El usuario o la contraseña no son correctos. Por favor, inténtalo de nuevo.",
        });
        setIsLoading(false);
        return;
      }
      
      // 3. Get the user data and check the password
      const userDoc = querySnapshot.docs[0];
      const user = { id: userDoc.id, ...userDoc.data() } as User;

      if (user.password === password) {
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userUsername', user.username);
        
        router.push('/dashboard');
        toast({
          title: `✅ ¡Bienvenido de nuevo!`,
          description: 'Has iniciado sesión correctamente.',
        });
      } else {
        // Password does not match
        toast({
            variant: "destructive",
            title: "❌ Credenciales incorrectas",
            description: "El usuario o la contraseña no son correctos. Por favor, inténtalo de nuevo.",
        });
      }

    } catch (error) {
      console.error("Error authenticating user:", error);
      toast({
        variant: "destructive",
        title: "🔥 Error del sistema",
        description: "Ocurrió un error inesperado al intentar iniciar sesión.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuario</FormLabel>
              <FormControl>
                <Input placeholder="admin o matrícula" {...field} />
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
        <Button type="submit" size="lg" className="w-full mt-4" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Verificando...' : 'Entrar'}
        </Button>
      </form>
    </Form>
  );
}
