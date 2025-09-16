
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2 } from 'lucide-react';
import { useState } from 'react';
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
import { collection, query, where, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';

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
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      
      let querySnapshot = await getDocs(q);

      // Si el usuario no se encuentra y es 'admin', créalo.
      if (querySnapshot.empty && username === 'admin') {
        toast({
          title: 'Configurando administrador...',
          description: 'El usuario "admin" no existía y se está creando. Un momento por favor.',
        });
        
        const adminUser: Omit<User, 'id'> = {
          username: 'admin',
          password: 'admin',
          role: 'librarian',
          name: 'Librarian Admin',
          email: 'admin@library.com',
          curp: 'ADMINCURP123456',
          phone: '834-000-0000',
          address: 'UAT, Centro Universitario Victoria',
          status: 'active',
          avatarUrl: 'https://i.pravatar.cc/150?u=admin'
        };

        // Usamos addDoc para que Firestore genere un ID único
        await addDoc(usersRef, adminUser);
        
        // Volvemos a ejecutar la consulta para obtener el usuario recién creado
        querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty) {
        toast({
            variant: "destructive",
            title: "Usuario no encontrado",
            description: "El usuario ingresado no existe. Por favor, verifícalo o regístrate.",
        });
        setIsLoading(false);
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const user = userDoc.data() as User;

      if (user.password === password) {
        // Almacenar datos de sesión
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userUsername', user.username);
        
        router.push('/dashboard');
        toast({
          title: `✅ ¡Bienvenido de nuevo, ${user.name || user.username}!`,
          description: 'Has iniciado sesión correctamente.',
        });

      } else {
        toast({
            variant: "destructive",
            title: "Contraseña incorrecta",
            description: "La contraseña no es correcta. Por favor, inténtalo de nuevo.",
        });
      }

    } catch (error) {
      console.error("Error authenticating user:", error);
      toast({
        variant: "destructive",
        title: "🔥 Error del sistema",
        description: "Ocurrió un error inesperado al intentar iniciar sesión. Intenta de nuevo.",
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
