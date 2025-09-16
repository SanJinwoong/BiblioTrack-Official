
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
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
import { collection, onSnapshot } from 'firebase/firestore';

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
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailOrMatricula: '',
      password: '',
    },
  });
  
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });
    return () => unsubscribe();
  }, []);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { emailOrMatricula, password } = values;
    
    let potentialUsername = emailOrMatricula;
    if (matriculaRegex.test(emailOrMatricula)) {
      potentialUsername = `${emailOrMatricula}@alumnos.uat.edu.mx`;
    }

    const user = users.find(u => 
        (u.username === potentialUsername || u.email === potentialUsername) && 
        u.password === password
    );

    if (user) {
      localStorage.setItem('userRole', user.role);
      
      let displayUsername = user.username;
      if (user.role === 'client' && studentEmailRegex.test(user.username)) {
        displayUsername = user.username.split('@')[0];
      }
      localStorage.setItem('userUsername', displayUsername);
      
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
        <Button type="submit" size="lg" className="w-full mt-4">
          <LogIn className="mr-2 h-4 w-4" />
          Entrar
        </Button>
      </form>
    </Form>
  );
}
