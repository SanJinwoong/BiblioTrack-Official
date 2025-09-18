
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
import { getUsers } from '@/lib/supabase-functions';
import type { User } from '@/lib/types';

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
  const [users, setUsers] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
        setIsDataLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Error de Conexión",
          description: "No se pudieron cargar los datos de usuario.",
        });
        setIsDataLoading(false);
      }
    };

    loadUsers();
  }, [toast]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsAuthLoading(true);
    const { username, password } = values;

    // Use the state which is kept up-to-date by onSnapshot
    const user = users.find(u => u.username === username);

    if (!user) {
        toast({
            variant: "destructive",
            title: "Usuario no encontrado",
            description: "El usuario ingresado no existe. Por favor, verifícalo o regístrate.",
        });
        setIsAuthLoading(false);
        return;
    }

    if (user.password === password) {
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
    setIsAuthLoading(false);
  }
  
  const isButtonDisabled = isDataLoading || isAuthLoading;

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
                <Input placeholder="admin o matrícula" {...field} disabled={isDataLoading} />
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
                <Input type="password" placeholder="••••••••" {...field} disabled={isDataLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full mt-4" disabled={isButtonDisabled}>
          {isAuthLoading || isDataLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          {isDataLoading ? 'Cargando datos...' : (isAuthLoading ? 'Verificando...' : 'Entrar')}
        </Button>
      </form>
    </Form>
  );
}
