
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
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';

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
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  useEffect(() => {
    // We just check if the seeder has finished by trying to get at least one user.
    // This is much lighter than subscribing to the whole collection.
    const checkSeeder = async () => {
        try {
            const q = query(collection(db, "users"));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                if (!querySnapshot.empty) {
                    setIsDataLoading(false);
                    unsubscribe(); // We got the confirmation, we can stop listening.
                } else {
                    setIsDataLoading(true);
                }
            });
        } catch (error) {
             console.error("Error checking for users: ", error);
             toast({
                variant: "destructive",
                title: "Error de Conexión",
                description: "No se pudieron verificar los datos iniciales.",
             });
             setIsDataLoading(false);
        }
    };

    checkSeeder();
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

    try {
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Usuario no encontrado",
                description: "El usuario ingresado no existe. Por favor, verifícalo o regístrate.",
            });
            setIsAuthLoading(false);
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data() as User;

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
            setIsAuthLoading(false);
        }

    } catch (error) {
        console.error("Error authenticating user: ", error);
        toast({
            variant: "destructive",
            title: "Error de Autenticación",
            description: "Ocurrió un problema al intentar iniciar sesión. Inténtalo de nuevo.",
        });
        setIsAuthLoading(false);
    }
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
